import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { DrugUnitEnum } from '../enum/unit.enum';
import { DrugProductEntity } from './product.schema';


@Schema(mongooseSchemaConfig)
export class ProductBatchEntity {

  @Prop({ type: Types.ObjectId, ref: DrugProductEntity.name })
  product: string;

  @Prop()
  quantity: number;

  // @Prop()
  // unit: DrugUnitEnum;

  @Prop()
  expiryDate: Date;

  @Prop({ unique: true }) 
  batchNumber: string;

  @Prop() 
  purchasePrice: number;

  @Prop() 
  sellingPrice: number;
}
export const ProductBatchSchema = SchemaFactory.createForClass(ProductBatchEntity);
export type ProductBatchDocument = ProductBatchEntity & Document;
