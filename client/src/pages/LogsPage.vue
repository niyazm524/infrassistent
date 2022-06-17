<template>
  <q-page :style-fn="styleFn">
    <q-splitter
      v-model="state.splitter"
      class="full-height"
      unit="px"
      after-class="full-height"
      reverse
      :limits="[90, Infinity]"
    >
      <template #before>
        <q-card>
          <file-viewer />
        </q-card>
      </template>

      <template #after>
        <div
          class="flex flex-col flex-nowrap items-stretch full-width full-height justify-center overflow-hidden"
        >
          <q-tabs
            vertical
            switch-indicator
            class="flex-grow full-width"
            style="height: calc(100% - 42px)"
          >
            <q-tab name="mails" icon="mail" label="Mails" />
            <q-tab name="alarms" icon="alarm" label="Alarms" />
            <q-tab name="movies" icon="movie" label="Movies" />
          </q-tabs>

          <div class="flex-shrink full-width">
            <q-btn
              class="full-width"
              icon="settings"
              color="grey-4"
              text-color="black"
              style="height: 42px"
            >
              <q-menu anchor="bottom left" self="bottom right">
                <q-list style="min-width: 100px" class="bg-primary text-white">
                  <q-item
                    clickable
                    v-close-popup
                    @click="settings.onAddLogSource"
                  >
                    <q-item-section side
                      ><q-icon color="white" name="add"></q-icon
                    ></q-item-section>
                    <q-item-section>Добавить источник</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
      </template>
    </q-splitter>
  </q-page>
</template>

<script lang="ts">
import FileViewer from 'components/files/FileViewer.vue';
import NewLogSourceDialog from 'components/logs/NewLogSourceDialog.vue';
import { useQuasar } from 'quasar';
import { defineComponent, reactive } from 'vue';

export default defineComponent({
  name: 'LogsPage',
  components: { FileViewer },
  setup() {
    const quasar = useQuasar();
    const state = reactive({
      splitter: 92,
    });
    const styleFn = (offset: number) => {
      const height = offset ? `calc(100vh - ${offset}px)` : '100vh';
      return { height, maxHeight: height };
    };
    const settings = {
      onAddLogSource: () => {
        quasar.dialog({
          component: NewLogSourceDialog,
          componentProps: {},
        });
      },
    };
    return { state, styleFn, settings };
  },
});
</script>
