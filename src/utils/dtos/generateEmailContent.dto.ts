import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { StaffEmailDto } from './addStaffEmail.dto';

export class GenerateEmailContentDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  link?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiPropertyOptional()
  @IsOptional()
  content: StaffEmailDto;
}