import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import AfricasTalking from 'africastalking';

@Injectable()
export default class SmsService {
  private twilioClient: Twilio;
  private africasTalkingClient: any;

  constructor(private readonly configService: ConfigService) {
    const accountSid = configService.get('TWILIO_ACCOUNT_SID');
    const authToken = configService.get('TWILIO_AUTH_TOKEN');
    const africasTalkingKey = configService.get('AFRICAS_TALKING_API_KEY');
    const africaStalkingUsername = configService.get('AFRICAS_TALKING_USERNAME');

    this.twilioClient = new Twilio(accountSid, authToken);
    this.africasTalkingClient = new AfricasTalking({
      apiKey: africasTalkingKey,
      username: africaStalkingUsername,
    });
   
  }

  async sendSms(phoneNumber: string, message: string) {
    try {
      await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get('TWILIO_SENDER_PHONE_NUMBER'),
        to: phoneNumber,
      });
    } catch (error) {
      throw error;
    }
  }

  async sendSmsUsingAfricasTalking(phoneNumber: string, message: string) {
    try {
      const sms = this.africasTalkingClient.SMS;
      console.log('sms', sms)

      await sms.send({
        to: phoneNumber,
        message,
        from: this.configService.get('SMS_SENDER'),
      });
     
    } catch (error) {
      throw error;
    }
  }
}
