import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { ItemRequisitionEntity } from "src/inventory/schema/itemRequisition.schema";
import { RequisitionEntity } from "src/pharmacy/schema/requisition.schema";
import { UserEntity } from "src/user/schema/user.schema";
import { mongooseSchemaConfig } from "../database/schema.config";
import { ReasonDisputeEnum } from "../enums/dispute-requisition.enum";
import { disputeAccountRequsitionEnum } from "../enums/requisitionStatus";

@Schema(mongooseSchemaConfig)
export class RequisitionDisputeEntity {
    @Prop({ type: String, enum: ['PHARMACY', 'INVENTORY'] })
    department: string

    @Prop({ type: String, enum: disputeAccountRequsitionEnum, default: disputeAccountRequsitionEnum.PENDING })
    status: string

    @Prop({ type: String })
    comment: string

    @Prop({ type: String, unique: true })
    uniqueCode: string

    @Prop({ type: Types.ObjectId, ref: UserEntity.name })
    createdBy: string

    @Prop({ type: String, enum: ReasonDisputeEnum })
    reason: string

    @Prop()
    dateResolved: Date

    @Prop({type: Types.ObjectId, ref: RequisitionEntity.name || ItemRequisitionEntity.name })
    requisition: string

}
export type RequisitionDisputeEntityDocument = RequisitionDisputeEntity & Document;
export const RequisitionDisputeSchema = SchemaFactory.createForClass(RequisitionDisputeEntity);
