import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ClientService, PolkadotHeader } from './client.service';

@Controller('client')
export class ClientController {
  constructor(private clientService: ClientService) {
  }

  @Get('get-by-hash')
  async getHeaderByHash(@Query('hash') hash: string): Promise<PolkadotHeader> {
    if (!hash) {
      throw new BadRequestException('The "hash" query string is mandatory');
    }

    return this.clientService.getHeaderByHash(hash);
  }

  @Get('get-by-number')
  async getHeaderByNumber(@Query('number') number: number): Promise<PolkadotHeader> {
    if (!number) {
      throw new BadRequestException('The "number" query string is mandatory');
    }

    return this.clientService.getHeaderByNumber(number);
  }

  @Get('verify-proof')
  async verifyInclusionProof(@Query('hash') hash: string): Promise<PolkadotHeader> {
    if (!hash) {
      throw new BadRequestException('The "hash" query string is mandatory');
    }

    return this.clientService.verifyMerkleProof(hash);
  }
}
