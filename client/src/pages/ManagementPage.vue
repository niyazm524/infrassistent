<template>
  <q-page class="q-pa-sm">
    <q-toolbar-title>
      <h5 class="text-h5 q-mt-sm q-mb-md">Система</h5>
    </q-toolbar-title>
    <os-info />
    <q-toolbar-title class="flex flex-nowrap justify-start items-center">
      <h5 class="text-h5 q-mt-sm q-mb-sm">Контейнеры</h5>
      <div class="q-ml-lg">
        <q-btn icon="filter_alt" round size="md" dense color="accent">
          <q-menu>
            <q-card>
              <q-card-section>
                <q-select
                  label="По активности"
                  v-model="state.filters.showAll"
                  :options="filterOptions.showAll"
                  emit-value
                  map-options
                  dense
                >
                </q-select>
              </q-card-section>
            </q-card>
          </q-menu>
        </q-btn>
      </div>
    </q-toolbar-title>
    <div class="row wrap q-gutter-lg items-start">
      <docker-container
        v-for="(container, idx) in state.containers"
        :key="idx"
        :container="container"
        class="col col-3"
        @update="onContainerUpdate()"
      />
      <div
        v-if="!state.containers?.length"
        class="text-grey-8 text-weight-light"
      >
        (нет элементов)
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import DockerContainer from 'components/DockerContainer.vue';
import OsInfo from 'components/OsInfo.vue';
import { useInterval } from 'src/composables/use-interval';
import { sockApi } from 'src/shared/api/sock-api';
import { socket } from 'src/shared/api/socket.instance';
import { agentsStore } from 'stores/agents';
import { defineComponent, reactive, watch } from 'vue';
import { DockerContainerData } from 'components/models';

export default defineComponent({
  name: 'ManagementPage',
  components: { OsInfo, DockerContainer },
  setup() {
    const state = reactive({
      containers: [] as DockerContainerData[],
      filters: {
        showAll: false,
      },
    });
    const { tickNow } = useInterval(() => {
      sockApi
        .rpc('request:sys-info', {
          metric: 'dockerContainers',
          params: [state.filters.showAll],
        })
        .then((obj: DockerContainerData[]) => {
          if (obj && Array.isArray(obj)) state.containers = obj;
        });
    });
    watch(state.filters, () => tickNow());
    return {
      state,
      filterOptions: {
        showAll: [
          { label: 'Только активные', value: false },
          { label: 'Все', value: true },
        ],
      },
      onContainerUpdate: tickNow,
    };
  },
});
</script>
