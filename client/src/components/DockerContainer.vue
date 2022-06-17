<template>
  <q-card>
    <q-card-section class="flex no-wrap items-center q-py-sm">
      <q-toolbar-title>{{ container.name }}</q-toolbar-title>
      <q-badge rounded :color="badgesMap[container.state] || 'primary'">
        <q-tooltip
          anchor="top right"
          self="bottom middle"
          :class="`bg-${badgesMap[container.state] || 'primary'}`"
          >{{ container.state }}</q-tooltip
        >
      </q-badge>
    </q-card-section>
    <q-separator />
    <q-card-section class="q-pt-none overflow-hidden">
      <q-list separator>
        <q-item
          class="q-px-none"
          v-for="(view, idx) in containerView"
          :key="idx"
        >
          <q-item-section class="col-shrink items-center">
            <q-icon :name="view.icon" size="18px" />
          </q-item-section>
          <q-item-section>
            <div class="flex align-middle justify-start full-width">
              <b class="flex-shrink">{{ view.name }}</b>
              <span
                class="flex-grow overflow-hidden full-width q-pr-md"
                style="white-space: nowrap"
                >{{ view.value }}</span
              >
              <q-tooltip v-if="view.value">{{ view.value }}</q-tooltip>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <q-card-actions>
      <q-btn flat icon="terminal" color="black"></q-btn>
      <q-space />
      <q-btn
        flat
        icon="restart_alt"
        color="blue"
        :disable="state.actionInProgress != null"
        :loading="state.actionInProgress === 'restart'"
        @click="runAction('restart')"
      ></q-btn>
      <q-btn
        v-if="container.state === 'running'"
        flat
        color="red"
        icon="stop"
        :disable="state.actionInProgress != null"
        :loading="state.actionInProgress === 'stop'"
        @click="runAction('stop')"
      ></q-btn>
      <q-btn
        v-if="container.state === 'exited'"
        flat
        color="green"
        icon="play_arrow"
        :disable="state.actionInProgress != null"
        :loading="state.actionInProgress === 'start'"
        @click="runAction('start')"
      ></q-btn>
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import { DockerContainerData } from 'components/models';
import { sockApi } from 'src/shared/api/sock-api';
import { computed, defineComponent, PropType, reactive } from 'vue';

const badgesMap = {
  running: 'green-8',
  exited: 'grey-7',
} as const;

type ActionTypes = 'start' | 'stop' | 'restart';

export default defineComponent({
  name: 'DockerContainer',
  props: {
    container: Object as PropType<DockerContainerData>,
  },
  emits: ['update'],
  setup(props) {
    const state = reactive({
      actionInProgress: null as ActionTypes | null,
    });
    const ports = computed(
      () =>
        props.container?.ports
          .filter((port) => port.PublicPort)
          .map(
            ({ IP, PublicPort, PrivatePort, Type }) =>
              `${IP ? IP + ':' : ''}${PublicPort}:${PrivatePort}/${Type}`
          ) || []
    );
    const containerView = computed(
      () =>
        [
          { name: 'Образ', icon: 'stream', value: props.container?.image },
          {
            name: 'Порты',
            icon: 'settings_input_component',
            value: ports.value.join(', '),
          },
          {
            name: 'Время запуска',
            icon: 'play_circle_outline',
            value: props.container?.startedAt
              ? new Date(Date.parse(props.container.startedAt)).toLocaleString()
              : '-',
          },
        ] as const
    );
    const runAction = (action: ActionTypes) => {
      if (!props.container) return;
      state.actionInProgress = action;
      sockApi
        .rpc('control:docker', {
          container: props.container.id,
          op: action,
        })
        .finally(() => (state.actionInProgress = null));
    };
    return { badgesMap, containerView, state, runAction };
  },
});
</script>
