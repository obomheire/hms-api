import { Type } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { InternalServerErrorException } from '@nestjs/common';
import { MaritalStatusEnum } from 'src/utils/enums/maritalStatus.enum';
import { GenderEnum } from 'src/utils/enums/gender.enum';
import { BloodGroupEnum } from 'src/utils/enums/bloodGroup.enum';
import { GenotypeEnum } from 'src/utils/enums/genotype.enum';
import {
  NextOfKinEntity,
  NextOfKinSchema,
} from 'src/utils/schemas/nextOfKin.schema';
import { AddressEntity, AddressSchema } from 'src/utils/schemas/address.schema';
import { AccountStatusEnum } from 'src/utils/enums/accountStatus.enum';
import { RoleEntity } from 'src/role/schema/role.schema';
import { RoleEnum } from '../enums/role';
import { DesignationEntity } from 'src/role/schema/designation.schema';

@Schema(mongooseSchemaConfig)
export class UserEntity {
  @Prop({ required: true, unique: true, default: '000000' })
  staffId: string;

  @Prop({ required: true, trim: true, unique: true })
  email: string;

  @Prop({ required: true, trim: true })
  password: string;

  @Prop()
  salt: string;

  @Prop()
  dateOfBirth: string;


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

  @Prop({ trim: true })
  middleName: string;

  @Prop()
  Organisation: string;

  @Prop({ trim: true })
  religion: string;

  @Prop({ type: String })
  gender: GenderEnum;

  @Prop({ type: String })
  genotype: GenotypeEnum;

  @Prop({ type: String })
  bloodGroup: BloodGroupEnum;

  @Prop()
  nationality: string;

  @Prop()
  phoneNumber: string;

  @Prop({ type: String })
  maritalStatus: MaritalStatusEnum;

  @Prop({ type: Types.ObjectId, ref: RoleEntity.name })
  role: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: DesignationEntity.name })
  designation: Types.ObjectId;

  @Prop({default: true})
  isFree: boolean

  @Prop()
  profilePicture: string;

  @Prop({ type: String, default: AccountStatusEnum.INACTIVE })
  accountStatus: AccountStatusEnum;

  @Prop({ type: AddressEntity })
  residentialAddress: AddressEntity;

  @Prop({ type: AddressEntity })
  permanentAddress: AddressEntity;

  @Prop({ type: NextOfKinEntity })
  // @Type(() => NextOfKinEntity)
  nextOfKin: NextOfKinEntity;

  static async isValidPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    try {
      const result = await bcrypt.compare(password, hash);
      if (!result) {
        return false;
      }
      return true;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  static async hashPassword(pass: string): Promise<{ password; salt }> {
    try {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash(pass, salt);
      return { password, salt };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
export const UserSchema = SchemaFactory.createForClass(UserEntity);
export type UserDocument = UserEntity & Document;

// UserSchema.pre<UserDocument>('save', function (next) {
//   this.email = this.email.toLowerCase();
//   this.firstName = this.firstName.toLowerCase();
//   this.lastName = this.lastName.toLowerCase();

//   next();
// });

UserSchema.virtual('age').get(function () {
  const thisYear = new Date().getFullYear();
  const birthYear = new Date(this.dateOfBirth).getFullYear();
  const age = thisYear - birthYear;
  return age;
});

UserSchema.virtual('fullName').get(function () {
  const result = `${this.lastName} ${this.firstName} ${
    this.middleName ? this.middleName : ''
  }`;
  return result;
});

//capitalize the first letter of the first name and last name before saving to the database
UserSchema.pre<UserDocument>('save', function (next) {
  this.firstName = this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1);
  this.lastName = this.lastName.charAt(0).toUpperCase() + this.lastName.slice(1);
  if(this.middleName)
  this.middleName = this?.middleName?.charAt(0).toUpperCase() + this?.middleName?.slice(1);
  next();
}
);
