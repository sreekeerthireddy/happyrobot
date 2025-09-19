import { Body, Controller, Get, Post } from '@nestjs/common';
import { BaseApiController } from 'src/controllers/base-api.controller';
import { LoadsService } from './loads.service';
import type { LoadReq, LoadRes } from './loads.dto';

@Controller('get-load-details')
export class LoadsController extends BaseApiController {
  constructor(private readonly loadsService: LoadsService) {
    super();
  }

  @Get('test')
  testEndpoint() {
    return { message: 'Controller is working!' };
  }

  @Post()
  async getLoadDetails(@Body() body: LoadReq): Promise<LoadRes> {
    const res = await this.loadsService.getLoadDetails(body);

    return res;
  }
}
