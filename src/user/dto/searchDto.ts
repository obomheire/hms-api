import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class SearchDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional()
  // @IsString()
  @IsOptional()
  search: string | null;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  roleFilter;
}
