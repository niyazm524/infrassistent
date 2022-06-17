<template>
  <q-toolbar>
    <q-toolbar-title>
      <q-breadcrumbs separator="/">
        <span>/</span>
        <q-breadcrumbs-el
          v-for="(pathSegment, key) in state.currentPath"
          :key="key"
          :label="pathSegment"
          style="cursor: pointer"
          @click="onPathChange(key)"
        />
      </q-breadcrumbs>
    </q-toolbar-title>
  </q-toolbar>
  <q-separator />
  <q-table
    :loading="state.isLoading"
    :columns="table.columns"
    style="height: 600px"
    :rows="state.rows"
    row-key="index"
    virtual-scroll
    :selection="withSelection ? 'single' : 'none'"
    v-model:selected="state.selected"
    :rows-per-page-options="[0]"
    binary-state-sort
    @row-dblclick="onEnterFile"
    class="non-selectable"
  >
    <template v-slot:body-selection="scope">
      <q-checkbox
        v-model="scope.selected"
        :dark="scope.dark"
        :dense="scope.dense"
        :disable="scope.row.selectable === false"
      />
    </template>
    <template #body-cell-type="props">
      <q-td :props="props">
        <q-icon :name="getFileIcon(props.value)" size="18px" />
      </q-td>
    </template>
  </q-table>
</template>

<script lang="ts">
import { QTableProps } from 'quasar';
import { onAgentMounted } from 'src/composables/on-agent-mounted';
import { sockApi } from 'src/shared/api/sock-api';
import { humanFileSize } from 'src/shared/helpers/file-size';
import { computed, defineComponent, onMounted, reactive } from 'vue';

const sortOrder: Record<string, number> = {
  directory: 0,
  file: 1,
  link: 1,
  socket: 2,
};
const fileIcons: Record<string, string> = {
  directory: 'folder',
  file: 'description',
  link: 'link',
  socket: 'settings_input_component',
  unknown: 'question_mark',
};

const columns: QTableProps['columns'] = [
  {
    name: 'type',
    label: 'Тип',
    field: 'type',
    align: 'left',
    sort: (a: string, b: string) => {
      return sortOrder[a] - sortOrder[b];
    },
    sortOrder: 'ad',
    sortable: true,
    style: 'width: 70px',
  },
  {
    name: 'name',
    label: 'Имя',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'size',
    label: 'Размер',
    field: 'size',
    align: 'left',
    sortable: true,
    format: (size: number) => (size == null ? 'N/A' : humanFileSize(size)),
  },
  {
    name: 'mode',
    label: 'Права',
    field: 'mode',
    align: 'left',
    sortable: false,
  },
  {
    name: 'ctime',
    label: 'Создан',
    field: 'ctime',
    align: 'left',
    sortable: false,
    format: (val?: string) => (val ? new Date(val).toLocaleString() : ''),
  },
  {
    name: 'mtime',
    label: 'Изменен',
    field: 'mtime',
    align: 'left',
    sortable: false,
    format: (val?: string) => (val ? new Date(val).toLocaleString() : ''),
  },
];

const parentDirectoryItem = {
  name: '..',
  type: 'directory',
  selectable: false,
};

export default defineComponent({
  name: 'FileViewer',
  props: {
    withSelection: { type: Boolean, default: true },
  },
  setup() {
    const state = reactive({
      currentPath: [] as string[],
      files: [],
      isLoading: false,
      rows: [] as any[],
      selected: [] as any[],
    });
    const pathJoined = computed(() => '/' + state.currentPath.join('/'));
    const loadFiles = async (path = pathJoined.value) => {
      try {
        state.isLoading = true;
        const files: any[] = await sockApi.rpc('read:fs-dir', { path });
        if (path !== '/') files.unshift(parentDirectoryItem);
        files.forEach((row, index) => {
          row.index = index;
        });
        state.rows = files;
      } catch (err: any) {
        const files = [];
        if (path !== '/') files.unshift(parentDirectoryItem);
        state.rows = files;
      } finally {
        state.isLoading = false;
        state.selected = [];
      }
    };
    onAgentMounted(() => loadFiles());

    const getFileIcon = (fileType: string) => {
      return fileIcons[fileType || 'unknown'] || 'unknown';
    };

    const onEnterFile = (event: Event, row: any) => {
      if (row.type === 'directory') {
        if (row.name === '..') state.currentPath.pop();
        else state.currentPath.push(row.name);
        loadFiles();
      }
    };

    const onPathChange = (idx: number) => {
      state.currentPath.splice(idx + 1);
      loadFiles();
    };

    return {
      state,
      table: { columns },
      getFileIcon,
      onEnterFile,
      onPathChange,
    };
  },
});
</script>

<style scoped></style>
