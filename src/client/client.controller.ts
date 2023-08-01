import { Controller } from '@nestjs/common';
import { ClientService } from './client.service';

@Controller()
export class ClientController {
  constructor(private clientService: ClientService) {
  }

}
