import { Module } from '@nestjs/common';
// import { MessagesService } from './service/messages.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        TWILIO_ACCOUNT_SID: Joi.string().required(),
        TWILIO_AUTH_TOKEN: Joi.string().required(),
        TWILIO_VERIFICATION_SERVICE_SID: Joi.string().required(),
        // ...
      }),
    }),
  ],
  // providers: [MessagesService],
})
export class MessagesModule {}
