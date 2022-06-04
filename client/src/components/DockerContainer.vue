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
    <q-card-section class="q-pt-none">
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
            <div>
              <b>{{ view.name }}</b> {{ view.value }}
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <q-card-actions>
      <q-btn flat icon="terminal" color="black"></q-btn>
      <q-space />
      <q-btn flat icon="restart_alt" color="blue"></q-btn>
      <q-btn flat color="red" icon="stop"></q-btn>
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import { DockerContainerData } from 'components/models';
import { computed, defineComponent, PropType } from 'vue';

const badgesMap = {
  running: 'green-8',
} as const;

export default defineComponent({
  name: 'DockerContainer',
  props: {
    container: Object as PropType<DockerContainerData>,
  },
  setup(props) {
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
    return { badgesMap, containerView };
  },
});
</script>
