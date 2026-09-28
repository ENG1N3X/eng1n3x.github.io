import {
  splitSections,
  extractBucketSections,
  analyzeRows,
  pickIndexField,
  buildTrendData,
} from "./analyze.js";
import { SAMPLE_DATA } from "./sample-data.js";
import FieldCard from "./field-card.js";
import TrendChart from "./trend-chart.js";

const { createApp, reactive, ref, computed } = Vue;

const MAX_SIZE = 5 * 1024 * 1024;

const App = {
  components: { FieldCard, TrendChart },
  setup() {
    const view = ref("input"); // 'input' | 'dashboard'
    const activeTab = ref("upload"); // 'upload' | 'paste'
    const pasteText = ref("");
    const error = ref("");
    const dragActive = ref(false);
    const fileMetaText = ref("");
    const fileInputRef = ref(null);

    const state = reactive({
      meta: [], // [[key, value], ...] — скалярные top-level поля
      sections: [], // [{ key, fields, rowCount }] — один раздел на каждый массив/объект
    });

    const totalFields = computed(() =>
      state.sections.reduce((s, sec) => s + sec.fields.length, 0)
    );

    function selectTab(tab) {
      activeTab.value = tab;
      error.value = "";
    }

    function clearError() {
      error.value = "";
    }

    function loadJson(text, metaLabel) {
      clearError();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        error.value = `Не удалось разобрать JSON: ${err.message}`;
        return;
      }

      let split;
      try {
        // Ответы Elasticsearch/Kibana/OpenSearch оборачивают данные в
        // конверт (took, _shards, hits) вокруг агрегаций-buckets — сами
        // по себе через splitSections они превратились бы в один
        // бесполезный "профиль" со свалкой вложенных полей. Если такая
        // форма найдена где-то в дереве — используем её вместо обычного
        // разбора: конверт содержит не строки данных и естественно уйдёт.
        const bucketSections = extractBucketSections(data);
        split = bucketSections.length > 0 ? { sections: bucketSections, meta: [] } : splitSections(data);
      } catch (err) {
        error.value = `Не удалось разобрать структуру данных: ${err.message}`;
        return;
      }

      const sections = split.sections
        .map((s) => {
          const fields = analyzeRows(s.rows);
          const indexField = s.rows.length > 1 ? pickIndexField(fields) : null;
          const seriesFields = indexField
            ? fields.filter((f) => f.type === "number" && f.key !== indexField.key)
            : [];

          // Индексное поле (дата/id) и так становится осью X тренда —
          // отдельная карточка с "графиком" из одних единиц не нужна.
          const cardFields = indexField ? fields.filter((f) => f.key !== indexField.key) : fields;

          const trend =
            indexField && seriesFields.length > 0
              ? { indexLabel: indexField.key, ...buildTrendData(s.rows, indexField, seriesFields) }
              : null;

          return { key: s.key, fields: cardFields, rowCount: s.rows.length, trend };
        })
        .filter((s) => s.fields.length > 0 || s.trend);

      if (sections.length === 0) {
        error.value = "В данных не найдено полей для отображения.";
        return;
      }

      state.meta = split.meta;
      state.sections = sections;
      fileMetaText.value = metaLabel || "";
      view.value = "dashboard";
    }

    function triggerFileSelect() {
      fileInputRef.value?.click();
    }

    function handleFile(file) {
      clearError();
      if (file.size > MAX_SIZE) {
        error.value = `Файл слишком большой (${(file.size / 1024 / 1024).toFixed(1)} МБ). Лимит — 5 МБ, графики могут тормозить.`;
      }
      const reader = new FileReader();
      reader.onload = () =>
        loadJson(String(reader.result), `${file.name} · ${(file.size / 1024).toFixed(1)} КБ`);
      reader.onerror = () => {
        error.value = "Не удалось прочитать файл.";
      };
      reader.readAsText(file);
    }

    function onFileInputChange(e) {
      const file = e.target.files[0];
      if (file) handleFile(file);
    }

    function onDrop(e) {
      dragActive.value = false;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    }

    function parsePaste() {
      const text = pasteText.value.trim();
      if (!text) {
        error.value = "Вставь JSON перед тем как нажать кнопку.";
        return;
      }
      loadJson(text, "вставленный JSON");
    }

    function loadExample() {
      loadJson(JSON.stringify(SAMPLE_DATA), "пример данных");
    }

    function reset() {
      view.value = "input";
      clearError();
      fileMetaText.value = "";
      if (fileInputRef.value) fileInputRef.value.value = "";
    }

    return {
      view,
      activeTab,
      pasteText,
      error,
      dragActive,
      fileMetaText,
      fileInputRef,
      state,
      totalFields,
      selectTab,
      onFileInputChange,
      onDrop,
      triggerFileSelect,
      parsePaste,
      loadExample,
      reset,
    };
  },
  template: `
    <div>
      <header class="topbar">
        <h1>JSON Graphs Viewer</h1>
        <p class="subtitle">Загрузи любой JSON — получи графики и статистику</p>
      </header>

      <section v-if="view === 'input'" class="panel">
        <div class="tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'upload' }"
            @click="selectTab('upload')"
          >Загрузить файл</button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'paste' }"
            @click="selectTab('paste')"
          >Вставить код</button>
        </div>

        <div v-show="activeTab === 'upload'">
          <div
            class="dropzone"
            :class="{ dragover: dragActive }"
            @dragenter.prevent="dragActive = true"
            @dragover.prevent="dragActive = true"
            @dragleave.prevent="dragActive = false"
            @drop.prevent="onDrop"
          >
            <p>Перетащи JSON-файл сюда</p>
            <p class="or">или</p>
            <button class="btn" @click="triggerFileSelect">Выбрать файл</button>
            <input
              type="file"
              accept=".json,application/json"
              hidden
              ref="fileInputRef"
              @change="onFileInputChange"
            >
          </div>
        </div>

        <div v-show="activeTab === 'paste'">
          <textarea
            class="textarea"
            v-model="pasteText"
            placeholder='{"example": "вставь свой JSON сюда"}'
          ></textarea>
          <button class="btn" @click="parsePaste">Показать графики</button>
        </div>

        <div class="input-footer">
          <button class="btn-link" @click="loadExample">Открыть пример</button>
          <span class="file-meta">{{ fileMetaText }}</span>
        </div>

        <div v-if="error" class="error-box">{{ error }}</div>
      </section>

      <section v-else>
        <div class="dashboard-header">
          <button class="btn-link" @click="reset">← Загрузить другой JSON</button>
          <div class="summary-bar">
            <span>Разделов: <b>{{ state.sections.length }}</b></span>
            <span>Полей всего: <b>{{ totalFields }}</b></span>
          </div>
        </div>

        <div v-if="state.meta.length" class="cards-grid meta-grid">
          <div v-for="[key, value] in state.meta" :key="key" class="card meta-card">
            <div class="meta-value">{{ String(value) }}</div>
            <div class="meta-key">{{ key }}</div>
          </div>
        </div>

        <div v-for="section in state.sections" :key="section.key ?? '_root'" class="section-block">
          <div v-if="section.key" class="section-header">
            <h2>{{ section.key }}</h2>
            <span class="section-meta">записей: {{ section.rowCount }} · полей: {{ section.fields.length }}</span>
          </div>
          <div class="cards-grid">
            <TrendChart
              v-if="section.trend"
              :index-label="section.trend.indexLabel"
              :labels="section.trend.labels"
              :series="section.trend.series"
            />
            <FieldCard v-for="field in section.fields" :key="field.key" :field="field" />
          </div>
        </div>
      </section>
    </div>
  `,
};

createApp(App).mount("#app");
