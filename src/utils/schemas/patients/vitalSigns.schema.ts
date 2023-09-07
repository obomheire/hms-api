import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BloodGroupEnum } from 'src/utils/enums/bloodGroup.enum';
import { GenotypeEnum } from 'src/utils/enums/genotype.enum';
import { mongooseSchemaConfig } from '../../database/schema.config';

// @Schema(mongooseSchemaConfig)
export class VitalSignsEntity {
  @Prop()
  urineOutput: number;

  @Prop()
  diastolicBloodPressure: number;

   @Prop()
  systolicBloodPressure: number;

  @Prop()
  temperature: number;

  @Prop()
  weight: number;

  @Prop()
  bmi: number;

  @Prop()
  height: number;

  @Prop()
  respiratoryRate: number;

  @Prop()
  diagnosis: string;

  @Prop()
  heartRate: number;

  @Prop()
  note: string;

  @Prop()
  glucose: number;

  @Prop({ type: String, enum: GenotypeEnum })
  genotype: GenotypeEnum;

  @Prop({ type: String, enum: BloodGroupEnum })
  bloodGroup: BloodGroupEnum;
}
// export type VitalSignsDocument = VitalSignsEntity & Document;
// export const VitalSignsSchema = SchemaFactory.createForClass(VitalSignsEntity);