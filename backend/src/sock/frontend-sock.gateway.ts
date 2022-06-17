import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { AggregationsCalendarInterval } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import * as path from 'path';
import { Server, Socket } from 'socket.io';
import { ElasticService } from '../elastic/elastic.service';
import { SockGateway } from './sock.gateway';

@WebSocketGateway(3005, { cors: { origin: '*' } })
export class FrontendSockGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  private clients = new Map<string, Socket | null>();

  constructor(
    private sockGateway: SockGateway,
    private elasticService: ElasticService,
  ) {
    setTimeout(() => {
      sockGateway.server.on('connect', () => this.onAgentsUpdate());
      sockGateway.server.on('disconnect', () => this.onAgentsUpdate());
    }, 2000);
  }

  handleConnection(client: Socket, ...args: any[]): any {
    console.info(`New frontend connection from ${client.id}`);
    this.onAgentsUpdate();
    this.clients.set(client.id, client);
  }

  onAgentsUpdate() {
    this.server.sockets.emit(
      'update:agents',
      [...this.sockGateway.clients.entries()]
        .filter(Boolean)
        .map(([id, client]) => ({
          id,
          hostname: client?.handshake.auth.hostname,
        })),
    );
  }

  handleDisconnect(client: Socket): any {
    this.clients.set(client.id, null);
  }

  private wrapIntoPropagation<T = any>(
    agent: string,
    event: string,
    ...args: any[]
  ): Promise<T> {
    if (!this.sockGateway.clients.get(agent))
      return Promise.reject('No such agent');
    return new Promise((resolve, reject) => {
      setTimeout(() => reject('Timeout exceed'), 10000);
      this.sockGateway.clients.get(agent)?.emit(event, ...args, resolve);
    });
  }

  @SubscribeMessage('request:sys-info')
  handleMetricRequest(
    @MessageBody() data: { agent: string; metric: string; params?: any[] },
  ) {
    return this.wrapIntoPropagation(
      data.agent,
      'metrics:gather',
      data.metric,
      data.params || [],
    );
  }

  @SubscribeMessage('control:docker')
  controlDocker(
    @MessageBody() data: { agent: string; container: string; op: string },
  ) {
    return this.wrapIntoPropagation(data.agent, 'execute', {
      executor: 'shell',
      buffered: true,
      command: 'docker',
      args: [data.op, data.container],
    });
  }

  @SubscribeMessage('read:fs-dir')
  readFsDir(@MessageBody() data: { agent: string; path: string }) {
    if (!path.isAbsolute(data.path)) throw new Error('path should be absolute');
    return this.wrapIntoPropagation(data.agent, 'fs:readdir', {
      path: data.path,
    });
  }

  @SubscribeMessage('fetch:metrics.grouped')
  async fetchMetricsGrouped(
    @MessageBody()
    body: {
      agent: string;
      kind: string;
      after?: number;
      size?: number;
      field: string;
      interval?: AggregationsCalendarInterval;
    },
    @ConnectedSocket() socket: Socket,
  ) {
    const params: Record<string, string> = {
      agent: body.agent,
      kind: body.kind,
    };
    let range: SearchRequest['query']['range'] = undefined;
    if (body.after) range = { timestamp: { gt: body.after } };
    const result = await this.elasticService.client.search({
      index: `metrics`,
      body: {
        query: {
          bool: {
            must: Object.entries(params).map(([key, val]) => ({
              match: { [key]: val },
            })),
            ...(range && { filter: { range } }),
          },
        },
        aggs: {
          grouped: {
            date_histogram: {
              field: '@timestamp',
              calendar_interval: body.interval ?? 'minute',
              order: { _key: 'desc' },
            },
            aggs: {
              average: {
                avg: { field: body.field },
              },
              top2: {
                bucket_sort: {
                  sort: [],
                  size: 50,
                },
              },
            },
          },
        },
        sort: [{ '@timestamp': 'desc' }],
        size: body.size || 50,
      },
    });
    result.hits.hits.reverse();
    result.aggregations.grouped?.['buckets'].reverse();
    return result;
  }

  @SubscribeMessage('fetch:metrics')
  async fetchMetrics(
    @MessageBody()
    body: { agent: string; kind: string; after?: number; size?: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const params: Record<string, string> = {
      agent: body.agent,
      kind: body.kind,
    };
    let range: SearchRequest['query']['range'] = undefined;
    if (body.after) range = { timestamp: { gt: body.after } };
    const result = await this.elasticService.client.search({
      index: `metrics`,
      // body: { query: { nested: {path: 'data.kind', query: {bool: { must: {match: {}}}}} } },
      body: {
        query: {
          bool: {
            must: Object.entries(params).map(([key, val]) => ({
              match: { [key]: val },
            })),
            ...(range && { filter: { range } }),
          },
        },
        sort: [{ '@timestamp': 'desc' }],
        size: body.size || 50,
      },
    });
    result.hits.hits.reverse();
    return result;
  }
}
