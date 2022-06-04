<template>
  <q-expansion-item :default-opened="false">
    <template #header>
      <q-item-section
        >{{ osData?.hostname }} ({{ osData?.arch }})</q-item-section
      >
    </template>
  </q-expansion-item>
</template>

<script lang="ts">
import { OsData } from 'components/models';
import { socket } from 'src/shared/api/socket.instance';
import { agentsStore } from 'stores/agents';
import { computed, defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'OsInfo',
  props: {
    agent: String,
  },
  setup(props) {
    const osData = ref<OsData | null>();
    const agentKey = computed(() => props.agent ?? agentsStore.currentAgentId);
    watch(
      agentKey,
      (agent) => {
        socket.emit(
          'request:sys-info',
          { agent, metric: 'osInfo' },
          (info: OsData) => {
            osData.value = info;
            console.log(info);
          }
        );
        socket.emit(
          'request:sys-info',
          { agent, metric: 'time' },
          (info: OsData) => {
            osData.value = info;
            console.log(info);
          }
        );
      },
      { immediate: true }
    );
    return { osData };
  },
});
</script>
