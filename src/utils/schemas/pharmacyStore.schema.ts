import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';

@Schema(mongooseSchemaConfig)
export class PharmacyStoreEntity {
    @Prop()
    name: string

    @Prop()
    description: string
}
export type PharmacyStoreDocument = PharmacyStoreEntity & Document;
export const PharmacyStoreSchema = SchemaFactory.createForClass(PharmacyStoreEntity);
