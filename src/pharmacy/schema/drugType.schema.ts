import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';

@Schema(mongooseSchemaConfig)
export class DrugTypeEntity {
  @Prop()
  name: string;
}
export const DrugTypeSchema = SchemaFactory.createForClass(DrugTypeEntity);
export type DrugTypeDocument = DrugTypeEntity & Document;
