import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';

@Schema(mongooseSchemaConfig)
export class UnitTypeEntity {
  @Prop()
  name: string;
}
export const UnitTypeSchema = SchemaFactory.createForClass(UnitTypeEntity);
export type UnitTypeDocument = UnitTypeEntity & Document;
