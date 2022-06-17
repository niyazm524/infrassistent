export type Metric = {
  id?: string;
  timestamp: number;
  data: MetricData;
  kind?: string;
};

export type MetricData = Record<string, any>;

export type MetricsExtractor = (extended?: boolean) => Promise<Metric[]>; // | Metric[];
