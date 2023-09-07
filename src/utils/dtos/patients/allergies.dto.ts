import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { AllergyLevelEnum } from 'src/utils/enums/allergies.enum';
import { CategoryEnum } from 'src/utils/enums/category.enum';

export class AllergiesDto {
  @ApiPropertyOptional({enum: AllergyLevelEnum,
    example: CategoryEnum.FOOD})
  @IsEnum(CategoryEnum)
  @IsOptional()
  category?: CategoryEnum;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  allergen?: string;

  @ApiPropertyOptional({
    enum: AllergyLevelEnum,
    example: AllergyLevelEnum.HIGH,
  })
  @IsEnum(AllergyLevelEnum)
  @IsOptional()
  level?: AllergyLevelEnum;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reaction: string;
}