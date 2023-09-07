import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { UnitEntity } from 'src/department/schema/unit.schema';
// import { OrderEntity } from 'src/utils/schemas/laboratory/makeorder.schema';
import { StockUsageEntity } from './recordUsage.schema';
import { UnitItem } from '../enum/lab.enum';
import { DrugUnitEnum } from 'src/pharmacy/enum/unit.enum';

@Schema(mongooseSchemaConfig)
export class LabStockEntity {
    @Prop()
    itemName: string

    @Prop()
    category: string

    @Prop({ unique: true })
    uniqueCode: string

    // @Prop({type: Types.ObjectId, ref: UnitEntity.name})
    @Prop()
    location: string

    @Prop({default: 0})
    totalQuantity: number

    @Prop({type: String, enum: DrugUnitEnum})
    unitOfItem: string
    // @Prop({default: 0})
    // currentQuantity: number

    @Prop()
    dateLastRestocked: Date

    @Prop([{type: Types.ObjectId, ref: StockUsageEntity.name}])
    usageHistory: Types.ObjectId[]
}
const LabStockSchema = SchemaFactory.createForClass(LabStockEntity);
LabStockSchema.index({ itemName: 'text', category: 'text' });
export { LabStockSchema };
export type LabStockDocument = LabStockEntity & Document;