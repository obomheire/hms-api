import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsNotEmpty } from 'class-validator';
import { RecommendationType } from 'src/utils/enums/patients/recommendation-type.enum';

export class RecommendationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  doctor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  speciality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hospital?: string;

  @ApiProperty(
    {
      enum: RecommendationType,
      enumName: 'RecommendationType',
    },
  )
  @IsNotEmpty()
  @IsEnum( RecommendationType)
  type: RecommendationType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}