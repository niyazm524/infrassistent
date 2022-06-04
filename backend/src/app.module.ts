import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { SockModule } from './sock/sock.module';
import { MessageBrokerModule } from './message-broker/message-broker.module';
import { ElasticModule } from './elastic/elastic.module';

@Module({
  imports: [DbModule, SockModule, MessageBrokerModule, ElasticModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
