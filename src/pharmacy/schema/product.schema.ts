import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { DrugUnitEnum } from '../enum/unit.enum';
import { DrugTypeEntity } from './drugType.schema';
import { DrugGenericEntity } from './generic.schema';

@Schema(mongooseSchemaConfig)
export class DrugProductEntity {
  @Prop()
  drugName: string;

  @Prop({ type: Types.ObjectId, ref: DrugTypeEntity.name })
  drugType: string;

  @Prop({ type: Types.ObjectId, ref: DrugGenericEntity.name })
  genericName: string;

  @Prop({ default: 0 })
  availableQuantity: number;

  @Prop()
  brandName: string;

  @Prop()
  strength: string;

  @Prop()
  unit: DrugUnitEnum;

  @Prop()
  prodcutDescription: string;

  @Prop()
  purchasePrice: number;

  @Prop()
  salesPrice: number;

  @Prop() 
  productImage: string;
}
export const DrugProductSchema = SchemaFactory.createForClass(DrugProductEntity);
export type DrugProductDocument = DrugProductEntity & Document;
