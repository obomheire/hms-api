import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { UserEntity } from 'src/user/schema/user.schema';
import { mongooseSchemaConfig } from '../../database/schema.config';

@Schema({
    ...mongooseSchemaConfig,
    strict: false,
})
export class InvestigationResultEntity {
    @Prop()
    testHeading: string

    @Prop()
    testParam: string

    @Prop()
    testRes: number

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: UserEntity.name})
    doneBy: mongoose.Schema.Types.ObjectId;
}

export const InvestigationResultSchema =
  SchemaFactory.createForClass(InvestigationResultEntity);
export type InvestigationResultDocument = InvestigationResultEntity & Document;