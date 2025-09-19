import { Body, Controller, Param, Post } from '@nestjs/common';
import { BaseApiController } from 'src/controllers/base-api.controller';
import type {
  CounterOfferReq,
  CounterOfferRes,
  NegotiateReq,
  NegotiateRes,
} from './negotiate.dto';
import { NegotiateService } from './negotiate.service';

@Controller('negotiate')
export class NegotiateController extends BaseApiController {
  constructor(private readonly negotiateService: NegotiateService) {
    super();
  }

  @Post()
  async makeNegotiaition(@Body() body: NegotiateReq): Promise<NegotiateRes> {
    return await this.negotiateService.makeNegotiation(body);
  }

  @Post(':id/offer')
  async makeCounterOffer(
    @Param('id') id: string,
    @Body() body: CounterOfferReq,
  ): Promise<CounterOfferRes> {
    return await this.negotiateService.makeCounterOffer(body);
  }
}
