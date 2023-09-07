import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
  collection: 'address',
  _id: true,
  autoIndex: true,
})
export class AddressEntity {
  @Prop({ trim: true })
  address: string;

  @Prop({ trim: true })
  city: string;

  @Prop({ trim: true })
  state: string;

  @Prop({ trim: true })
  country: string;

  @Prop({ trim: true })
  zipCode: string;

  @Prop({ trim: true })
  telephone: string;
}

export type AddressDocument = AddressEntity & Document;
export const AddressSchema = SchemaFactory.createForClass(AddressEntity);
