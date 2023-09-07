import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';

@Schema(mongooseSchemaConfig)
export class ItemTypeEntity {
  @Prop()
  name: string;
}
export const ItemTypeSchema = SchemaFactory.createForClass(ItemTypeEntity);
export type ItemTypeDocument = ItemTypeEntity & Document;
