import { Body, Controller, Headers, Post, Req, Redirect, Get, Res, HttpCode } from '@nestjs/common';
import { PaymentWebhookDto } from '../dto/payment.dto';
import { PaymentService } from '../service/payment.service';
import * as crypto from 'crypto';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  //handle webhook
  @HttpCode(200)
  @Post()
  async handleWebhook(
    @Headers('verif-hash') verifHash: string,
    // @Body() body: PaymentWebhookDto,
    @Req() req: any,
  ): Promise<any> {
    //validate webhook
    // console.log('verifHash', verifHash);
    // const isValid = await this.paymentService.validateWebhookEvent(
    //   verifHash,
    //   body,
    // );
    // if (!isValid) {
    //   return { message: 'Invalid webhook event' };
    // }
    const hash = crypto.createHmac('sha512', process.env.SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');

    //handle webhook event
    // const webhookResponse = await this.paymentService.handleWebhookEvent(
    //   body,
    // );
    // return webhookResponse;
  }

  @Get('redirect')
  @Redirect()
  async redirect(@Res() res: any): Promise<any> {
    console.log('redirecting to google')
    return { url: 'https://www.google.com' };
  }
}
