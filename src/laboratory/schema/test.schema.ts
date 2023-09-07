import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { Type } from 'class-transformer';
import { TestStockEntity, TestStockSchema } from './testStock.schema';

@Schema({
    ...mongooseSchemaConfig,
    strict: false,
    
})
export class TestEntity {
    @Prop()
    testName: string

    @Prop()
    testType: string

    @Prop()
    testCode: string

    @Prop()
    rate: number

    @Prop()
    duration: string

     @Prop({ type: [{ type: TestStockSchema, ref: TestStockEntity.name }] })
    @Type(() => TestStockEntity)
    stock?: TestStockEntity[];

    @Prop({
        type: Number,
        default: 30
    })
    maxDailyLimit: number

    _id: Types.ObjectId

}

export const TestSchema = SchemaFactory.createForClass(TestEntity);
export type TestDocument = TestEntity & Document;