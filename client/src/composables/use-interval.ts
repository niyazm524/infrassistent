import { agentsStore } from 'stores/agents';
import { watch } from 'vue';
import Timeout = NodeJS.Timeout;

export function useInterval(handler: () => void) {
  let refreshInterval: null | Timeout = null;
  watch(
    () => agentsStore.refreshInterval,
    (interval) => {
      setTimeout(handler, 10);
      if (refreshInterval) clearInterval(refreshInterval);
      refreshInterval = setInterval(handler, interval);
    },
    { immediate: true }
  );
}
