import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsString } from "class-validator";
import { InvestigationEntity } from "src/patients/schema/investigation.schema";
import { Document, Types } from 'mongoose';
import { TestEntity } from "src/laboratory/schema/test.schema";
export class CheckIfDateAvailableDto {
    @ApiProperty()
    @IsMongoId()
    @IsNotEmpty()
    testId: string

    @ApiProperty()
    @IsString()
    date: string
}

export class InvestigationBookingDto{
    @ApiProperty()
    @IsMongoId()
    @IsNotEmpty()
    investigation: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    date: string

    @ApiProperty()
    @IsMongoId()
    @IsNotEmpty()
    patient: string
}


export interface Booking extends Document {
    _id: Types.ObjectId
    date: string;
    investigation: InvestigationEntity & { test: TestEntity };
    patient: string;
  }
  
