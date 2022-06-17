import { agentsStore } from 'stores/agents';
import { watch } from 'vue';

export function onAgentMounted(cb: (agent: string) => void) {
  let watcher: (() => void) | null = null;
  watcher = watch(
    () => agentsStore.currentAgentId,
    (id) => {
      if (!id) return;
      watcher?.();
      cb(id);
    },
    { immediate: true }
  );
}
