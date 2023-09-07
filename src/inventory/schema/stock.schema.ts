import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';

@Schema(mongooseSchemaConfig)
export class StockEntity {
    @Prop()
    name: string

    @Prop()
    totalQuantity: number

    @Prop()
    unit: string
}

export const StockSchema = SchemaFactory.createForClass(StockEntity);
export type StockDocument = StockEntity & Document;