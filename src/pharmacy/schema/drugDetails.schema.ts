import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { DrugTypeEntity } from './drugType.schema';
import { DrugGenericEntity } from './generic.schema';
import { DrugProductEntity } from './product.schema';

@Schema(mongooseSchemaConfig)
export class DrugDetailesEntity {
  @Prop({ type: Types.ObjectId, ref: DrugProductEntity.name })
  item: string;

  @Prop()
  unitCost: number;

  @Prop()
  quantity: number;
}
export const DrugDetailsSchema =
  SchemaFactory.createForClass(DrugDetailesEntity);
export type DrugDeatilsDocument = DrugDetailesEntity & Document;
