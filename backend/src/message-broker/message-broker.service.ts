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
      clientId: 'infrassistent-server',
      brokers: ['work-primary:29092'],
    });
    this.producer = this.kafka.producer({ allowAutoTopicCreation: true });
  }

  async sendEvents(topic: string, events: EventMessage[]) {
    await this.producer.send({
      topic: 'infra_' + topic,
      messages: events.map((event) => ({
        key: event.key,
        value: JSON.stringify(event.data),
      })),
    });
  }

  async sendStringEvent(
    topic: string,
    key: string,
    str: string,
    headers: { agent: string },
  ) {
    await this.producer.send({
      topic: `infra_${topic}`,
      messages: [
        {
          timestamp: new Date().toISOString(),
          key,
          value: str,
          headers,
        },
      ],
    });
  }

  async onApplicationBootstrap() {
    await this.producer.connect();
  }

  onApplicationShutdown(signal?: string): any {
    return this.producer.disconnect();
  }
}
