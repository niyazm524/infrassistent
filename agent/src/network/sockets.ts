import * as os from 'os';
import { io } from 'socket.io-client';
import { uuid } from 'systeminformation';

export const newSocket = async () => {
  const sysInfo = await uuid();
  const socket = io('http://localhost:3004', {
    auth: { hostname: os.hostname(), id: sysInfo.os || 'undefined' },
  });
  socket.on('connect', () => {
    console.info('Connected to socket');
  });

  socket.on('connect_error', (err) => {
    console.warn(err);
  });

  socket.connect();

  const onTerminate = () => {
    socket.disconnect();
  };

  process.on('SIGINT', onTerminate);
  process.on('SIGTERM', onTerminate);

  return socket;
};
