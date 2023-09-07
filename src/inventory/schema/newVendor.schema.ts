import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import mongoose, { Document, Types } from 'mongoose';
import { UserEntity } from 'src/user/schema/user.schema';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { VendorStatusEnum } from '../enum/vendor.enum';
import { ItemProductEntity } from './itemProduct.schema';

class VendorDetails {
  @Prop()
  vendorName: string;
  @Prop()
  address: string;
  @Prop()
  state: string;
  @Prop()
  country: string;
  @Prop({
    type: String,
    enum: VendorStatusEnum,
    default: VendorStatusEnum.INACTIVE,
  })
  status: VendorStatusEnum;
}

class ContactPerson {
  @Prop()
  name: string;
  @Prop()
  emailAddress: string;
  @Prop()
  phoneNumber: string;
}

class PaymentDetails {
  @Prop()
  terms: string;
  @Prop()
  bankName: string;
  @Prop()
  accountName: string;
  @Prop()
  accountNumber: string;
}

// class AddProduct {
//   @Prop()
//   productName: string;
//   @Prop()
//   stockQuantity: number;
//   @Prop()
//   unitCost: number;
// }

@Schema(mongooseSchemaConfig)
export class NewVendorEntity extends Document {
  @Prop({ type: VendorDetails })
  vendorDetails: VendorDetails;

  @Prop({ type: ContactPerson })
  contactPerson: ContactPerson;

  @Prop({ type: PaymentDetails })
  paymentDetails: PaymentDetails;

  @Prop({ unique: true })
  uniqueCode: string;

  // @Prop([{ type: AddProduct }])
  // addProduct: AddProduct;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: ItemProductEntity.name }])
  addProduct: string[];

  @Prop({ default: false })
  active: boolean;
}
export const NewVendorSchema = SchemaFactory.createForClass(NewVendorEntity);
export type NewVendorDocument = NewVendorEntity & Document;
