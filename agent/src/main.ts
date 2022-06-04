import * as sys from 'systeminformation';
import { newSocket } from './network';

(async () => {
  const socket = await newSocket();
  socket.on('metrics:gather', async (metric: keyof typeof sys, cb) => {
    // @ts-ignore
    const result = await sys[metric]?.();
    cb(result);
  });
})();
