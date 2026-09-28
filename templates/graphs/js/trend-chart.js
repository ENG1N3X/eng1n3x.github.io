import { buildTrendChart } from "./charts.js";

const { ref, onMounted, onBeforeUnmount } = Vue;

// Один общий график раздела: индексное поле (дата/категория) — ось X,
// остальные числовые поля — линии по оси Y. В отличие от FieldCard,
// здесь сравниваются РАЗНЫЕ поля друг с другом на одной оси, а не
// распределение значений одного поля.
export default {
  name: "TrendChart",
  props: {
    indexLabel: { type: String, required: true },
    labels: { type: Array, required: true },
    series: { type: Array, required: true },
  },
  setup(props) {
    const canvasRef = ref(null);
    let chart = null;

    onMounted(() => {
      chart = buildTrendChart(canvasRef.value.getContext("2d"), props.labels, props.series);
    });
    onBeforeUnmount(() => {
      if (chart) chart.destroy();
    });

    return { canvasRef };
  },
  template: `
    <div class="card trend-card">
      <div class="card-header">
        <span class="card-title">{{ indexLabel }} → {{ series.map(s => s.label).join(', ') }}</span>
        <span class="card-badge">сравнение</span>
      </div>
      <div class="card-canvas-wrap trend-canvas-wrap">
        <canvas ref="canvasRef"></canvas>
      </div>
    </div>
  `,
};
