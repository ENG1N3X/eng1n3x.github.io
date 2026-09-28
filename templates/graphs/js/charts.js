// Построение графиков Chart.js под конкретный тип поля.

const PALETTE = [
  "#4f6df5", "#f5924f", "#4fc0a0", "#e35d6a",
  "#a06ee3", "#e3c04f", "#4fa8e3", "#8bd450",
];

function colorAt(i) {
  return PALETTE[i % PALETTE.length];
}

function countBy(values) {
  const map = new Map();
  for (const v of values) {
    const key = Array.isArray(v) ? JSON.stringify(v) : v;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}

function topEntries(map, limit) {
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
  if (entries.length <= limit) return entries;
  const top = entries.slice(0, limit);
  const restCount = entries.slice(limit).reduce((s, [, c]) => s + c, 0);
  top.push(["другое", restCount]);
  return top;
}

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

export function numberStats(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  return { min, max, sum, avg };
}

// Подписи осей + "записей" в тултипе — без этого непонятно, что Y это
// количество строк с таким значением/диапазоном, а не само значение.
function countAxes(xLabel) {
  return {
    x: { title: { display: true, text: xLabel, font: { size: 10 } } },
    y: { title: { display: true, text: "записей", font: { size: 10 } }, ticks: { precision: 0 } },
  };
}

export function buildNumberChart(ctx, values, xLabel = "значение") {
  const unique = [...new Set(values)];
  if (unique.length <= 10) {
    const counts = countBy(values);
    const entries = [...counts.entries()].sort((a, b) => a[0] - b[0]);
    return new Chart(ctx, {
      type: "bar",
      data: {
        labels: entries.map(([v]) => String(v)),
        datasets: [{ label: "записей", data: entries.map(([, c]) => c), backgroundColor: colorAt(0) }],
      },
      options: { ...baseOptions, scales: countAxes(xLabel) },
    });
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const binCount = 8;
  const width = (max - min) / binCount || 1;
  const bins = new Array(binCount).fill(0);
  for (const v of values) {
    let idx = Math.floor((v - min) / width);
    if (idx >= binCount) idx = binCount - 1;
    if (idx < 0) idx = 0;
    bins[idx]++;
  }
  const labels = bins.map((_, i) => {
    const from = min + i * width;
    const to = min + (i + 1) * width;
    return `${from.toFixed(1)}–${to.toFixed(1)}`;
  });

  return new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ label: "записей", data: bins, backgroundColor: colorAt(0) }] },
    options: { ...baseOptions, scales: countAxes(`${xLabel} (диапазон)`) },
  });
}

function truncateLabel(str, max = 28) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

// Doughnut/pie не используют оси, но Chart.js всё равно резервирует под них
// x/y-скейлы по умолчанию; при тесной карточке + длинной легенде это может
// схлопнуть область кольца и вместо графика нарисовать пустые оси. Глушим явно.
const noScales = { scales: { x: { display: false }, y: { display: false } } };

export function buildCategoryChart(ctx, values) {
  const counts = countBy(values);
  const entries = topEntries(counts, 8);
  return new Chart(ctx, {
    type: "doughnut",
    data: {
      // Полные строки в легенде тесной карточки ломают её раскладку
      // (Chart.js не переносит текст) — обрезаем для отображения.
      labels: entries.map(([label]) => truncateLabel(String(label))),
      datasets: [{ data: entries.map(([, c]) => c), backgroundColor: entries.map((_, i) => colorAt(i)) }],
    },
    options: {
      ...baseOptions,
      ...noScales,
      plugins: { legend: { display: true, position: "bottom", labels: { boxWidth: 10, font: { size: 10 } } } },
    },
  });
}

export function buildBooleanChart(ctx, values) {
  const trueCount = values.filter((v) => v === true).length;
  const falseCount = values.length - trueCount;
  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["true", "false"],
      datasets: [{ data: [trueCount, falseCount], backgroundColor: [colorAt(0), colorAt(1)] }],
    },
    options: { ...baseOptions, ...noScales, plugins: { legend: { display: true, position: "bottom" } } },
  });
}

export function buildDateChart(ctx, values, xLabel = "дата") {
  const dates = values.map((v) => new Date(v)).filter((d) => !Number.isNaN(d.getTime()));
  const spanDays = dates.length
    ? (Math.max(...dates) - Math.min(...dates)) / 86400000
    : 0;
  // На коротком диапазоне (типично — суточные метрики за пару недель)
  // группировка по месяцам схлопывает всё в одну точку — берём дни.
  const byDay = spanDays <= 60;

  const buckets = new Map();
  for (const d of dates) {
    const key = byDay
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  const labels = [...buckets.keys()].sort();
  return new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "записей",
        data: labels.map((l) => buckets.get(l)),
        borderColor: colorAt(0),
        backgroundColor: colorAt(0) + "33",
        fill: true,
        tension: 0.25,
      }],
    },
    options: { ...baseOptions, scales: countAxes(xLabel) },
  });
}

export function buildArrayLengthChart(ctx, values, xLabel = "значение") {
  const lengths = values.map((v) => v.length);
  return buildNumberChart(ctx, lengths, `${xLabel}: длина массива`);
}

// Общий график-сравнение раздела: несколько числовых полей как линии
// на одной оси X (дата/категория-индекс). Клик по легенде скрывает
// серию — удобно, если масштабы полей сильно различаются.
export function buildTrendChart(ctx, labels, series) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: series.map((s, i) => ({
        label: s.label,
        data: s.data,
        borderColor: colorAt(i),
        backgroundColor: colorAt(i) + "22",
        spanGaps: true,
        tension: 0.25,
        pointRadius: 3,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { display: true, position: "top", labels: { boxWidth: 10, font: { size: 11 } } } },
      scales: { y: { beginAtZero: true } },
    },
  });
}

const CHART_BUILDERS = {
  number: (ctx, field) => buildNumberChart(ctx, field.values, field.key),
  category: (ctx, field) => buildCategoryChart(ctx, field.values),
  boolean: (ctx, field) => buildBooleanChart(ctx, field.values),
  date: (ctx, field) => buildDateChart(ctx, field.values, field.key),
  array: (ctx, field) => buildArrayLengthChart(ctx, field.values, field.key),
};

export function hasChartFor(type) {
  return type in CHART_BUILDERS;
}

export function buildChartForField(ctx, field) {
  const builder = CHART_BUILDERS[field.type];
  return builder ? builder(ctx, field) : null;
}
