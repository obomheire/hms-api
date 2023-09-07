import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { Type } from 'class-transformer';
import {
  VitalSignsEntity,
} from 'src/utils/schemas/patients/vitalSigns.schema';
import {
  AllergiesEntity,
} from 'src/utils/schemas/patients/allergies.schema';
import {
  DoctorNoteEntity,
} from 'src/utils/schemas/patients/doctorNote.schema';
import {
  InvestigationEntity,
  InvestigationSchema,
} from 'src/patients/schema/investigation.schema';
import {
  PrescriptionEntity,
  PrescriptionSchema,
} from 'src/utils/schemas/patients/prescription.schema';
import {
  RecommendationEntity,
} from 'src/utils/schemas/patients/recommendation.schema';
import {
  AssessmentLogEntity,
  AssessmentLogSchema,
} from 'src/patients/schema/assessmentlog.schema';
import { PharmacyPrescriptionEntity } from 'src/patients/schema/pharmacyPrescription.schema';
import { PatientEntity } from './patients.schema';
import { mongooseSchemaConfig } from '../../utils/database/schema.config';
import { UserEntity } from 'src/user/schema/user.schema';

// @Schema(mongooseSchemaConfig)
// export class VisitEntity {
//   @Prop({ required: true })
//   visitNotes: string;

//   @Prop()
//   bmi: string;

//   createdAt: string;

//   @Prop({ type: Types.ObjectId, ref: PatientEntity.name, required: true })
//   patientId: Types.ObjectId;

//   @Prop({ type: Types.ObjectId, ref: UserEntity.name })
//   doctor: Types.ObjectId;

//   @Prop({ required: true })
//   visitID: string;

//   @Prop({ type: VitalSignsSchema })
//   @Type(() => VitalSignsEntity)
//   vitalSigns?: VitalSignsEntity;

//   @Prop({ type: [{ type: AllergiesSchema, ref: AllergiesEntity.name }] })
//   @Type(() => AllergiesEntity)
//   allergies?: AllergiesEntity[];

//   @Prop({ type: DoctorNoteSchema })
//   @Type(() => DoctorNoteEntity)
//   doctorNote?: DoctorNoteEntity;

//   @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: InvestigationEntity.name }])
//   // @Type(() => InvestigationEntity)
//   investigation?: Types.ObjectId[];

//   @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: PharmacyPrescriptionEntity.name }])
//   // @Type(() => PrescriptionEntity)
//   prescription?: Types.ObjectId[];

//   @Prop({ type: AssessmentLogSchema })
//   @Type(() => AssessmentLogEntity)
//   assessmentLog?: AssessmentLogEntity;

//   @Prop({ type: RecommendationSchema })
//   @Type(() => RecommendationEntity)
//   recommendation?: RecommendationEntity;
// }

@Schema(mongooseSchemaConfig)
export class VisitItem {
  @Prop({ type: VitalSignsEntity })
  vitalSigns: VitalSignsEntity;

  @Prop([{ type: AllergiesEntity }])
  allergies: AllergiesEntity[];

  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentLogEntity' })
  // assessmentLog: mongoose.Schema.Types.ObjectId;

  // @Prop([{ type: DoctorNoteEntity }])
  // doctorNote: DoctorNoteEntity[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'InvestigationEntity' }])
  investigation: mongoose.Schema.Types.ObjectId[];

  @Prop([
    { type: mongoose.Schema.Types.ObjectId, ref: 'PharmacyPrescriptionEntity' },
  ])
  prescription: mongoose.Schema.Types.ObjectId[];

  // @Prop([{ type: RecommendationEntity }])
  // recommendation: RecommendationEntity[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserEntity' })
  doctor: mongoose.Schema.Types.ObjectId;
}

export const VisitItemSchema = SchemaFactory.createForClass(VisitItem);
export type VisitItemDocument = VisitItem & Document;
