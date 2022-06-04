import { Module } from '@nestjs/common';
import { MessageBrokerModule } from '../message-broker/message-broker.module';
import { FrontendSockGateway } from './frontend-sock.gateway';
import { SockGateway } from './sock.gateway';
import { SockController } from './sock.controller';

@Module({
  imports: [MessageBrokerModule],
  providers: [SockGateway, FrontendSockGateway],
  controllers: [SockController],
})
export class SockModule {}
