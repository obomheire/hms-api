import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { mongooseSchemaConfig } from '../../database/schema.config';
import { UserEntity } from 'src/user/schema/user.schema';
import { DepartmentEntity } from 'src/department/schema/department.schema';
import { WardEntity } from 'src/wards/schema/wards.schema';
import { RecommendationType } from 'src/utils/enums/patients/recommendation-type.enum';

@Schema(mongooseSchemaConfig)
export class RecommendationEntity {
  @Prop()
  remark: string;

  @Prop()
  doctor: string;

  @Prop()
  speciality: string;

  @Prop()
  hospital: string;

  @Prop()
  notes: string;

  @Prop({ type: String, enum: RecommendationType })
  type: RecommendationType;

}
export const RecommendationSchema =
  SchemaFactory.createForClass(RecommendationEntity);
export type RecommendationDocument = RecommendationEntity & Document;
