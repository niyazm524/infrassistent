<template>
  <q-carousel
    v-model="state.slide"
    swipeable
    arrows
    height="100px"
    class="bg-grey-1 border rounded-borders"
  >
    <q-carousel-slide
      v-for="(wc, wcKey) in widgetChunks"
      :key="wcKey"
      :name="wcKey"
      class="column no-wrap"
      style="padding-top: 8px !important; padding-bottom: 8px !important"
    >
      <div
        class="row fit justify-start items-center q-gutter-xs q-col-gutter no-wrap"
      >
        <q-img
          v-for="w in wc"
          :key="w.key"
          class="rounded-borders col-4 full-height cursor-pointer"
          :class="{
            'widget-selected': selected && selected === w.key,
          }"
          :src="w.pic"
          fit="contain"
          @click="selected = w.key"
        >
          <div
            class="absolute-bottom"
            style="padding-bottom: 8px !important; padding-top: 8px !important"
          >
            {{ w.humanName }}
          </div>
        </q-img>
      </div>
    </q-carousel-slide>
  </q-carousel>
</template>

<script lang="ts">
import { chunkArray } from 'src/shared/helpers/chunk-array';
import { computed, defineComponent, PropType, reactive } from 'vue';
import * as Widgets from './widgets';

export default defineComponent({
  name: 'WidgetGallery',
  props: {
    modelValue: {
      type: [String, null] as PropType<string | null | undefined>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const state = reactive({
      slide: 0,
    });
    const selected = computed({
      get: () => props.modelValue,
      set: (key) => emit('update:modelValue', key),
    });
    const widgetChunks = chunkArray(
      Object.entries(Widgets).map(([key, w]) => ({
        key,
        pic: w.meta?.pic,
        humanName: w.meta?.title,
      })),
      3
    );

    console.log(widgetChunks);

    return { state, widgetChunks, selected };
  },
});
</script>

<style scoped>
.widget-selected {
  box-shadow: 0px 0px 10px 4px rgba(0, 81, 142, 0.37);
}
</style>
