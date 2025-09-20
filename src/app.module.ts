import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VerifyModule } from './verify/verify.module';
import { ConfigModule } from '@nestjs/config';
import { LoadsModule } from './loads/loads.module';
import { NegotiateModule } from './negotiate/negotiate.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    VerifyModule,
    LoadsModule,
    NegotiateModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
