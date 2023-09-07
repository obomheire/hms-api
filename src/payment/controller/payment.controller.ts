import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  Redirect,
  Headers,
  Req,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { IResponse, reference } from 'src/utils/constants/constant';
import {
  ConfirmPaymentWithHmo,
  FilterPaymentListDto,
  PaymentDto,
  PaymentResponseDto,
  PaymentWebhookDto,
  ProcessPaymentWithCash,
  ProcessPaymentWithHmo,
  RejectPaymentWithHmo,
  VerifyPaymentDto,
} from '../dto/payment.dto';
import { PaymentEventEnum } from '../event/payment.event';
import { PaymentService } from '../service/payment.service';

@ApiTags('Payment')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @ApiBody({ type: PaymentDto })
  @Post('mobile/initiate')
  async initiatePayment(@Body() paymentDto: PaymentDto): Promise<IResponse> {
    const paymentResponse: PaymentResponseDto =
      await this.paymentService.initiatePayment(paymentDto);
    return {
      status: 200,
      message: 'Payment initiated successfully',
      data: paymentResponse,
    };
  }

  @ApiBody({ type: VerifyPaymentDto })
  @Post('mobile/verify')
  async verifyPayment(
    @Body() verifyPaymentDto: VerifyPaymentDto,
  ): Promise<IResponse> {
    const verifyResponse = await this.paymentService.verifyPayment(
      verifyPaymentDto.reference,
      verifyPaymentDto.amount,
      verifyPaymentDto.currency,
    );
    return {
      status: 200,
      message: 'Payment verified successfully',
      data: verifyResponse,
    };
  }

  @Post('accounting-overview')
  async getRecords(@Body() data: FilterPaymentListDto) {
    return await this.paymentService.getListOfPatientsWithPendingOrProcessingPayments(data);
  }

  @Get('payment-summary/:id')
  async getPaymentsByPatient(@Param('id') id: string) {
    return await this.paymentService.getPendingPaymentsByPatientId(id);
  }

  @ApiBody({ type: ProcessPaymentWithHmo })
  @Post('process-payment-hmo')
  async processPaymentHmo(@Body() data: ProcessPaymentWithHmo) {
    const response = await this.paymentService.processPaymentWithHmo(
      data.paymentIds,
      data.hmoProvider,
    );
    return {
      status: 200,
      message: 'Payment processed successfully',
      data: response,
    };
  }

  @ApiBody({ type: ConfirmPaymentWithHmo })
  @Post('confirm-payment-hmo')
  async confirmPaymentHmo(@Body() data: ConfirmPaymentWithHmo) {
    const response = await this.paymentService.confirmPaymentWithHmo(
      data.paymentIds,
      data.reference,
    );
    const paymentIds = data.paymentIds;
    this.eventEmitter.emit(
      PaymentEventEnum.PAYMENT_WITH_CASH_OR_HMO,
      paymentIds,
    );
    return {
      status: 200,
      message: 'Payment confirmed successfully',
      data: response,
    };
  }

  @ApiBody({ type: RejectPaymentWithHmo })
  @Post('reject-payment-hmo')
  async rejectPaymentWithHmo(@Body() data: RejectPaymentWithHmo) {
    const response = await this.paymentService.rejectPaymentWithHmo(
      data.paymentIds,
    );
    return {
      status: 200,
      message: 'Payment rejected successfully',
      data: response,
    };
  }

  @ApiBody({ type: ProcessPaymentWithCash })
  @Post('confirm-payment-cash')
  async processPaymentCash(@Body() data: ProcessPaymentWithCash) {
    const response = await this.paymentService.confirmPaymentWithCash(
      data.paymentIds,
      data.reference,
    );
    const paymentIds = data.paymentIds;
    this.eventEmitter.emit(
      PaymentEventEnum.PAYMENT_WITH_CASH_OR_HMO,
      paymentIds,
    );
    return {
      status: 200,
      message: 'Payment confirmed successfully',
      data: response,
    };
  }

  @ApiBody({ type: ProcessPaymentWithCash })
  @Post('mobile/confirm-payment-card')
  async processPaymentWithGateway(@Body() data: ProcessPaymentWithCash) {
    const response = await this.paymentService.processPaymentWithGateway(
      data.paymentIds,
      data.reference,
    );
    const paymentIds = data.paymentIds;
    this.eventEmitter.emit(
      PaymentEventEnum.PAYMENT_WITH_CASH_OR_HMO,
      paymentIds,
    );
    return {
      status: 200,
      message: 'Payment confirmed successfully',
      data: response,
    };
  }

  @ApiParam({ name: 'patientId', type: String })
  @Get('get-pending-payents-for-patient/:patientId')
  async getPendingPaymentsForPatient(@Param('patientId') patientId: string) {
    return await this.paymentService.getPendingPaymentsByPatientId(patientId);
  }

  @Get('mobile/get-pending-payments-for-patient')
  async getMobilePendingPaymentsForPatient(@Req() req: Request): Promise<IResponse> {
    const data = await this.paymentService.getMobilePendingPaymentsByPatientId(
      req.user as unknown as string,
    );
    return {
      status: 200,
      message: "success",
      data
    }
  }

  @ApiBody({ type: FilterPaymentListDto, required: false })
  @Post('payment-history')
  async getPaymentHistory(@Body() data: FilterPaymentListDto) {
    return await this.paymentService.getPaymentHistory(
      data.paymentMethod,
      data.page,
      data.limit,
    );
  }

  @Get('payment-data')
  async getPaymentData() {
    return await this.paymentService.getTotalIncome();
  }

  @ApiParam({ name: 'reference', type: String })
  @Post('check/:reference')
  async checkPayment(@Param('reference') reference: string) {
    return await this.paymentService.getPaymentDetailsByReference(reference);
  }

  @Post('payment-method-breakdown')
  async getPaymentMethodBreakdown() {
    return await this.paymentService.getPaymentMethodBreakdown();
  }

  @Post('generate-receipt/:reference')
  async generateReceipt(@Param('reference') reference: string) {
    return await this.paymentService.generateReceipt(reference);
  }
}
