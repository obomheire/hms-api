import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { mongooseSchemaConfig } from "src/utils/database/schema.config";
import { DisputeStatus } from "../enum/dispute.enum";
import { ReasonForRefundEnum } from "../enum/refund.enum";

@Schema(mongooseSchemaConfig)
export class DisputeEntity {
    @Prop({ unique: true })
    uniqueCode: string

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PatientEntity' })
    patient: string

    @Prop({ type: String, enum: DisputeStatus, default: DisputeStatus.PENDING })
    status: DisputeStatus

    @Prop()
    amount: number

    @Prop()
    transactionAmount: number

    @Prop()
    transactionId: string

    @Prop()
    comment: string

    @Prop()
    dateResolved: Date

    @Prop({ default: false })
    isApproved: boolean

    @Prop({ default: false })
    isRejected: boolean

    @Prop()
    dateClosed: Date

    @Prop()
    dateCreated: Date

    @Prop({ type: String, enum: ReasonForRefundEnum })
    reason: ReasonForRefundEnum

    @Prop()
    notes: string
}

export const DisputeSchema = SchemaFactory.createForClass(DisputeEntity);
export type DisputeDocument = DisputeEntity & Document;