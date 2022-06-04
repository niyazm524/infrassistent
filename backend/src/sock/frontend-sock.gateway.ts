import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SockGateway } from './sock.gateway';

@WebSocketGateway(3005, { cors: { origin: '*' } })
export class FrontendSockGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  private clients = new Map<string, Socket | null>();

  constructor(private sockGateway: SockGateway) {}

  handleConnection(client: Socket, ...args: any[]): any {
    console.info(`New frontend connection from ${client.id}`);
    client.emit(
      'update:agents',
      [...this.sockGateway.clients.entries()].map(([id, client]) => ({
        id,
        hostname: client.handshake.auth.hostname,
      })),
    );
    this.clients.set(client.id, client);
  }

  handleDisconnect(client: Socket): any {
    this.clients.set(client.id, null);
  }

  @SubscribeMessage('request:sys-info')
  handleMetricRequest(@MessageBody() data: { agent: string; metric: string }) {
    if (!this.sockGateway.clients.get(data.agent)) return;
    console.log(data);
    return new Promise((resolve, reject) => {
      setTimeout(reject, 10000);
      this.sockGateway.clients
        .get(data.agent)
        ?.emit('metrics:gather', data.metric, resolve);
    });
  }
}
