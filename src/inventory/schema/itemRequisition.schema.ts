import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { DepartmentEntity } from 'src/department/schema/department.schema';
// import {
//   headApprovalEnum,
//   requisitionStatusEnum,
// } from 'src/pharmacy/enum/requisitionStatus';
import { UserEntity } from 'src/user/schema/user.schema';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import {
  headApprovalEnum,
  requisitionStatusEnum,
} from 'src/utils/enums/requisitionStatus';
import { ItemProductEntity } from './itemProduct.schema';

class inventoryDetails {
  @Prop({ type: Types.ObjectId, ref: ItemProductEntity.name })
  productType: string;

  @Prop()
  unitCost: number;

  @Prop()
  quantity: number;
}

class Cost {
  @Prop()
  subTotalCost: number;
  @Prop()
  salesTax: number;
  @Prop()
  salesPercentage: string;
  @Prop()
  shippingCost: number;
  @Prop()
  otherCost: number;
}

class VendorDetails {
  @Prop()
  vendorName: string;
  @Prop()
  address: string;
  @Prop()
  phoneNumber: string;
  @Prop()
  bankName: string;
  @Prop()
  accountName: string;
  @Prop()
  accountNumber: string;
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
export class ItemRequisitionEntity extends Document {
  @Prop({
    unique: true,
  })
  uniqueCode: string;


  @Prop()
  title: string;

  @Prop()
  itemCategory: string;

  @Prop()
  location: string;

  @Prop()
  dueDate: string;

  @Prop([{ type: inventoryDetails }])
  inventoryDetails: inventoryDetails[];

  @Prop({ type: Cost })
  cost: Cost;

  @Prop()
  grandTotal: number;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name })
  requester: string;

  @Prop()
  requesterNote: string;

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

  @Prop()
  receiptUrl: string;

  @Prop({ type: String, default: requisitionStatusEnum.PENDING })
  requisitionStatus: requisitionStatusEnum;
}
export const ItemRequisitionSchema = SchemaFactory.createForClass(
  ItemRequisitionEntity,
);
export type ItemRequisitionDocument = ItemRequisitionEntity & Document;

// ItemRequisitionSchema.virtual('grandTotal').get(function () {
//   return this.cost ? this.cost.subTotalCost + this.cost.salesTax : 0;
// });
ItemRequisitionSchema.pre('save', function (next) {
  this.grandTotal = this.cost?.subTotalCost || 0 + this.cost?.shippingCost || 0 + this.cost?.otherCost || 0;
  next();
})

