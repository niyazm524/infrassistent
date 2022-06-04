import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticService implements OnApplicationBootstrap {
  client: Client;

  constructor() {
    this.client = new Client({
      node: 'http://localhost:9200',
      auth: {
        username: 'elastic',
        password: 'pass4root',
      },
    });
  }

  async onApplicationBootstrap() {
    console.log(await this.client.search({ index: 'infrassistent-server' }));
  }
}
