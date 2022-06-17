import * as os from 'os';
import { io } from 'socket.io-client';
import { settings } from '../settings';

export const newSocket = async () => {
  const socket = io(settings.account.url, {
    auth: { hostname: os.hostname(), id: settings.account.id || 'undefined' },
  });
  socket.on('connect', () => {
    console.info('Connected to socket');
  });

  socket.on('connect_error', (err) => {
    console.warn(err.name + ': ' + err.message);
  });

  socket.connect();

  const onTerminate = () => {
    socket.disconnect();
  };

  process.on('SIGINT', onTerminate);
  process.on('SIGTERM', onTerminate);

  return socket;
};
