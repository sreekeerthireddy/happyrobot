import { Body, Controller, Get, Post } from '@nestjs/common';
import { BaseApiController } from 'src/controllers/base-api.controller';
import type { VerifyReq, VerifyRes } from './verfiy.dto';
import { VerifyService } from './verify.service';

@Controller('verify-mc')
export class VerifyController extends BaseApiController {
  constructor(private readonly verifyService: VerifyService) {
    super();
  }

  @Get('test')
  testEndpoint() {
    return { message: 'Controller is working!' };
  }

  @Post()
  async verifyMc(@Body() body: VerifyReq): Promise<VerifyRes> {
    //call service to verify mc
    return await this.verifyService.verifyMc(body);
  }
}
