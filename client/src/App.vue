<template>
  <router-view />
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import { sockApi } from 'src/shared/api/sock-api';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  setup() {
    const quasar = useQuasar();
    sockApi._.setupContext(quasar);
  },
});
</script>
