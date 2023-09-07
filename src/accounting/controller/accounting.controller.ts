import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { approveRequisitionDto, FilterBodyDto, itemRequisitionDto } from 'src/inventory/dto/itemRequisition.dto';
import { FilterPatientDto } from 'src/patients/dto/filterPatient.dto';
import { CalendarFilterEnum } from 'src/patients/enum/visit-status.enum';
import { PaymentService } from 'src/payment/service/payment.service';
import { disputeAccountRequsitionEnum, headApprovalEnum } from 'src/utils/enums/requisitionStatus';
import { AccountInput, PendingDto } from '../dto/account.dto';
import { AccountFilterDto, ApproveOrDeclineDisputeDto, CreateDisputeDto } from '../dto/dispute.dto';
import { AccountingService } from '../service/accounting.service';

@Controller('accounting')
@ApiBearerAuth('Bearer')
@ApiTags('Accounting')
export class AccountingController {
  constructor(
    private readonly accountingService: AccountingService,
    private readonly paymentService: PaymentService
    ) {}

  @ApiParam({ name: 'id', type: 'string' })
  @Post('generate-receipt/:id')
  async generateReceipt(
    @Param('id') id: string,
    @Body() data: AccountInput,
    @Res() res,
    @Req() req,
  ) {
    const pdf = await this.accountingService.getTransaction(id, data, req);
    res.contentType('application/pdf');
    res.send(pdf);
  }

  //get all transactions pending
  @Post('get-all-transactions')
  async getAllTransactions(@Body() data: FilterPatientDto) {
    return await this.accountingService.getAllTransactionsPending(data);
  }

  //get all transactions paid
  @ApiQuery({ name: 'search', type: 'string' })
  @Post('get-all-transactions-paid')
  async getAllTransactionsPaid(@Body() data?: FilterPatientDto) {
    return await this.accountingService.getAllTransactionsPaid(data);
  }

  //pay transaction
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: AccountInput })
  @Post('pay-transaction/:id')
  async payTransaction(
    @Param('id') id: string,
    @Body() data: AccountInput,
    @Req() req: any,
  ) {
    return await this.accountingService.getTransaction(id, data, req);
  }

  //get payment details
  @Post('account-details')
  async getAccountDetails(@Body() data?: FilterPatientDto) {
    const { 
      // totalCost,
      // totalTransactions,
      // pendingTransactions,
      totalExpenses} = await this.accountingService.getPaymentDetails(data);
      const { totalIncome, numberOfSuccessfulPayments, numberOfPendingOrders } = await this.paymentService.getTotalIncome();
    return {
      totalIncome,
       numberOfSuccessfulPayments,
      numberOfPendingOrders,
      totalExpenses,
    };
  }

  //open dispute
  @ApiBody({ type: CreateDisputeDto })
  @Post('open-dispute')
  async openDispute(@Body() data: CreateDisputeDto) {
    return await this.accountingService.openDispute(data);
  }

  //get all disputes
  @ApiQuery({
    name: 'search',
    type: 'string',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
  })
  @Post('get-all-disputes')
  async getAllDisputes( @Query('page') page: number, @Query('limit') limit: number, @Query('search') search?: string, @Body('status') status?: string) {
    return await this.accountingService.getDisputes(page, limit, search, status);
  }

  //get dispute
  @ApiParam({ name: 'id', type: 'string' })
  @Get('get-dispute/:id')
  async getDispute(@Param('id') id: string) {
    return await this.accountingService.getDispute(id);
  }

  //close dispute
  @ApiParam({ name: 'id', type: 'string' })
  @Post('close-dispute/:id')
  async closeDispute(@Param('id') id: string) {
    return await this.accountingService.closeDispute(id);
  }

  //resolve dispute
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({
    type: ApproveOrDeclineDisputeDto,
  })
  @Post('resolve-dispute/:id')
  async resolveDispute(@Param('id') id: string, @Body() data: ApproveOrDeclineDisputeDto) {
    return await this.accountingService.resolveDispute(id, data);
  }
  //create purchase order
  @ApiBody({ type: itemRequisitionDto })
  @Post('create-purchase-order')
  async createPurchaseOrder(@Body() data: itemRequisitionDto, @Req() req: any) {
    return await this.accountingService.createPurchaseOrder(data, req);
  }

  //get requisitions
  @ApiBody({ type: FilterBodyDto })
  @Post('get-requisitions')
  async getRequisitions(@Body() data?: FilterBodyDto) {
    return await this.accountingService.getRequisitions(data);
  }

  //approve or reject purchase order
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: String })
  @Post('approve-or-reject-purchase-order/:id')
  async approveOrRejectPurchaseOrder(
    @Param('id') id: string,
    @Body('approvalStatus') approvalStatus: headApprovalEnum,
  ) {
    return await this.accountingService.approveOrRejectPurchaseOrder(id, approvalStatus);
  }

  //get requisition disputes
  @ApiBody({ type: AccountFilterDto })
  @Post('get-requisition-disputes')
  async getRequisitionDisputes(@Body() data?: AccountFilterDto) {
    return await this.accountingService.getRequisitionDisputes(data);
  }

  //toggle dispute status
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: String })

  @Patch('toggle-dispute-status/:id')
  async toggleDisputeStatus(@Param('id') id: string, @Body('status') status: disputeAccountRequsitionEnum) {
    return await this.accountingService.getRequisitionDispute(id, status);
  }

  @Get('testing')

  async testing(@Query('data') data?: CalendarFilterEnum) {
    console.log(data)
    return await this.accountingService.testing(data);
  }

  @ApiBody({ type: FilterPatientDto })
  @Post('report-first-column')
  async report(@Body() data?: FilterPatientDto) {
    const { totalTransactionCost,
      percentageIncreaseOrDecreaseInNumberOfSuccessfulPayments,
      percentageIncreaseOrDecrease,
      cashNumber,
      cardNumber,
      hmoNumber,
      consultationNumber,
      laboratoryNumber,
      pharmacyNumber,
      admissionNumber } = await this.paymentService.paymentReportBreakdown(data);
    const { totalExpenses, totalDisputes,requisitionCostPercentageIncrease, requisitionPercentageIncrease, percentageIncreaseInRequisitionsTransactions, percentageIncreaseInDisputes, totalRequisitionCount } =  await this.accountingService.accountingReportFirstBoard(data);
    return {
      totalTransactionCost,
      percentageIncreaseOrDecreaseInNumberOfSuccessfulPayments,
      percentageIncreaseOrDecrease,
      cashNumber,
      cardNumber,
      hmoNumber,
      consultationNumber,
      laboratoryNumber,
      pharmacyNumber,
      admissionNumber,
      totalExpenses,
      requisitionCostPercentageIncrease,
      requisitionPercentageIncrease,
      percentageIncreaseInRequisitionsTransactions,
      percentageIncreaseInDisputes,
      totalDisputes,
      totalRequisitionCount
    };
  }

  @ApiQuery({ name: 'data', type: 'CalendarFilterEnum' })
  @Get('report-second-column')
  async reportSecondColumn(@Query('data') data?: CalendarFilterEnum) {
    const { dispute, expenses } =  await this.accountingService.accountingReportSecondBoard(data);
    const res = await this.paymentService.getCalendarFilter(data);
    return {
      dispute,
      expenses,
      bills: res
    };
  }

  @ApiQuery({ name: 'data', type: 'CalendarFilterEnum' })
  @Get('revenue')
  async revenueReport(@Query('data') data?: CalendarFilterEnum) {
    return await this.paymentService.getCalendarFilter(data);
  }
}