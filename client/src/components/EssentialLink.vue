<template>
  <q-item clickable tag="a" exact :to="link">
    <q-tooltip v-if="mini" class="bg-primary text-lg">{{ title }}</q-tooltip>
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
    <q-item-section side v-if="control && route.path === link">
      <q-btn
        flat
        dense
        round
        :icon="control.icon"
        :class="{ 'bg-blue-2': route.query?.[control.key] === 'active' }"
        @click.stop.prevent="onSwitch"
      />
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'EssentialLink',
  props: {
    mini: Boolean,
    title: {
      type: String,
      required: true,
    },

    caption: {
      type: String,
      default: '',
    },

    link: {
      type: String,
      default: '#',
    },

    icon: {
      type: String,
      default: '',
    },

    control: {
      type: Object as PropType<{ key: string; icon: string }>,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const onSwitch = () => {
      router.replace({
        ...route,
        query: {
          ...route.query,
          [props.control.key]:
            route.query?.[props.control.key] === 'active'
              ? undefined
              : 'active',
        },
      });
    };
    return { route, onSwitch };
  },
});
</script>
