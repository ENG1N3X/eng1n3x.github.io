import { hasChartFor, buildChartForField, numberStats } from "./charts.js";

const { ref, computed, onMounted, onBeforeUnmount } = Vue;

export default {
  name: "FieldCard",
  props: {
    field: { type: Object, required: true },
  },
  setup(props) {
    const canvasRef = ref(null);
    let chart = null;

    const baseStats = computed(() => {
      const parts = [`n: ${props.field.total}`, `уник.: ${props.field.unique}`];
      if (props.field.missing > 0) parts.push(`пропущ.: ${props.field.missing}`);
      return parts;
    });

    const numStats = computed(() => {
      if (props.field.type !== "number") return null;
      const s = numberStats(props.field.values);
      return { min: s.min, max: s.max, avg: s.avg.toFixed(2) };
    });

    const arrayStats = computed(() => {
      if (props.field.type !== "array") return null;
      const s = numberStats(props.field.values.map((v) => v.length));
      return { min: s.min, max: s.max, avg: s.avg.toFixed(1) };
    });

    const topText = computed(() => {
      if (props.field.type !== "text") return [];
      const counts = new Map();
      for (const v of props.field.values) counts.set(v, (counts.get(v) || 0) + 1);
      return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    });

    const showChart = computed(() => hasChartFor(props.field.type));
    const showFallback = computed(
      () => !showChart.value && props.field.type !== "text"
    );

    onMounted(() => {
      if (showChart.value && canvasRef.value) {
        chart = buildChartForField(canvasRef.value.getContext("2d"), props.field);
      }
    });

    onBeforeUnmount(() => {
      if (chart) chart.destroy();
    });

    return { canvasRef, baseStats, numStats, arrayStats, topText, showChart, showFallback };
  },
  template: `
    <div class="card">
      <div class="card-header">
        <span class="card-title">{{ field.key }}</span>
        <span class="card-badge">{{ field.type }}</span>
      </div>

      <div class="card-stats">
        <span v-for="s in baseStats" :key="s">{{ s }}</span>
        <template v-if="numStats">
          <span>min: {{ numStats.min }}</span>
          <span>max: {{ numStats.max }}</span>
          <span>avg: {{ numStats.avg }}</span>
        </template>
        <template v-if="arrayStats">
          <span>длина min: {{ arrayStats.min }}</span>
          <span>длина max: {{ arrayStats.max }}</span>
          <span>длина avg: {{ arrayStats.avg }}</span>
        </template>
      </div>

      <div v-if="showChart" class="card-canvas-wrap">
        <canvas ref="canvasRef"></canvas>
      </div>

      <div v-else-if="field.type === 'text'" class="text-list">
        <div v-for="[val, count] in topText" :key="val" class="text-list-row">
          <span class="val">{{ val }}</span>
          <span class="cnt">{{ count }}</span>
        </div>
      </div>

      <div v-else-if="showFallback" class="text-list">
        Смешанный или пустой тип — график недоступен
      </div>
    </div>
  `,
};
