import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Types } from 'mongoose';
import { DrugFrequencyEnum } from 'src/utils/enums/patients/drugFrequency.enum';
import { FoodRelationEnum } from 'src/utils/enums/patients/foodRelation.enum';
import { RouteOfAdminEnum } from 'src/utils/enums/patients/routeOfAdmin.enum';

export class PrescriptionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  product: Types.ObjectId;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    enum: DrugFrequencyEnum,
    example: DrugFrequencyEnum.BD,
  })
  DrugFrequencyEnum?: DrugFrequencyEnum;
  @IsString()
  @IsOptional()
  frequency?: DrugFrequencyEnum;

  @ApiPropertyOptional({
    enum: RouteOfAdminEnum,
    example: RouteOfAdminEnum.INHALATION,
  })
  RouteOfAdminEnum?: RouteOfAdminEnum;
  @IsString()
  @IsOptional()
  routeOfAdmin?: RouteOfAdminEnum;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  duration: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  amount: number;

  @ApiPropertyOptional({
    enum: FoodRelationEnum,
    example: FoodRelationEnum.AFTER_MEAL,
  })
  FoodRelationEnum?: FoodRelationEnum;
  @IsString()
  @IsOptional()
  foodRelation?: FoodRelationEnum;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  batchId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  arbitraryQuantity?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  quantity?: number;
}
