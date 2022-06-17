import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticService implements OnApplicationBootstrap {
  client: Client;

  constructor() {
    this.client = new Client({
      node: 'http://work-secondary:9200',
      auth: {
        username: 'elastic',
        password: 'V402GUFiqMpOYQhpBXzl',
      },
    });
  }

  async onApplicationBootstrap() {
    // await this.client.indices.create({
    //   index: 'metrics',
    //   // settings: { shards: 1, number_of_replicas: 0 },
    // });
  }
}
