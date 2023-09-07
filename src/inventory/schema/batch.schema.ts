import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DrugUnitEnum } from 'src/pharmacy/enum/unit.enum';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { ItemProductEntity } from './itemProduct.schema';
import { NewVendorEntity } from './newVendor.schema';


@Schema(mongooseSchemaConfig)
export class ItemBatch {

  @Prop({ type: Types.ObjectId, ref: ItemProductEntity.name })
  product: string;

  @Prop()
  quantity: number;

  @Prop()
  unit: DrugUnitEnum;

  @Prop()
  expiryDate: Date;

  @Prop({ unique: true }) 
  batchNumber: string;

  @Prop() 
  purchasePrice: number;

  @Prop() 
  sellingPrice: number;

  @Prop({ type: Types.ObjectId, ref: NewVendorEntity.name })
  vendor: string;
}
export const ItemBatchSchema = SchemaFactory.createForClass(ItemBatch);
export type ItemBatchDocument = ItemBatch & Document;
