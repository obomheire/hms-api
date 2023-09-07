import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { mongooseSchemaConfig } from '../../database/schema.config';
import { UserEntity } from 'src/user/schema/user.schema';
import { DrugFrequencyEnum } from 'src/utils/enums/patients/drugFrequency.enum';
import { RouteOfAdminEnum } from 'src/utils/enums/patients/routeOfAdmin.enum';
import { FoodRelationEnum } from 'src/utils/enums/patients/foodRelation.enum';
import { PharmacyStoreEntity } from '../pharmacyStore.schema';
import { DrugProductEntity } from 'src/pharmacy/schema/product.schema';
import { PrescriptionStatusEnum } from 'src/utils/enums/patients/prescriptionStatus.enum';

// @Schema(mongooseSchemaConfig)
export class PrescriptionEntity {

  @Prop({ type: Types.ObjectId, ref: DrugProductEntity.name })
  product: Types.ObjectId;

  @Prop()
  notes?: string;

  @Prop({ type: String })
  frequency?: DrugFrequencyEnum;

  @Prop({ type: String })
  routeOfAdmin?: RouteOfAdminEnum;

  @Prop()
  duration?: number;

  @Prop()
  amount?: number;

  @Prop()
  quantity?: number;

  @Prop({ type: String })
  foodRelation?: FoodRelationEnum;

  // @Prop()
  // arbitraryQuantity?: number
  //we want to add fields that enable us track usage of the product based on the frequency, duration and amount

  static getUsage(frequency: DrugFrequencyEnum, duration: number, amount: number) {
    let usage = 0;
    switch (frequency) {
      case DrugFrequencyEnum.OD:
        usage = duration * amount;
        break;
      case DrugFrequencyEnum.BD:
        usage = duration * amount * 2;
        break;
      case DrugFrequencyEnum.TDS:
        usage = duration * amount * 3;
        break;
      case DrugFrequencyEnum.QID:
        usage = duration * amount * 4;
        break;
      case DrugFrequencyEnum.STAT:
        usage = amount;
        break;
    }
    return usage;
  }

  static getUsagePerDay(frequency: DrugFrequencyEnum, amount: number) {
    let usage = 0;
    switch (frequency) {
      case DrugFrequencyEnum.OD:
        usage = amount;
        break;
      case DrugFrequencyEnum.BD:
        usage = amount * 2;
        break;
      case DrugFrequencyEnum.TDS:
        usage = amount * 3;
        break;
      case DrugFrequencyEnum.QID:
        usage = amount * 4;
        break;
      case DrugFrequencyEnum.STAT:
        usage = amount;
        break;
    }
    return usage;
  }

  @Prop({ type: Number, default: 0 })
  numberOfTimes: number;

  @Prop()
  nextDose: Date;

  @Prop()
  startDate: Date;

  @Prop()
  remainingDays: number;

}

export const PrescriptionSchema =
  SchemaFactory.createForClass(PrescriptionEntity);
export type PrescriptionDocument = PrescriptionEntity & Document;
