import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';

@Schema(mongooseSchemaConfig)
export class HospitalAddressEntity {
  @Prop()
  name: string;

  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  country: string;

  @Prop()
  zipCode: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  website: string;

  @Prop()
  weekDayOpeningHours: string;

  @Prop()
    weekDayClosingHours: string;


  @Prop()
  weekendOpeningHours: string;

  @Prop()
    weekendClosingHours: string;

  @Prop()
  picture: string;
  @Prop()
  about: string;
}
export const HospitalAddressSchema = SchemaFactory.createForClass(
  HospitalAddressEntity,
);
export type HospitalAddressDocument = HospitalAddressEntity & Document;
