import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class FilterAppointmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search: string;
  
}

export class UpcomingDoctorDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  searchTerm: string = '';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  doctorId: string;
  
}
