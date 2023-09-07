import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Type } from 'class-transformer';
import { MaritalStatusEnum } from '../enums/maritalStatus.enum';
import { AddressEntity, AddressSchema } from './address.schema';

@Schema({
  timestamps: true,
  versionKey: false,
  collection: 'nextOfKin',
  _id: true,
  autoIndex: true,
})
export class NextOfKinEntity {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ trim: true })
  email: string;

  @Prop({ trim: true })
  middleName: string;

  @Prop({  trim: true })
  phoneNumber: string;

  @Prop({ trim: true })
  address: string;

  @Prop({ trim: true })
  city: string;

  @Prop({ trim: true })
  state: string;

  @Prop({  trim: true })
  zipCode: string;

  @Prop({ trim: true })
  country: string;

  @Prop({  trim: true })
  relationship: string;

  @Prop({ type: String, trim: true })
  maritalStatus: MaritalStatusEnum;

  @Prop()
  dateOfBirth: string

  // @Prop({ type: AddressSchema })
  // @Type(() => AddressEntity)
  // contactAddress?: AddressEntity;
}
export type NextOfKinDocument = NextOfKinEntity & Document;
export const NextOfKinSchema = SchemaFactory.createForClass(NextOfKinEntity);
