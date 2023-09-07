import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';

@Schema(mongooseSchemaConfig)
export class DrugGenericEntity {
  @Prop()
  activeIngredient: string;

}
export const DrugGenericSchema = SchemaFactory.createForClass(DrugGenericEntity);
export type DrugGenericDocument = DrugGenericEntity & Document;
