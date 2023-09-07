import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { ItemTypeEntity } from './itemType.schema';
import { DrugUnitEnum } from '../../pharmacy/enum/unit.enum'

@Schema(mongooseSchemaConfig)
export class ItemProductEntity {
  [x: string]: any;
  @Prop()
  itemName: string;

  @Prop({ type: Types.ObjectId, ref: ItemTypeEntity.name })
  itemType: string;

  @Prop()
  unitType: DrugUnitEnum;

  // @Prop()
  // strength: string;
  @Prop({ unique: true })
  uniqueCode: string;

  @Prop({ default: 0 })
  availableQuantity: number;

  @Prop()
  brandName: string;

  @Prop()
  unitCost: number;

  @Prop()
  itemDescription: string;

  @Prop()
  itemImage: string;
}
export const ItemProductSchema =
  SchemaFactory.createForClass(ItemProductEntity);
export type ItemProductDocument = ItemProductEntity & Document;
