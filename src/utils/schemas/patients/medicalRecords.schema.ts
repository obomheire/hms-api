import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { BloodGroupEnum } from 'src/utils/enums/bloodGroup.enum';
import { GenotypeEnum } from 'src/utils/enums/genotype.enum';
import { mongooseSchemaConfig } from '../../database/schema.config';
import { PatientEntity, PatientSchema } from '../../../patients/schema/patients.schema';

@Schema(mongooseSchemaConfig)
export class MedicalRecordEntity {
    @Prop()
    heartRate: number;

    @Prop()
    bloodPressure: string

    @Prop()
    temperature: number

    @Prop()
    weight: number

    @Prop()
    height: number

    @Prop()
    respiratoryRate: number

    @Prop()
    diagnosis: string

    @Prop()
    treatment: string

    @Prop()
    note: string

    @Prop()
    glucose: number;

    @Prop({type: String})
    genotype: GenotypeEnum

    @Prop({type: String})
    bloodGroup: BloodGroupEnum
}
export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecordEntity);
export type MedicalRecordDocument = MedicalRecordEntity & Document;