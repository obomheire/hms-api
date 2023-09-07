import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ProductOrderSchemaEntity } from '../schema/product-order.schema';

export class ProductOrderSchemaDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  product: string;

  @ApiProperty()
  @IsNotEmpty()
  quantity: number;
}
export class ProductOrderDto {
  @ApiProperty({
    type: [ProductOrderSchemaDto],
    description: 'items to order',
  })
  @IsArray()
  @ArrayNotEmpty()
  items: ProductOrderSchemaDto[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reference: string;
}
