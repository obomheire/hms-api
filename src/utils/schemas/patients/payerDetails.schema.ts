import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Type } from 'class-transformer';
import { MaritalStatusEnum } from '../../enums/maritalStatus.enum';
// import { AddressEntity, AddressSchema } from '../address.schema';


export class PayerEntity {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, trim: true })
  email: string;

  @Prop({ trim: true })
  middleName: string;

  @Prop({ required: true, trim: true })
  phoneNumber: string;

  @Prop({ required: true, trim: true })
  address: string;

  @Prop({ required: true, trim: true })
  relationship: string;

  @Prop({ trim: true })
  city: string;

  @Prop({ trim: true })
  state: string;

  @Prop({ trim: true })
  country: string;

  @Prop({ trim: true })
  zipCode: string;
}
export type PayerDocument = PayerEntity & Document;
export const PayerSchema = SchemaFactory.createForClass(PayerEntity);
