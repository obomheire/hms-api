import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { InvestigationEntity } from 'src/patients/schema/investigation.schema';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';

@Schema(mongooseSchemaConfig)
export class InvestigatioBookingEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: InvestigationEntity.name,
  })
  investigation: string

  @Prop()
  date: string;

  @Prop({
    type: String,
    ref: 'PatientEntity',
  })
  patient: string;
}


export const InvestigationBookingSchema =
  SchemaFactory.createForClass(InvestigatioBookingEntity);
export type InvestigationBookingDocument = InvestigatioBookingEntity & Document;
