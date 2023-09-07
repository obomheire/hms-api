import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Type } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { UserEntity } from 'src/user/schema/user.schema';
import { BloodGroupEnum } from 'src/utils/enums/bloodGroup.enum';
import { GenderEnum } from 'src/utils/enums/gender.enum';
import { GenotypeEnum } from 'src/utils/enums/genotype.enum';
import { MaritalStatusEnum } from 'src/utils/enums/maritalStatus.enum';
import { AddressEntity, AddressSchema } from 'src/utils/schemas/address.schema';
import {
  NextOfKinEntity,
  NextOfKinSchema,
} from 'src/utils/schemas/nextOfKin.schema';
import { AdmissionStatusEnum } from '../enum/admissionStatus.enum';
import { ClinicEntity } from '../../wards/schema/clinic.schema';
import { ReferralEntity, ReferralSchema } from './referral.schema';
import { mongooseSchemaConfig } from '../../utils/database/schema.config';
import {
  PayerEntity,
  PayerSchema,
} from 'src/utils/schemas/patients/payerDetails.schema';
import {
  MedicalRecordSchema,
  MedicalRecordEntity,
} from '../../utils/schemas/patients/medicalRecords.schema';
import {
  AppointmentEntity,
  AppointmentSchema,
} from 'src/appointments/schema/appointments.schema';
import { VisitEntity } from './visit.schema';
// import { DepartmentEntity } from 'src/department/schema/department.schema';

@Schema(mongooseSchemaConfig)
export class PatientEntity {
  @Prop({ required: true, unique: true })
  ID: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({ default: Math.floor(10000000 + Math.random() * 9000000) })
  otp: string;

  @Prop()
  otpExpiry: Date;

  @Prop({
    required: true,
    trim: true,
  })
  firstName: string;

  @Prop({
    required: true,
    trim: true,
  })
  lastName: string;

  @Prop({
    trim: true,
  })
  middleName: string;

  @Prop({ trim: true })
  religion: string;

  @Prop({ trim: true })
  language: string;

  @Prop({ trim: true })
  occupation: string;

  @Prop({ trim: true })
  nationality: string;

  @Prop()
  dateOfBirth: string;

  @Prop({ type: String, default: AdmissionStatusEnum.OUTPATIENT })
  admissionStatus: AdmissionStatusEnum;

  @Prop({ type: String })
  gender: GenderEnum;

  @Prop({ type: String })
  genotype: GenotypeEnum;

  @Prop({ type: String })
  bloodGroup: BloodGroupEnum;

  @Prop()
  phoneNumber: string;

  @Prop()
  bedNumber: number;

  @Prop()
  ward: string;
  

  @Prop()
  reasonForDeath: string;

  @Prop()
  dischargeDate: Date;

  @Prop()
  admissionDate: Date;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name })
  doctorInCharge?: Types.ObjectId;

  @Prop({ type: String, default: MaritalStatusEnum.OTHER })
  maritalStatus: MaritalStatusEnum;

  @Prop({ type: AddressEntity })
  residentialAddress: AddressEntity;

  @Prop({ type: AddressEntity })
  permanentAddress: AddressEntity;

  @Prop({ type: NextOfKinEntity })
  nextOfKin: NextOfKinEntity;

  @Prop({ type: PayerEntity })
  payerDetails?: PayerEntity;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: VisitEntity.name }])
  medicalRecords?: Types.ObjectId[];

  @Prop()
  hmnoNumber: string;

  @Prop({
    default:
      'https://res.cloudinary.com/dkwcn5tre/image/upload/v1676457550/hms/images/default-patient-image_vfrjk3.png',
  })
  patientImage: string;
}
export const PatientSchema = SchemaFactory.createForClass(PatientEntity);
export type PatientDocument = PatientEntity & Document;

PatientSchema.pre<PatientDocument>('save', function (next) {
  this.firstName = this.firstName?.toLowerCase();
  this.lastName = this.lastName?.toLowerCase();
  next();
});

PatientSchema.virtual('age').get(function () {
  const thisYear = new Date().getFullYear();
  const birthYear = new Date(this.dateOfBirth).getFullYear();
  const age = thisYear - birthYear;
  return age;
});

//capitalise first letter of first name and last name before saving them
PatientSchema.pre<PatientDocument>('save', function (next) {
  this.firstName = this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1);
  this.lastName = this.lastName.charAt(0).toUpperCase() + this.lastName.slice(1);
  this.middleName = this?.middleName?.charAt(0).toUpperCase() + this?.middleName?.slice(1);
  next();
}
);