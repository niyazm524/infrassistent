<template>
  <q-page>
    <div>
      <grid-layout
        ref="layoutRef"
        v-model:layout="layout"
        :col-num="12"
        :row-height="30"
        :is-draggable="isEditActive"
        :is-resizable="isEditActive"
        :vertical-compact="true"
        :use-css-transforms="true"
        :margin="[16, 16]"
      >
        <grid-item
          v-for="({ widget, props, ...item }, idx) in layout"
          v-bind="item"
          :key="item.i"
          :ref="applyRef(idx)"
        >
          <q-card class="full-width full-height">
            <component :is="widget" v-bind="props" />
          </q-card>
        </grid-item>
      </grid-layout>
    </div>

    <dashboard-editor
      v-model="isEditActive"
      @drag="layoutEvents.drag"
      @dragend="layoutEvents.dragEnd"
      @dragstart="layoutEvents.dragStart"
    />
  </q-page>
</template>

<script lang="ts">
import DashboardEditor from 'components/DashboardEditor.vue';
import * as widgets from 'components/widgets';
import { useDashNDrop } from 'src/composables/use-dash-n-drop';
import { GridItem, GridWidgetItem } from 'src/shared/types/dashboard';
import { computed, defineComponent, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// @ts-ignore
import VueGridLayout from 'vue3-grid-layout';

export default defineComponent({
  name: 'DashboardPage',
  components: {
    ...widgets,
    DashboardEditor,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const isEditActive = computed({
      get: () => route.query?.edit === 'active',
      set: (val: boolean) =>
        router.replace({
          ...route,
          query: { ...route.query, edit: val ? 'active' : undefined },
        }),
    });
    const layout = ref<GridWidgetItem[]>([
      {
        widget: 'LineChart',
        props: {
          kind: 'cpu',
          charts: [
            {
              prop: 'average.value',
              label: 'Current Load',
            },
            // { prop: 'data.currentLoadIdle', label: 'Idle', color: '#e57fff' },
          ],
        },
        x: 0,
        y: 0,
        w: 3,
        h: 5,
        minW: 2,
        minH: 4,
        i: '0',
      },
      {
        widget: 'ProgressBar',
        props: {
          kind: 'cpu',
          prop: 'data.currentLoad',
          label: 'CPU',
        },
        x: 4,
        y: 0,
        w: 2,
        h: 4,
        i: '1',
      },
    ]);

    watch(layout, (l) => console.log(l), { deep: true });

    // const layout = ref<GridItem[]>([
    //   { x: 0, y: 0, w: 2, h: 2, i: '0' },
    //   { x: 2, y: 0, w: 2, h: 4, i: '1' },
    //   { x: 4, y: 0, w: 2, h: 5, i: '2' },
    //   { x: 6, y: 0, w: 2, h: 3, i: '3' },
    //   { x: 8, y: 0, w: 2, h: 3, i: '4' },
    //   { x: 10, y: 0, w: 2, h: 3, i: '5' },
    //   { x: 0, y: 5, w: 2, h: 5, i: '6' },
    //   { x: 2, y: 5, w: 2, h: 5, i: '7' },
    //   { x: 4, y: 5, w: 2, h: 5, i: '8' },
    //   { x: 6, y: 3, w: 2, h: 4, i: '9' },
    // ]);

    const { layoutRef, applyRef, ...layoutEvents } = useDashNDrop(layout, 12);

    return { layout, isEditActive, layoutRef, layoutEvents, applyRef };
  },
});
</script>

<style>
.vue-grid-item.vue-grid-placeholder {
  background: red;
  opacity: 0.2;
  transition-duration: 100ms;
  z-index: 2;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
}
</style>
