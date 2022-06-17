import * as sys from 'systeminformation';
import { FilesService } from './files/files.service';
import { LogSourceSerialized, pipeLog } from './logs';
import { setupMetrics, extractors } from './metrics';
import { newSocket } from './network';
import * as executors from './executors';
import { settings } from './settings';
import { addOnExitListener } from './utils';

(async () => {
  await settings.$.load();
  const socket = await newSocket();

  socket.on('metrics:gather', async (metric: keyof typeof sys, params: any[], cb) => {
    // console.log(metric, params);
    // @ts-ignore
    const result = await sys[metric]?.(...params);
    cb(result);
  });

  socket.on(
    'execute',
    async (params: { executor: 'shell'; buffered: true; command: string; args?: string[] }, cb) => {
      executors[params.executor]?.bufferedRun(params.command, params.args || undefined).then(cb);
    }
  );

  socket.on('fs:readdir', ({ path }: { path: string }, cb) => {
    FilesService.readDir(path)
      .catch((err) => {
        console.error(err);
        return { isError: true, message: err.message, name: err.name };
      })
      .then(cb);
  });
  let emitMetricsSession: (() => void) | null = null;
  socket.on('metrics:setup', (config: { cacheSize?: number }) => {
    emitMetricsSession?.();
    emitMetricsSession = setupMetrics(extractors, {
      ...config,
      write: (items) => {
        return new Promise((resolve) => {
          socket.emit('report:metrics', items, resolve);
        });
      },
    });
  });

  const logCloseables: Array<() => Promise<LogSourceSerialized>> = [];
  socket.on('logs:setup', (logSources: LogSourceSerialized[]) => {
    console.log(logSources);
    for (const logSource of logSources) {
      const close = pipeLog(
        logSource,
        (logs) =>
          new Promise((resolve) => {
            socket.emit('report:logs', { id: logSource.location, logs }, resolve);
          })
      );
      logCloseables.push(close);
    }
  });

  addOnExitListener(async () => {
    emitMetricsSession?.();
    console.log(await Promise.all(logCloseables.map((c) => c())));
    socket.close();
  });
})();
