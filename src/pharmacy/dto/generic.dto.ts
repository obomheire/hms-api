import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenericDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  activeIngredient: string;
}

export class UpdateGenericDto extends PartialType(GenericDto) {}
