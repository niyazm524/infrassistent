import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { EventMessage } from '../dto/messages.dto';

@Injectable()
export class MessageBrokerService
  implements OnApplicationShutdown, OnApplicationBootstrap
{
  kafka: Kafka;
  producer: Producer;
  constructor() {
    this.kafka = new Kafka({
      clientId: 'server',
      brokers: ['192.168.31.123:29092'],
    });
    this.producer = this.kafka.producer({ allowAutoTopicCreation: true });
  }

  async sendEvents(topic: string, events: EventMessage[]) {
    await this.producer.send({
      topic,
      messages: events.map((event) => ({
        key: event.key,
        value: JSON.stringify({ data: event.data, when: event.when }),
      })),
    });
  }

  async onApplicationBootstrap() {
    await this.producer.connect();
  }

  onApplicationShutdown(signal?: string): any {
    return this.producer.disconnect();
  }
}
