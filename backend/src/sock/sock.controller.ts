import { Controller, Get } from '@nestjs/common';
import { SockGateway } from './sock.gateway';

@Controller('sock')
export class SockController {
  constructor(private sockGateway: SockGateway) {}

  @Get('get-connected-agents')
  getConnectedAgents() {
    return [...this.sockGateway.clients.keys()];
  }
}
