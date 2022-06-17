<template>
  <line-chart
    v-if="state.records.length"
    :chartData="metricsData"
    :options="chartOptions"
    :styles="{ 'max-height': '100%', 'min-height': '100%' }"
  />
</template>

<script lang="ts">
import { useInterval } from 'src/composables/use-interval';
import { sockApi } from 'src/shared/api/sock-api';
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  reactive,
  watch,
} from 'vue';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { ru } from 'date-fns/locale';
import { LineChart } from 'vue-chart-3';
Chart.register(...registerables);
import pic from 'assets/widgets/LineGraph.png';

const prefix = ''; /*'_source.'*/

export default defineComponent({
  name: 'LineChartWidget',
  meta: {
    title: 'График',
    pic,
  },
  components: { LineChart },
  props: {
    kind: { type: String, required: true },
    charts: {
      type: Array as PropType<
        { prop: string; label: string; color?: string }[]
      >,
      required: true,
    },
  },
  setup(props) {
    const state = reactive({
      records: [] as any[],
    });
    const chartOptions = computed(() => {
      return {
        maintainAspectRatio: false,
        parsing: {
          xAxisKey: `${prefix}${/*'@timestamp'*/ 'key_as_string'}`,
        },
        scales: {
          x: {
            type: 'time',
            unit: 'month',
            min: state.records[0]?.['key_as_string'],
            adapters: {
              date: { locale: ru },
            },
            time: {
              displayFormats: { minute: 'H:mm' },
            },
          },
          y: { max: 100, min: 0 },
        },
      };
    });
    const metricsData = computed(() => {
      return {
        labels: props.charts.map((chart) => chart.label),
        datasets: props.charts.map((chart) => ({
          label: chart.label,
          data: state.records,
          borderColor: chart.color || '#77CEFF',
          // yAxisID: chart.prop,
          parsing: {
            yAxisKey: `${chart.prop}`,
          },
        })),
      };
    });
    const { isSockConnected } = sockApi._.useSocketConnectionState();
    const initialLoad = async () => {
      sockApi.rpc('fetch:metrics', { kind: props.kind }).then((results) => {
        state.records = results?.aggregations?.grouped?.buckets;
        console.log(results);
      });
    };
    let watcher: (() => void) | null = null;
    watcher = watch(
      isSockConnected,
      (isConnected) => {
        if (!isConnected) return;
        initialLoad();
        watcher?.();
      },
      { immediate: true }
    );

    const update = async () => {
      if (!state.records.length) return;
      sockApi
        .rpc('fetch:metrics', {
          kind: props.kind,
          after: state.records[state.records.length - 1]._source.timestamp,
        })
        .then((results) => {
          state.records.push(...results.hits.hits);
        });
    };

    useInterval(update, true);

    return { state, metricsData, chartOptions };
  },
});
</script>

<style scoped></style>
