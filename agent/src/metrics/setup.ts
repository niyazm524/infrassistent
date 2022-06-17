import { Metric, MetricsExtractor } from './types';

type SetupMetricsConfig = {
  write: (records: Metric[]) => Promise<void>;
  cacheSize?: number;
};

export function setupMetrics(
  extractors: Record<string, MetricsExtractor>,
  config: SetupMetricsConfig
) {
  let alive = true;
  let buffered: Metric[] = [];
  const intervals: Record<string, NodeJS.Timer> = {};
  const waterFlow = Object.keys(extractors).length;
  for (const metricName of Object.keys(extractors)) {
    intervals[metricName] = setInterval(async () => {
      const m: Metric[] = await extractors[metricName]().catch(() => null);
      if (!alive) return;
      if (!m) {
        clearInterval(intervals[metricName]);
        intervals[metricName] = null;
        return;
      }
      m.forEach((_m) => _m && (_m.kind = metricName));
      buffered.push(...m);
      if (buffered.length > waterFlow) {
        config.write(buffered).catch((err) => buffered.unshift(...err.items));
        buffered = [];
      }
    }, 10000);
  }

  return () => {
    alive = false;
    buffered = [];
    Object.values(intervals)
      .filter(Boolean)
      .forEach((t) => clearInterval(t));
  };
}
