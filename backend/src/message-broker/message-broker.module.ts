import { Module } from '@nestjs/common';
import { ElasticModule } from '../elastic/elastic.module';
import { MessageBrokerService } from './message-broker.service';

@Module({
  imports: [ElasticModule],
  providers: [MessageBrokerService],
  exports: [MessageBrokerService],
})
export class MessageBrokerModule {}
