import { Schema, SchemaFactory } from "@nestjs/mongoose";
import { mongooseSchemaConfig } from "src/utils/database/schema.config";


//this is the schema for the consultation payment entity for appointments
@Schema(mongooseSchemaConfig)
export class ConsultationEntity {
    
}


export const ConsultationSchema = SchemaFactory.createForClass(ConsultationEntity);
export type ConsultationDocument = ConsultationEntity & Document;