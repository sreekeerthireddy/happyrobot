import { Module } from '@nestjs/common';
import { NegotiateController } from './negotiate.controller';
import { NegotiateService } from './negotiate.service';

@Module({
  controllers: [NegotiateController],
  providers: [NegotiateService],
  exports: [NegotiateService],
})
export class NegotiateModule {}
