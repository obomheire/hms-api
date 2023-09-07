import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { UnitEntity } from 'src/department/schema/unit.schema';
import { UserEntity } from 'src/user/schema/user.schema';
import { LabStockEntity } from './labStock.schema';

@Schema(mongooseSchemaConfig)
export class StockUsageEntity {
    @Prop({type: Types.ObjectId, ref: UserEntity.name })
    usedBy: Types.ObjectId

    @Prop({type: Types.ObjectId, ref: UnitEntity.name })
    unit: Types.ObjectId

    @Prop({type: Types.ObjectId, ref: 'LabStockEntity'})
    item: Types.ObjectId

    @Prop()
    quantity: number

    @Prop()
    reason: string

    @Prop({ type: Types.ObjectId, ref: 'InvestigationEntity'})
    investigationId: string
}

export const StockUsageSchema = SchemaFactory.createForClass(StockUsageEntity);
export type StockUsageDocument = StockUsageEntity & Document;