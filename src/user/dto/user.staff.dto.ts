import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  ValidateNested,
  IsMongoId,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { AddressDto } from 'src/utils/dtos/address.dto';

import { NextOfKinDto } from 'src/utils/dtos/nextOfKin.dto';
import { BloodGroupEnum } from 'src/utils/enums/bloodGroup.enum';
import { GenderEnum } from 'src/utils/enums/gender.enum';
import { GenotypeEnum } from 'src/utils/enums/genotype.enum';
import { MaritalStatusEnum } from 'src/utils/enums/maritalStatus.enum';
import { UserDocument } from '../schema/user.schema';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  salt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  religion?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsNotEmpty()
  role?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsNotEmpty()
  designation?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  profilePicture?: string;

  @ApiProperty({ enum: GenderEnum, example: GenderEnum.MALE })
  GenderEnum: GenderEnum;
  @IsString()
  @IsNotEmpty()
  gender: GenderEnum;

  @ApiPropertyOptional({ enum: GenotypeEnum, example: GenotypeEnum.AA })
  GenotypeEnum?: GenotypeEnum;
  @IsString()
  @IsOptional()
  genotype?: GenotypeEnum;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({
    enum: BloodGroupEnum,
    example: BloodGroupEnum.AB_NEGATIVE,
  })
  BloodGroupEnum?: BloodGroupEnum;
  @IsString()
  @IsOptional()
  bloodGroup?: BloodGroupEnum;

  @ApiPropertyOptional({
    enum: MaritalStatusEnum,
    example: MaritalStatusEnum.MARRIED,
  })
  MaritalStatusEnum?: MaritalStatusEnum;
  @IsString()
  @IsOptional()
  maritalStatus?: MaritalStatusEnum;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ type: () => AddressDto })
  @Type(() => AddressDto)
  @ValidateNested()
  residentialAddress: AddressDto;

  @ApiProperty({ type: () => AddressDto })
  @Type(() => AddressDto)
  @ValidateNested()
  permanentAddress?: AddressDto;

  @ApiProperty({ type: () => NextOfKinDto })
  @Type(() => NextOfKinDto)
  @ValidateNested()
  nextOfKin?: NextOfKinDto;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

// export class UpdateUserDto {
//   @IsString()
//   @IsOptional()
//   firstName?: string;

//   @IsString()
//   @IsOptional()
//   lastName?: string;

//   @IsString()
//   @IsOptional()
//   middleName?: string;

//   @IsString()
//   @IsOptional()
//   profilePicture?: string;

//   @IsString()
//   @IsOptional()
//   dateOfBirth?: string;

//   @IsString()
//   @IsEmail()
//   @IsOptional()
//   email?: string;

//   @IsString()
//   @IsOptional()
//   religion?: string;

//   @IsString()
//   @IsOptional()
//   gender?: GenderEnum;

//   @IsString()
//   @IsOptional()
//   genotype?: GenotypeEnum;

//   @IsString()
//   @IsOptional()
//   bloodGroup?: BloodGroupEnum;

//   @IsString()
//   @IsOptional()
//   maritalStatus?: MaritalStatusEnum;

//   @IsString()
//   @IsOptional()
//   phoneNumber?: string;

//   residentialAddress?: AddressDto;
//   permanentAddress?: AddressDto;
//   nextOfKin?: NextOfKinDto;

//   //   @Type(() => NextOfKinEntity)
//   //   @IsNotEmpty()
//   //   nextofKin: NextOfKinEntity;

//   //   @Type(() => AddressEntity)
//   //   @IsOptional()
//   //   series?: AddressEntity;

//   //   @IsString()
//   //   address: string;

//   //   @IsString()
//   //   @IsOptional()
//   //   city?: string;

//   //   @IsString()
//   //   @IsOptional()
//   //   state?: string;

//   //   @IsString()
//   //   @IsOptional()
//   //   country?: string;

//   //   @IsString()
//   //   @IsOptional()
//   //   zipCode?: string;

//   //   @IsString()
//   //   @IsOptional()
//   //   nextOfKinFirstName?: string;

//   //   @IsString()
//   //   @IsOptional()
//   //   nextOfKinLastName?: string;

//   //   @IsString()
//   //   @IsOptional()
//   //   nextOfKinEmail?: string;

//   //   @IsString()
//   //   @IsOptional()
//   //   nextOfKinPhoneNumber?: string;

//   //   @IsString()
//   //   @IsOptional()
//   //   nextOfKinAddress?: string;

//   //   @IsString()
//   //   @IsOptional()
//   //   nextOfKinRelationship?: string;
// }

export class responseDto {
  data: [UserDocument];
  count: number;
  totalPages: number;
  currentPage: number;
}
