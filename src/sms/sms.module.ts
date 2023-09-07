import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SmsController } from './controller/sms.controller';
import SmsService from './service/sms.service';

@Module({
  imports: [],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService],
})

export class SmsModule {}
