<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card
      class="q-dialog-plugin"
      style="width: 70vw !important; max-width: 70vw !important"
    >
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>Файлы</q-toolbar-title>
      </q-toolbar>
      <q-separator />
      <q-card-section class="q-pt-md">
        <q-form>
          <q-input
            v-model="state.name"
            label="Краткое имя"
            maxlength="10"
            outlined
            dense
          />
          <q-input v-model="state.path" label="Путь до файла" outlined dense />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn color="primary" label="ОК" @click="onOkClick" />
        <q-btn color="primary" label="Отмена" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useDialogPluginComponent } from 'quasar';
import { defineComponent, reactive } from 'vue';

export default defineComponent({
  name: 'FileViewerDialog',
  emits: [...useDialogPluginComponent.emits],
  setup() {
    const { dialogRef, onDialogOK, onDialogCancel, onDialogHide } =
      useDialogPluginComponent();
    const state = reactive({
      name: '',
      path: '',
    });

    const onOkClick = () => {
      onDialogOK({});
    };

    return { dialogRef, onDialogCancel, onDialogHide, onOkClick, state };
  },
});
</script>

<style scoped></style>
