import * as sys from 'systeminformation';
import { Metric, MetricsExtractor } from './types';
export * from './setup';

const addMetricMeta = <T extends Record<string, any>>(
  m: T,
  key?: string | ((m: T) => string)
): Metric => {
  return {
    timestamp: Date.now(),
    id: key ? (typeof key === 'string' ? m[key] : key(m)) : undefined,
    data: m,
  };
};

const counters = {
  docker: 0,
  fs: -1,
  disk: -1,
  cpu: 0,
  network: -1,
};

export const extractors: Record<string, MetricsExtractor> = {
  docker: async (extended = false): Promise<Metric[]> => {
    const metrics = await sys.dockerContainerStats();
    const timestamp = Date.now();
    if (extended) return;
    return metrics.map((m) => {
      return {
        id: m.id,
        data: {
          memPercent: m.memPercent,
          cpuPercent: m.cpuPercent,
          pids: m.pids,
          netIO: m.netIO,
          blockIO: m.blockIO,
        },
        timestamp,
      };
    });
  },

  fsSpace: async () => {
    const f = await sys.fsSize();
    return f.map((m) => addMetricMeta(m, 'fs'));
  },

  fs: async () => {
    const f = await sys.fsStats();
    counters.fs++;
    if (counters.fs === 0) {
      await new Promise((r) => setTimeout(r, 1000));
      return extractors.fs();
    }
    return [addMetricMeta(f)];
  },

  disk: async () => {
    const d = await sys.disksIO();
    counters.disk++;
    if (counters.disk === 0) {
      await new Promise((r) => setTimeout(r, 1000));
      return extractors.disk();
    }

    return [
      addMetricMeta({
        rSec: d.rIO_sec,
        wSec: d.wIO_sec,
        tSec: d.tIO_sec,
        rWaitPercent: d.rWaitPercent,
        wWaitPercent: d.wWaitPercent,
        tWaitPercent: d.tWaitPercent,
        ms: d.ms,
      }),
    ];
  },

  cpu: async (extended = false) => {
    const cpu = await sys.currentLoad();
    if (extended) return [addMetricMeta(cpu)];
    return [
      addMetricMeta({
        avgLoad: cpu.avgLoad,
        currentLoad: cpu.currentLoad,
        currentLoadIdle: cpu.currentLoadIdle,
        cpus: cpu.cpus.map((c) => c.load),
      }),
    ];
  },

  network: async () => {
    const net = await sys.networkStats();
    counters.network++;
    if (counters.network === 0) {
      await new Promise((r) => setTimeout(r, 1000));
      return extractors.network();
    }
    return net.map((n) => addMetricMeta(n, 'iface'));
  },

  inetLatency: async () => {
    const latency = await sys.inetLatency();
    return [addMetricMeta({ value: latency })];
  },
} as const;
