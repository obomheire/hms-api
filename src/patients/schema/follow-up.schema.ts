import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { mongooseSchemaConfig } from "src/utils/database/schema.config";
import { FollowUpStatusEnum } from "../enum/follow-up-status.enum";

@Schema(mongooseSchemaConfig)
export class FollowUpEntity {
    @Prop({ type: Types.ObjectId, ref: 'VisitEntity' })
    visitId: string;

    @Prop()
    description: string;

    @Prop()
    followUpDate: Date;

    @Prop({ type: String, default: FollowUpStatusEnum.PENDING })
    status: string;

    @Prop({ type: Types.ObjectId, ref: 'PatientEntity' })
    patientId: string;

    @Prop({ type: Types.ObjectId, ref: 'UserEntity' })
    doctor: string

    @Prop({ type: Types.ObjectId, ref: 'AppointmentEntity' })
    appointment: string
}
export const FollowUpSchema = SchemaFactory.createForClass(FollowUpEntity);
export type FollowUpDocument = FollowUpEntity & Document;