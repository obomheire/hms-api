import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class PaginationDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  limit: number = 15

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  page: number = 1

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  searchTerm: string;
}
