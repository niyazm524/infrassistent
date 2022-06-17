import { markRaw } from 'vue';

export function useGradients() {
  const gradients = markRaw<
    Array<{
      width?: number;
      height?: number;
      gradient?: any;
    }>
  >([]);
  const setupGradient = (idx: number) => {
    if (!gradients[idx]) gradients[idx] = {};
    const g = gradients[idx];

    return function getGradient(context: any) {
      const chart = context.chart;
      const { ctx, chartArea } = chart;

      if (!chartArea) {
        // This case happens on initial chart load
        return null;
      }
      const chartWidth = chartArea.right - chartArea.left;
      const chartHeight = chartArea.bottom - chartArea.top;
      if (
        g.gradient === null ||
        g.width !== chartWidth ||
        g.height !== chartHeight
      ) {
        // Create the gradient because this is either the first render
        // or the size of the chart has changed
        g.width = chartWidth;
        g.height = chartHeight;

        g.gradient = ctx.createLinearGradient(
          0,
          chartArea.bottom,
          0,
          chartArea.top
        );
        g.gradient.addColorStop(0, '#0054d2');
        g.gradient.addColorStop(0.5, '#cab100');
        g.gradient.addColorStop(1, '#dc0000');
      }

      return g.gradient;
    };
  };
  return { setupGradient };
}
