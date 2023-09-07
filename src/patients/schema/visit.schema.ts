import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { AllergiesEntity } from 'src/utils/schemas/patients/allergies.schema';
import { AssessmentLogEntity, AssessmentLogSchema } from 'src/patients/schema/assessmentlog.schema';
import { DoctorNoteEntity } from 'src/utils/schemas/patients/doctorNote.schema';
import { VitalSignsEntity } from 'src/utils/schemas/patients/vitalSigns.schema';
import { VisitItem } from './visit-item.schema';
import { Types } from 'joi';
import { VisitStatusEnum } from '../enum/visit-status.enum';
import { Type } from 'class-transformer';
import { RecommendationEntity, RecommendationSchema } from 'src/utils/schemas/patients/recommendation.schema';

@Schema(mongooseSchemaConfig)
export class VisitEntity {
  @Prop({ required: true })
  visitID: string;

  @Prop({ required: false })
  visitNote: string;

  @Prop([{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VisitItem',
  }])
  visitDetails: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PatientEntity' })
  patientId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, enum: VisitStatusEnum, default: VisitStatusEnum.ACTIVE })
  status: VisitStatusEnum

  @Prop([{ type: RecommendationSchema, ref: 'RecommendationEntity' }])
  @Type(() => RecommendationEntity)
  recommendation: RecommendationEntity[];

  createdAt: Date;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentLogEntity' }])
  assessmentLog?: mongoose.Schema.Types.ObjectId[];

  @Prop()
  endedAt?: Date;
}

export const VisitSchema = SchemaFactory.createForClass(VisitEntity);
export type VisitDocument = VisitEntity & Document;
