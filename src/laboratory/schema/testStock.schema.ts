import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { StockEntity } from 'src/inventory/schema/stock.schema';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { StockUnitEnum } from 'src/utils/enums/stockUnitEnum';

@Schema(mongooseSchemaConfig)
export class TestStockEntity {
    @Prop({type: Types.ObjectId, ref: StockEntity.name})
    stockItem: Types.ObjectId

    @Prop()
    quantity: number

    @Prop({type: String})
    unit: StockUnitEnum
}
export const TestStockSchema = SchemaFactory.createForClass(TestStockEntity);
export type TestStockDocument = TestStockEntity & Document;