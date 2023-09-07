import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { UnitEntity } from 'src/department/schema/unit.schema';
import { ItemBatch } from 'src/inventory/schema/batch.schema';
import { ItemProductEntity } from 'src/inventory/schema/itemProduct.schema';
import { UnitItem } from 'src/laboratory/enum/lab.enum';
import { LabStockEntity } from 'src/laboratory/schema/labStock.schema';
import { DrugUnitEnum } from 'src/pharmacy/enum/unit.enum';
import { UserEntity } from 'src/user/schema/user.schema';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { ApprovalEnum } from 'src/utils/enums/approval.enum';
import { ReasonDeclineEnum } from 'src/utils/enums/reason-decline.enum';


class ItemOrder {
    @Prop({type: Types.ObjectId, ref: ItemProductEntity.name, required: true})
    item: string
    @Prop({required: true})
    quantity: number

    @Prop({ type: String, enum: DrugUnitEnum})
    unitOfItem: string

    @Prop()
    image: string

    @Prop({type: Types.ObjectId, ref:  ItemBatch.name})
    batchId: Types.ObjectId
}

@Schema(mongooseSchemaConfig)
export class OrderEntity {
    // @Prop({type: Types.ObjectId, ref: "ItemProductEntity", required: true})
    // item: string
    @Prop([{ type: ItemOrder }])
    items: ItemOrder[]

    // @Prop({required: true})
    // quantity: number

    @Prop({ type: String, unique: true})
    uniqueCode: string

    @Prop({type: Types.ObjectId, ref: UserEntity.name})
    createdBy: Types.ObjectId

    @Prop({type: Types.ObjectId, ref: UserEntity.name})
    updatedBy: Types.ObjectId

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'UserEntity'})
    approvedOrRejectedBy: string

    // @Prop({type: Types.ObjectId, ref: UserEntity.name})
    // rejectedBy: Types.ObjectId
    // @Prop({ type: String, enum: DrugUnitEnum})
    // unitOfItem: string

    // @Prop()
    // image: string

    @Prop({type: Types.ObjectId, ref: UserEntity.name})
    receivedBy: Types.ObjectId

    @Prop({type: String, default: ApprovalEnum.PENDING})
    approval: ApprovalEnum

    @Prop({ type: String, default: ReasonDeclineEnum.NONE})
    reasonForDecline: ReasonDeclineEnum

    @Prop()
    note: string

}


export const OrderSchema = SchemaFactory.createForClass(OrderEntity);
export type OrderDocument = OrderEntity & Document;