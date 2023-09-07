import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TransferPatientDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ward: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bed: string;
}
