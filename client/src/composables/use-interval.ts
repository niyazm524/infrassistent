import { sockApi } from 'src/shared/api/sock-api';
import { agentsStore } from 'stores/agents';
import { onBeforeUnmount, watch } from 'vue';
import Timeout = NodeJS.Timeout;

export function useInterval(handler: () => void, skipFirst = false) {
  let refreshInterval: null | Timeout = null;
  const setupInterval = (interval = agentsStore.refreshInterval) => {
    if (!sockApi._.getSocket().connected) return;
    if (!skipFirst) setTimeout(handler, 10);
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(handler, interval);
  };

  const pauseTicks = () => refreshInterval && clearInterval(refreshInterval);

  watch(
    () => agentsStore.refreshInterval,
    (interval) => {
      setupInterval(interval);
    },
    { immediate: true }
  );

  sockApi._.getSocket()
    .on('disconnect', pauseTicks)
    .on('connect', setupInterval);

  onBeforeUnmount(() => {
    sockApi._.getSocket()
      .off('disconnect', pauseTicks)
      .off('connect', setupInterval);
    pauseTicks();
  });

  return { tickNow: setupInterval, pauseTicks };
}
