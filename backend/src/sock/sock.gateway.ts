import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventMessage } from '../dto/messages.dto';
import { MessageBrokerService } from '../message-broker/message-broker.service';
import { LogSourceSerialized, Metric } from './dto';

@WebSocketGateway(3004, {
  allowUpgrades: true,
  pingTimeout: 10000,
  pingInterval: 10000,
})
export class SockGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  clients = new Map<string, Socket | null>();

  constructor(private messageBrokerService: MessageBrokerService) {}

  @SubscribeMessage('event:push')
  async acceptEvent(
    @MessageBody() data: EventMessage[],
    @ConnectedSocket() client: Socket,
  ) {
    await this.messageBrokerService.sendEvents(client.handshake.auth.id, data);
  }

  @SubscribeMessage('report:metrics')
  async writeMetrics(
    @MessageBody() metrics: Metric[],
    @ConnectedSocket() client: Socket,
  ) {
    const agent = client.handshake.auth.id;
    console.log(`write metrics for ${agent}` /*, metrics*/);
    await this.messageBrokerService.sendEvents(
      'metrics',
      metrics.map((m) => ({
        when: new Date(m.timestamp),
        key: `${m.kind}`,
        data: { ...m, agent },
      })),
    );
  }

  @SubscribeMessage('report:logs')
  async writeLogs(
    @MessageBody() data: { logs: string[]; id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const agent = client.handshake.auth.id;
    console.log(`write logs (${data.logs.length}) for ${agent}`);
    if (!data.logs.length) return;
    // console.log(data.logs.join('\n'));
    await this.messageBrokerService.sendStringEvent(
      'logs',
      data.id,
      data.logs.join('\n'),
      {
        agent,
      },
    );
  }

  setupLogPipe(client: Socket, id: string) {
    client.emit('logs:setup', [
      {
        type: 'file',
        location: '/var/log/syslog',
        position: null,
      },
    ] as LogSourceSerialized[]);
  }

  handleConnection(client: Socket, ...args: any[]): any {
    console.info(
      `New connection from ${client.id} (${client.handshake.auth.hostname})`,
    );
    this.clients.set(client.handshake.auth.id, client);
    setTimeout(() => {
      client.emit('metrics:setup', {});
      // this.setupLogPipe(client, client.handshake.auth.id);
    });
  }

  handleDisconnect(client: Socket): any {
    this.clients.set(client.handshake.auth.id, null);
  }
}
