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

  handleConnection(client: Socket, ...args: any[]): any {
    console.info(
      `New connection from ${client.id} (${client.handshake.auth.hostname})`,
    );
    this.clients.set(client.handshake.auth.id, client);
  }

  handleDisconnect(client: Socket): any {
    this.clients.set(client.handshake.auth.id, null);
  }
}
