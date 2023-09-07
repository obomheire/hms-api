import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AppointmentsService } from 'src/appointments/service/appointments.service';
import { InvestigationService } from 'src/patients/service/investigation.service';
import { PrescriptionService } from 'src/patients/service/precription.service';
import { PharmacyEventsEnum } from 'src/pharmacy/events/pharmacy.event';
import { ProductOrderService } from 'src/pharmacy/service/product-order.service';
import { TransactionTypeNameEnum } from 'src/transaction-types/enums/transaction-type.enum';
import { TransactionTypeService } from 'src/transaction-types/services/transaction-type.service';
import { TestStatusEnum } from 'src/utils/enums/patients/testStatus.enum';
import { PaymentMethodEnum } from 'src/utils/enums/paymentMethod.enum';
import { WardEventEnum } from 'src/wards/events/ward.event';
import {
  CreatePaymentDto,
  CreatePaymentFromWardDto,
  PaymentFromMobileOrder,
} from '../dto/payment.dto';
import { PaymentStatusEnum } from '../enum/payment.enum';
import { PaymentEventEnum } from '../event/payment.event';
import { PaymentService } from '../service/payment.service';

@Injectable()
export class PaymentListener {
  constructor(
    private readonly productOrderService: ProductOrderService,
    private readonly paymentService: PaymentService,
    private readonly transactionTypeService: TransactionTypeService,
    private readonly investigationService: InvestigationService,
    private readonly prescriptionService: PrescriptionService,
    private readonly appointmentService: AppointmentsService,
  ) {}

  @OnEvent(PaymentEventEnum.PAYMENT_CREATED)
  async createPayment(payload: CreatePaymentDto): Promise<void> {
    try {
      Logger.log(payload, 'PaymentListener');
      const payment = await this.paymentService.createPaymentEntity(payload);
      Logger.log(payment, 'PaymentListener');
    } catch (error) {
      Logger.error(error, 'PaymentListener');
    }
  }

  @OnEvent(PaymentEventEnum.PAYMENT_CREATED_FROM_MOBILE_ORDER)
  async createPaymentFromMobileOrder(
    payload: PaymentFromMobileOrder,
  ): Promise<void> {
    try {
      Logger.log(payload, 'PaymentListener');
      let payment = await this.paymentService.verifyPayment(
        payload.reference,
        payload.totalCost,
      );
      if (!payment[0]) {
        throw new UnauthorizedException(payment[2]);
      }
      payment = payment[1];
      const createPayment = await this.paymentService.createPaymentEntity({
        patient: payload.patient,
        transactionType: TransactionTypeNameEnum.LABORATORY,
        paidAmount: payment.data?.amount,
        totalCost: payload.totalCost,
        itemToPayFor: payload.itemToPayFor,
        model: payload.model,
        status: PaymentStatusEnum.PAID,
        paymentMethod: PaymentMethodEnum.CARD,
        paymentDate: new Date().toISOString(),
        paymentReference: payload.reference,
      });
      Logger.log(createPayment, 'PaymentListener');

      //update investigationStatus to PAID
      const updateInvestigation =
        await this.investigationService.updateInvestigationStatus(
          payload.itemToPayFor.toString(),
        );
      Logger.log(updateInvestigation, 'PaymentListener');
    } catch (error) {
      Logger.error(error, 'PaymentListener');
    }
  }

