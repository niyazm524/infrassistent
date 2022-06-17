<template>
  <q-dialog
    :model-value="isOpen"
    @update:model-value="$emit('update:isOpen', $event)"
    seamless
    position="bottom"
  >
    <q-card style="width: 800px; margin-left: 300px; max-width: 800px" bordered>
      <div class="flex items-center q-pl-md q-pt-xs">
        <div class="text-h6">Режим добавления</div>
        <q-space />
        <q-btn
          :icon="`expand_${!isExpanded ? 'less' : 'more'}`"
          flat
          round
          @click="isExpanded = !isExpanded"
        />
        <q-btn icon="close" flat round @click="$emit('update:isOpen', false)" />
      </div>
      <q-separator />
      <q-slide-transition>
        <q-stepper
          v-model="step"
          animated
          header-nav
          color="primary"
          v-show="isExpanded"
          flat
        >
          <q-step title="Выбор виджета" name="widget-select" icon="widgets">
            <widget-gallery v-model="state.widgetKey" />
          </q-step>
          <q-step title="Предпочтения" name="widget-setup" icon="settings">
            <div>not ready yet</div>
          </q-step>
          <q-step title="Превью" name="preview" icon="eye">
            <div
              :data-width="2"
              :data-height="4"
              @dragstart="$emit('dragstart', $event)"
              @drag="$emit('drag', $event)"
              @dragend="$emit('dragend', $event)"
              class="droppable-element"
              draggable="true"
              unselectable="on"
            >
              Droppable Element (Drag me!)
            </div>
          </q-step>
        </q-stepper>
      </q-slide-transition>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import WidgetGallery from 'components/WidgetGallery.vue';
import { defineComponent, reactive, ref } from 'vue';

export default defineComponent({
  name: 'DashboardEditor',
  components: { WidgetGallery },
  props: {
    isOpen: Boolean,
  },
  emits: ['update:isOpen', 'dragstart', 'drag', 'dragend'],
  setup() {
    const isExpanded = ref(false);
    const step = ref('widget-select');
    const state = reactive({
      widgetKey: null as string | null,
    });
    return { isExpanded, step, state };
  },
});
</script>

<style>
.droppable-element {
  width: 150px;
  text-align: center;
  background: #fdd;
  border: 1px solid black;
  margin: 10px 0;
  padding: 10px;
}
.q-stepper__step-inner {
  padding: 8px 16px !important;
}
</style>
