type OnExitListener = (signal: string) => Promise<void> | void;

let isShuttingDown = false;
const listeners: Array<OnExitListener> = [];

export function addOnExitListener(listener: OnExitListener) {
  listeners.push(listener);
}

const shutdown = (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.info('Received graceful shutdown request');
  for (let i = 0; i < listeners.length; i++) {
    listeners.shift()(signal);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERN'));
process.on('SIGINT', () => shutdown('SIGINT'));
