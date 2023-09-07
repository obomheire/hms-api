import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { UserEntity } from 'src/user/schema/user.schema';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import {
  headApprovalEnum,
  requisitionStatusEnum,
} from 'src/utils/enums/requisitionStatus';
import { DrugUnitEnum } from '../enum/unit.enum';
import { DrugTypeEntity } from './drugType.schema';
import { DrugProductEntity } from './product.schema';
class drugDetails {
  @Prop({ type: Types.ObjectId, ref: DrugProductEntity.name })
  productType: string;

  @Prop()
  unitCost: number;

  @Prop()
  quantity: number;

  @Prop()
  unit: DrugUnitEnum;
}

class Cost {
  @Prop({ default: 1 })
  subTotalCost: number;
  @Prop({ default: 1 })
  salesTax: number;
  @Prop({ default: 1 })
  shippingCost: number;
  @Prop({ default: 1 })
  otherCost: number;
}

class VendorDetails {
  @Prop()
  address: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  vendorName: string;

  @Prop()
  state: string;

  @Prop()
  country: string;
}

class ShippiongDetails {
  @Prop()
  address: string;
  @Prop()
  phoneNumber: string;
}

@Schema(mongooseSchemaConfig)
export class RequisitionEntity extends Document {
  @Prop({ unique: true })
  uniqueCode: string;

  @Prop()
  title: string;

  @Prop()
  location: string;

  @Prop()
  dueDate: string;

  @Prop([{ type: drugDetails }])
  drugDetails: drugDetails[];

  @Prop({ type: Cost })
  cost: Cost;

  @Prop({ default: 0 })
  grandTotal: number;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name })
  requester: string;

  @Prop()
  requesterNote: string;

  @Prop()
  headApprovalComment: string;

  @Prop()
  receiptUrl: string;

  @Prop({ type: String, enum: DrugUnitEnum })
  unit: DrugUnitEnum;

  @Prop({ type: VendorDetails })
  vendorDetails: VendorDetails;

  @Prop({ type: ShippiongDetails })
  shippiongDetails: ShippiongDetails;

  @Prop({ type: String, default: headApprovalEnum.PENDING })
  headApproval: headApprovalEnum;

  @Prop({ type: String, default: headApprovalEnum.PENDING })
  accountApproval: headApprovalEnum;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name })
  checkedBy: string;

  @Prop()
  additionalInfo: string;

  @Prop({ type: String, default: requisitionStatusEnum.PENDING })
  requisitionStatus: requisitionStatusEnum;
}
export const RequisitionSchema =
  SchemaFactory.createForClass(RequisitionEntity);
export type RequisitionDocument = RequisitionEntity & Document;


RequisitionSchema.pre('save', function (next) {
  this.grandTotal = this.cost?.subTotalCost || 0 + this.cost?.shippingCost || 0 + this.cost?.otherCost || 0;
  next();
})