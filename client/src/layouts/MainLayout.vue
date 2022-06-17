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
          <q-icon
            v-if="!isSockConnected"
            class="q-ml-lg with-blinking"
            name="cloud_off"
            color="red-2"
            size="lg"
            ><q-tooltip class="bg-red text-white text-caption"
              >Соединение разорвано</q-tooltip
            ></q-icon
          >
          <q-icon
            v-else
            class="q-ml-lg"
            name="sensors"
            color="green-3"
            size="lg"
          />
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

    <q-drawer :mini="leftDrawerOpen" show-if-above bordered persistent>
      <q-list>
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          :mini="leftDrawerOpen"
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
import { sockApi } from 'src/shared/api/sock-api';

const linksList = [
  {
    title: 'Dashboard',
    caption: 'Виджеты статуса',
    icon: 'dashboard',
    link: '/',
    control: {
      key: 'edit',
      icon: 'edit',
    },
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
    const { isSockConnected } = sockApi._.useSocketConnectionState();

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
      refreshInterval: computed({
        get: () => agentsStore.refreshInterval,
        set: (val) => (agentsStore.refreshInterval = val),
      }),
      refreshIntervals: [
        { value: 5000, label: '5 секунд' },
        { value: 10000, label: '10 секунд' },
        { value: 30000, label: 'Пол минуты' },
        { value: 60000, label: '1 минута' },
      ],
      isSockConnected,
    };
  },
});
</script>

<style>
.with-blinking {
  animation: fadeinout 0.7s ease-in-out infinite alternate;
}
@keyframes fadeinout {
  0% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
