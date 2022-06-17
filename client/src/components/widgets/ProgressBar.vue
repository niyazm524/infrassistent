<template>
  <!--  <div class="flex items-center justify-center no-wrap"></div>-->
  <q-circular-progress
    :value="parsedValue"
    :indeterminate="parsedValue === null"
    :thickness="0.2"
    :color="color"
    track-color="grey-2"
    size="70px"
    show-value
    class="q-ma-sm"
    style="width: 90%; height: 90%"
  >
    <span class="text-black">{{ label }}</span>
  </q-circular-progress>
</template>

<script lang="ts">
import pic from 'assets/widgets/ProgressBar.png';
import { getProperty } from 'dot-prop';
import { useInterval } from 'src/composables/use-interval';
import { sockApi } from 'src/shared/api/sock-api';
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'ProgressBar',
  meta: {
    title: 'Круговой прогресс',
    pic,
  },
  props: {
    kind: { type: String, required: true, label: 'Вид метрики' },
    prop: { type: String, required: true },
    label: { type: String, required: false },
    color: { type: String, default: 'teal' },
  },
  setup(props) {
    const value = ref<any | null>(null);

    const parsedValue = computed(() => {
      if (value.value == null) return null;
      return getProperty(value.value, props.prop, null);
    });
    useInterval(() => {
      sockApi
        .rpc('fetch:metrics', {
          kind: props.kind,
          size: 1,
        })
        .then((results) => {
          value.value = results.hits.hits?.[0]?._source;
        });
    });
    return { value, parsedValue };
  },
});
</script>

<style scoped></style>
