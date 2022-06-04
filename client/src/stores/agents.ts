import { socket } from 'src/shared/api/socket.instance';
import { reactive } from 'vue';

export const agentsStore = reactive<{
  agents: { id: string; hostname: string }[] | null;
  currentAgentId: string | null;
  refreshInterval: number;
}>({
  agents: null,
  currentAgentId: null,
  refreshInterval: 5000,
});

socket.on('update:agents', (agents: { id: string; hostname: string }[]) => {
  agentsStore.agents = agents;
  if (agents.length >= 1) {
    agentsStore.currentAgentId = agents[0].id;
  } else agentsStore.currentAgentId = null;
});
