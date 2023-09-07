import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { mongooseSchemaConfig } from "src/utils/database/schema.config";
import { HmoStatusEnum } from "../enum/hmo.enum";

@Schema(mongooseSchemaConfig)
export class HmoEntity {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop()
    description: string;

    @Prop()
    address: string;

    @Prop()
    phoneNumber: string;

    @Prop()
    email: string;

    @Prop()
    website: string;

    @Prop()
    logo: string;

    @Prop({
        type: String,
        enum: Object.values(HmoStatusEnum),
    })
    status: HmoStatusEnum;
}

export const HmoSchema = SchemaFactory.createForClass(HmoEntity);
export type HmoDocument = HmoEntity & Document;