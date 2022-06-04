<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          {{ APP_NAME }}
        </q-toolbar-title>
        <q-select
          v-model="refreshInterval"
          :options="refreshIntervals"
          dark
          :options-dark="false"
          label-color="white"
          label="Интервал"
          dense
          filled
          stack-label
          emit-value
          map-options
        >
          <template #prepend><q-icon name="update" /> </template>
        </q-select>
        <q-select
          class="q-ml-md"
          dark
          :options-dark="false"
          label-color="white"
          v-model="currentAgentId"
          option-value="id"
          option-label="hostname"
          emit-value
          map-options
          :options="agents"
          label="Агент"
          dense
          filled
          stack-label
        >
          <template #prepend><q-icon name="dns" /> </template>
        </q-select>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { agentsStore } from 'stores/agents';
import { computed, defineComponent, ref } from 'vue';
import EssentialLink from 'components/EssentialLink.vue';

const linksList = [
  {
    title: 'Dashboard',
    caption: 'Виджеты статуса',
    icon: 'dashboard',
    link: '/',
  },
  {
    title: 'Management',
    caption: 'Управление контейнерами',
    icon: 'inventory_2',
    link: '/management',
  },
  {
    title: 'Incidents',
    caption: 'Происшествия на серверах',
    icon: 'warning_amber',
    link: '/incidents',
  },
  {
    title: 'Logs',
    caption: 'Центр сбора и обработки логов',
    icon: 'text_snippet',
    link: '/logs',
  },
];

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink,
  },

  setup() {
    const leftDrawerOpen = ref(false);

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      currentAgentId: computed({
        get: () => agentsStore.currentAgentId,
        set: (val) => (agentsStore.currentAgentId = val),
      }),
      agents: computed(() => agentsStore.agents),
      refreshInterval: computed(() => agentsStore.refreshInterval),
      refreshIntervals: [
        { value: 5000, label: '5 секунд' },
        { value: 10000, label: '10 секунд' },
        { value: 30000, label: 'Пол минуты' },
        { value: 60000, label: '1 минута' },
      ],
    };
  },
});
</script>