  @OnEvent(PaymentEventEnum.PAYMENT_CREATED_FOR_PHARMACY)
  async createPaymentForPharmacy(
    payload: PaymentFromMobileOrder,
  ): Promise<void> {
    try {
      Logger.log(payload, 'PaymentListener');
      let payment = await this.paymentService.verifyPayment(
        payload.reference,
        payload.totalCost,
      );
      if (!payment[0]) {
        throw new UnauthorizedException(payment[2]);
      }
      Logger.log(payload, 'payload')
      Logger.log(payload.totalCost, 'payload.totalCost')

      payment = payment[1];

      const createPayment = await this.paymentService.createPaymentEntity({
        patient: payload.patient,
        transactionType: TransactionTypeNameEnum.PHARMACY,
        paidAmount: payment.data?.amount,
        totalCost: payload.totalCost,
        itemToPayFor: payload.itemToPayFor,
        model: payload.model,
        status: PaymentStatusEnum.PAID,
        paymentMethod: PaymentMethodEnum.CARD,
        paymentDate: new Date().toISOString(),
        paymentReference: payload.reference,
      });
      Logger.log(createPayment, 'PaymentListener');
      const updateOrder = await this.prescriptionService.updateTotalCost(
        payload.itemToPayFor.toString(),
        payload.totalCost,
      );
      Logger.log(updateOrder, 'PaymentListener');
    } catch (error) {
      Logger.error(error, 'PaymentListener');
    }
  }

  @OnEvent(WardEventEnum.PATIENT_DISCHARGED)
  async createPaymentForWard(payload: any): Promise<void> {
    try {
      Logger.log(payload, 'PaymentListener');
      const transactionType =
        await this.transactionTypeService.getTransactionTypeByWard(
          payload.ward._id
        );
      //use the transactionType to get the totalCost
      const totalCost = transactionType?.amount * payload.numberOfDays;
      const createPayment = await this.paymentService.createPaymentEntity({
        patient: payload.patient,
        transactionType: TransactionTypeNameEnum.ADMISSION,
        totalCost,
        itemToPayFor: payload.ward._id.toString(),
        model: 'WardEntity',
      });
    } catch (error) {
      Logger.error(error, 'PaymentListener');
    }
  }

  private async updateItemPaidFor(id: string): Promise<any> {
    const payment = await this.paymentService.getPaymentById(id);
    Logger.log(payment, 'PaymentListener');
    Logger.log(payment.transactionType, 'PaymentListener')
    const transactionType =
      await this.transactionTypeService.getTransactionType(
        payment.transactionType,
      );
      Logger.log(transactionType, 'PaymentListener');
    if (payment.transactionType === TransactionTypeNameEnum.ADMISSION) {
      return await this.paymentService.updatePaymentStatus(
        id,
        PaymentStatusEnum.PAID,
      );
    }

    if (payment.transactionType === TransactionTypeNameEnum.CONSULTATION) {
      const updatePayment = await this.paymentService.updatePaymentStatus(
        id,
        PaymentStatusEnum.PAID,
      );
      const updateAppointment = await this.appointmentService.updateAppointment(
        payment.itemToPayFor,
      );
      return { updatePayment, updateAppointment };
    }

    if (payment.transactionType === TransactionTypeNameEnum.LABORATORY) {
      const updatePayment = await this.paymentService.updatePaymentStatus(
        id,
        PaymentStatusEnum.PAID,
      );
      const updateInvestigation =
        await this.investigationService.updateInvestigationStatus(
          payment.itemToPayFor,
        );
      return { updatePayment, updateInvestigation };
    }

    if (payment.transactionType === TransactionTypeNameEnum.PHARMACY) {
      const updatePayment = await this.paymentService.updatePaymentStatus(
        id,
        PaymentStatusEnum.PAID,
      );
      const updateProductOrder =
        await this.prescriptionService.updatePrescriptionPayment(
          payment.itemToPayFor,
        );
      return { updatePayment, updateProductOrder };
    }

    return null;
  }

  @OnEvent(PaymentEventEnum.PAYMENT_WITH_CASH_OR_HMO)
  async createPaymentWithCashOrHmo(payload: string[]): Promise<void> {
    try {
      Logger.log(payload, 'PaymentListener');
      for (const id of payload) {
        Logger.debug(id, 'PaymentListener');
        await this.updateItemPaidFor(id);
      }
    } catch (error) {
      Logger.error(error, 'PaymentListener');
    }
  }
}
