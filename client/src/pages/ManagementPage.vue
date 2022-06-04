<template>
  <q-page class="q-pa-sm">
    <h5 class="text-h5 q-mt-sm q-mb-md">Система</h5>
    <os-info />
    <h5 class="text-h5 q-mt-sm q-mb-md">Контейнеры</h5>
    <div class="row wrap q-gutter-lg items-start">
      <docker-container
        v-for="(container, idx) in state.containers"
        :key="idx"
        :container="container"
        class="col col-3"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
import DockerContainer from 'components/DockerContainer.vue';
import OsInfo from 'components/OsInfo.vue';
import { useInterval } from 'src/composables/use-interval';
import { socket } from 'src/shared/api/socket.instance';
import { agentsStore } from 'stores/agents';
import { defineComponent, reactive } from 'vue';
import { DockerContainerData } from 'components/models';

export default defineComponent({
  name: 'ManagementPage',
  components: { OsInfo, DockerContainer },
  setup() {
    const state = reactive({
      containers: [] as DockerContainerData[],
    });
    useInterval(() => {
      socket.emit(
        'request:sys-info',
        {
          agent: agentsStore.currentAgentId,
          metric: 'dockerContainers',
        },
        (obj: DockerContainerData[]) => {
          if (obj && Array.isArray(obj)) state.containers = obj;
        }
      );
    });
    return { state };
  },
});
</script>
