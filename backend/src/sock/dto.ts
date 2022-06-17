export type Metric = {
  id?: string;
  timestamp: number;
  data: MetricData;
  kind?: string;
  agent?: string;
};

export type MetricData = Record<string, any>;

export type LogSourceSerialized = {
  type: 'file';
  location: string;
  position: number | null;
};
