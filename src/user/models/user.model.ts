// import * as mongoose from 'mongoose';
// import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
// import * as bcrypt from 'bcrypt';
// import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
// import { InternalServerErrorException } from '@nestjs/common';
// import { MaritalStatusEnum } from 'src/utils/enums/maritalStatus.enum';
// import { Gender } from 'src/utils/enums/gender.enum';
// import { NationalityEnum } from 'src/utils/enums/nationality.enum';
// import { BloodGroupEnum } from 'src/utils/enums/bloodGroup.enum';
// import { GenotypeEnum } from 'src/utils/enums/genotype.enum';
// import { AccountStatusEnum } from 'src/utils/enums/accountStatus.enum';
// import { Role } from 'src/role/models/role.model';

// @Schema(mongooseSchemaConfig)
// export class User extends mongoose.Document {
//   @Prop()
//   firstName: string;

//   @Prop()
//   lastName: string;

//   @Prop()
//   middleName: string;

//   @Prop()
//   email: string;

//   @Prop()
//   password: string;

//   @Prop()
//   salt: string;

//   @Prop()
//   dataOfBirth: string;

//   @Prop()
//   phoneNumber: string;

//   @Prop({ ref: File.name, type: mongoose.Schema.Types.ObjectId })
//   profilePictures: string; //TODO file service is not implemented yet

//   @Prop()
//   religion: string;

//   @Prop()
//   staffId: string;

//   @Prop()
//   maritalStatus: MaritalStatusEnum;

//   @Prop()
//   gender: Gender;

//   @Prop()
//   nationality: NationalityEnum;

//   @Prop()
//   bloodGroup: BloodGroupEnum;

//   @Prop()
//   genotype: GenotypeEnum;

//   // @Prop()
//   // nextOfKin: NextOfKinSchema;

//   @Prop()
//   permanentAddress: string;

//   @Prop()
//   residentialAddress: string;

//   @Prop()
//   Organisation: string;

//   @Prop()
//   accountStatus: AccountStatusEnum;

//   @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name })
//   role: string;

//   static async isValidPassword(
//     password: string,
//     hash: string,
//   ): Promise<boolean> {
//     try {
//       const result = await bcrypt.compare(password, hash);
//       if (!result) {
//         return false;
//       }
//       return true;
//     } catch (e) {
//       throw new InternalServerErrorException(e.message);
//     }
//   }

//   static async hashPassword(pass: string): Promise<{ password; salt }> {
//     try {
//       const salt = await bcrypt.genSalt();
//       const password = await bcrypt.hash(pass, salt);
//       return { password, salt };
//     } catch (e) {
//       throw new InternalServerErrorException(e.message);
//     }
//   }
// }

// export const UserSchema = SchemaFactory.createForClass(User);

// UserSchema.virtual('age').get(function () {
//   const thisYear = new Date().getFullYear();
//   const birthYear = new Date(this.dataOfBirth).getFullYear();
//   const age = thisYear - birthYear;
//   return age;
// });

// UserSchema.virtual('fullName').get(function () {
//   const result = `${this.lastName} ${this.firstName} ${
//     this.middleName ? this.middleName : ''
//   }`;
//   return result;
// });
