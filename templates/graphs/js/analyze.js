// Универсальный анализ произвольного JSON: находим "строки" данных,
// разворачиваем вложенность и классифицируем каждое поле по типу.

const DATE_RE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?/;

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function looksLikeDate(str) {
  if (typeof str !== "string" || str.length < 8) return false;
  if (!DATE_RE.test(str)) return false;
  return !isNaN(Date.parse(str));
}

function flattenRow(obj, prefix = "") {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (isPlainObject(v)) {
      Object.assign(out, flattenRow(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

function normalizeRows(rows) {
  if (rows.every((r) => isPlainObject(r))) {
    return rows.map((r) => flattenRow(r));
  }
  return rows.map((r) => ({ value: r }));
}

function isBucketAgg(node) {
  return isPlainObject(node) && Array.isArray(node.buckets);
}

// "50.0" -> "p50", "99.9" -> "p99_9" — типичные ключи percentile-агрегаций.
function percentileSuffix(key) {
  return "p" + key.replace(/\.0$/, "").replace(".", "_");
}

function looksLikePercentileMap(obj) {
  const keys = isPlainObject(obj) ? Object.keys(obj) : [];
  return keys.length > 0 && keys.every((k) => /^\d+(\.\d+)?$/.test(k));
}

// Разворачивает один bucket агрегации (Elasticsearch/Kibana/OpenSearch:
// { key, key_as_string?, doc_count, ...метрики } ) в плоскую строку.
// Вложенную bucket-агрегацию внутри (напр. sub-aggregation по типу события)
// разворачивает в отдельные колонки — по одной на под-bucket.
function flattenBucket(bucket) {
  const row = {};
  const label = bucket.key_as_string ?? bucket.key;
  if (label !== undefined) row.key = label;
  if ("doc_count" in bucket) row.doc_count = bucket.doc_count;

  for (const [k, v] of Object.entries(bucket)) {
    if (k === "key" || k === "key_as_string" || k === "doc_count") continue;

    if (isBucketAgg(v)) {
      for (const sub of v.buckets) {
        const subLabel = sub.key_as_string ?? sub.key;
        if (subLabel !== undefined) row[String(subLabel)] = sub.doc_count;
      }
      continue;
    }

    if (isPlainObject(v) && looksLikePercentileMap(v.values)) {
      for (const [pk, pv] of Object.entries(v.values)) {
        row[`${k}_${percentileSuffix(pk)}`] = pv;
      }
      continue;
    }

    if (isPlainObject(v) && "value" in v) {
      row[k] = v.value;
      continue;
    }

    if (isPlainObject(v) || Array.isArray(v)) continue; // прочую вложенность не тянем
    row[k] = v;
  }
  return row;
}

// Ищет во всём дереве JSON узлы вида { buckets: [...] } — форма
// агрегаций Elasticsearch/Kibana/OpenSearch, но детект по форме, а не
// по конкретным именам ключей, так что ловит и произвольные похожие
// структуры. Каждый найденный узел превращается в раздел (массив строк);
// вглубь уже найденного узла не идём (его вложенные bucket-агрегации
// разворачиваются в колонки через flattenBucket). Остальной "конверт"
// ответа (took, _shards, hits и т.п.) не содержит рядов данных и
// естественным образом остаётся не найден — то есть отброшен.
export function extractBucketSections(data) {
  const sections = [];

  function walk(node, key) {
    if (isBucketAgg(node)) {
      const rows = node.buckets.map(flattenBucket).filter((r) => Object.keys(r).length > 0);
      if (rows.length > 0) sections.push({ key: key || "buckets", rows });
      return;
    }
    if (isPlainObject(node)) {
      for (const [k, v] of Object.entries(node)) {
        if (isPlainObject(v)) walk(v, k);
      }
    }
  }

  walk(data, null);
  return sections;
}

// Разбирает произвольный JSON на независимые "разделы" с данными:
// каждый top-level ключ-массив — свой набор строк, каждый top-level
// ключ-объект — набор из одной строки ("профиль"). Скалярные top-level
// поля уходят в meta (сводные карточки сверху). Так JSON с несколькими
// секциями (aggregations.daily_volume, aggregations.visits_ratio, ...)
// не теряет данные, выбирая "самый большой" массив — показываются все.
export function splitSections(data) {
  const sections = [];
  const meta = [];

  function addSection(key, rawRows) {
    sections.push({ key, rows: normalizeRows(rawRows) });
  }

  if (Array.isArray(data)) {
    addSection(null, data);
    return { sections, meta };
  }

  if (isPlainObject(data)) {
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        addSection(key, value);
      } else if (isPlainObject(value)) {
        addSection(key, [value]);
      } else {
        meta.push([key, value]);
      }
    }
    if (sections.length === 0) {
      // Плоский объект без вложенных структур — единственный "профиль".
      addSection(null, [data]);
      return { sections, meta: [] };
    }
    return { sections, meta };
  }

  addSection(null, [data]);
  return { sections, meta };
}

function classifyColumn(values) {
  const nonNull = values.filter((v) => v !== undefined && v !== null);
  const missing = values.length - nonNull.length;

  if (nonNull.length === 0) return { type: "empty", missing };

  if (nonNull.every((v) => typeof v === "number" && !Number.isNaN(v))) {
    return { type: "number", missing };
  }
  if (nonNull.every((v) => typeof v === "boolean")) {
    return { type: "boolean", missing };
  }
  if (nonNull.every((v) => Array.isArray(v))) {
    return { type: "array", missing };
  }
  if (nonNull.every((v) => typeof v === "string")) {
    const dateLikeCount = nonNull.filter(looksLikeDate).length;
    if (dateLikeCount / nonNull.length > 0.8) {
      return { type: "date", missing };
    }
    const unique = new Set(nonNull);
    const ratio = unique.size / nonNull.length;
    // Категория — только если значения реально повторяются: либо доля
    // уникальных низкая, либо небольшой словарь значений с умеренным повтором.
    // Поле, где почти каждое значение уникально (id, url, имя), должно
    // остаться текстом — иначе получим "круг" из 9 разных цветов на 9 строк.
    const isRepeating = ratio <= 0.5 || (unique.size <= 15 && ratio <= 0.7);
    if (isRepeating) {
      return { type: "category", missing };
    }
    return { type: "text", missing };
  }

  return { type: "mixed", missing };
}

// Ищет поле, пригодное как общая ось X для сравнения остальных числовых
// полей между собой: приоритет — дата, иначе текст/категория, уникальные
// на каждую строку (имя ресурса, id и т.п.). Без такой оси графики разных
// полей сравнивать бессмысленно — они просто про разные вещи.
export function pickIndexField(fields) {
  const dateField = fields.find((f) => f.type === "date");
  if (dateField) return dateField;

  const labelField = fields.find(
    (f) => (f.type === "text" || f.type === "category") && f.total > 1 && f.unique === f.total
  );
  return labelField || null;
}

// Готовит один общий график-сравнение для раздела: значения индексного
// поля — ось X (даты сортируются по времени), остальные числовые поля —
// по одной линии-серии на каждое, выровненные по тем же строкам.
export function buildTrendData(rows, indexField, seriesFields) {
  let ordered = rows;
  const isDate = indexField.type === "date";
  if (isDate) {
    ordered = [...rows].sort((a, b) => new Date(a[indexField.key]) - new Date(b[indexField.key]));
  }

  let labels;
  if (isDate) {
    // "2026-09-21T00:00:00.000Z" на оси X нечитаем — сокращаем до даты,
    // а время оставляем только если оно реально не нулевое хоть где-то.
    const dates = ordered.map((r) => new Date(r[indexField.key]));
    const hasTime = dates.some(
      (d) => !Number.isNaN(d.getTime()) && (d.getUTCHours() || d.getUTCMinutes() || d.getUTCSeconds())
    );
    labels = dates.map((d, i) => {
      if (Number.isNaN(d.getTime())) return String(ordered[i][indexField.key] ?? "—");
      const y = d.getUTCFullYear();
      const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
      const da = String(d.getUTCDate()).padStart(2, "0");
      if (!hasTime) return `${y}-${mo}-${da}`;
      const hh = String(d.getUTCHours()).padStart(2, "0");
      const mi = String(d.getUTCMinutes()).padStart(2, "0");
      return `${y}-${mo}-${da} ${hh}:${mi}`;
    });
  } else {
    labels = ordered.map((r) => String(r[indexField.key] ?? "—"));
  }
  const series = seriesFields.map((f) => ({
    key: f.key,
    label: f.key,
    data: ordered.map((r) => (typeof r[f.key] === "number" ? r[f.key] : null)),
  }));
  return { labels, series };
}

// Собирает по каждому полю: тип, все значения, базовую статистику.
export function analyzeRows(rows) {
  const keys = [];
  const seen = new Set();
  for (const row of rows) {
    for (const k of Object.keys(row)) {
      if (!seen.has(k)) {
        seen.add(k);
        keys.push(k);
      }
    }
  }

  return keys.map((key) => {
    const values = rows.map((row) =>
      Object.prototype.hasOwnProperty.call(row, key) ? row[key] : undefined
    );
    const { type, missing } = classifyColumn(values);
    const nonNull = values.filter((v) => v !== undefined && v !== null);
    return {
      key,
      type,
      total: values.length,
      missing,
      unique: new Set(nonNull.map((v) => (Array.isArray(v) ? JSON.stringify(v) : v))).size,
      values: nonNull,
    };
  });
}
