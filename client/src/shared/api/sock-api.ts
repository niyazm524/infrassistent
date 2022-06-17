import { QVueGlobals } from 'quasar';
import { agentsStore } from 'stores/agents';
import { nextTick, onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue';
import { socket } from './socket.instance';

const notifyError = <T extends any>(err: T): T => {
  const error = err as any;
  const q = sockApi._._quasar;
  sockApi._._quasar?.notify({
    type: 'error',
    position: 'top',
    color: 'red',
    textColor: 'white',
    message: error['message'] || 'Неизвестная ошибка',
    caption: `Ошибка${error.name ? ` (${error.name})` : ''}`,
  });

  return err;
};

export const sockApi = {
  _: {
    _quasar: null as QVueGlobals | null,
    setupContext: (quasar: QVueGlobals) => (sockApi._._quasar = quasar),
    getSocket: () => socket,
    useSocketConnectionState: function () {
      const isConnected = ref(socket.connected);
      const connectedHandler = () => (isConnected.value = true);
      const disconnectedHandler = () => (isConnected.value = false);
      onBeforeMount(() => {
        socket
          .on('connect', connectedHandler)
          .on('disconnect', disconnectedHandler)
          .on('reconnect', connectedHandler)
          .on('connect_error', disconnectedHandler)
          .on('error', disconnectedHandler);
      });

      onBeforeUnmount(() => {
        socket
          .off('connect', connectedHandler)
          .off('disconnect', disconnectedHandler)
          .off('reconnect', connectedHandler)
          .off('connect_error', disconnectedHandler)
          .off('error', disconnectedHandler);
      });
      onMounted(() => {
        isConnected.value = socket.connected;
      });
      return { isSockConnected: isConnected };
    },
  },
  rpc: (endpoint: string, params?: any, timeout = 15000): Promise<any> => {
    if (!agentsStore.currentAgentId) return Promise.reject('No active agent');
    if (!socket.active) throw new Error();
    return new Promise((resolve, reject) => {
      const t = setTimeout(
        () => reject(notifyError(new Error('Timeout exceed'))),
        timeout
      );
      socket.emit(
        endpoint,
        { agent: agentsStore.currentAgentId, ...params },
        (result: any) => {
          clearTimeout(t);
          if (result.isError) {
            reject(notifyError(result));
          } else resolve(result);
        }
      );
    });
  },
};
