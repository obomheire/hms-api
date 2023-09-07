import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import mongoose from "mongoose";
import { mongooseSchemaConfig } from "src/utils/database/schema.config";
import { CardStatusEnum } from "../enum/card.enum";

@Schema(mongooseSchemaConfig)
export class CardEntity {
    @Prop()
    name: string

    @Prop()
    type: string

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PatientEntity',
    })
    user: string

    @Prop({
        type: String,
        enum: Object.values(CardStatusEnum),

    })
    status: CardStatusEnum

    @Prop()
    token: string

    @Prop()
    default: boolean

    @Prop()
    meta: object

    @Prop()
    email: string

    @Prop()
    signature: string
}

export const CardSchema = SchemaFactory.createForClass(CardEntity);
export type CardDocument = CardEntity & Document;
