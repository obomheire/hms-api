import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { mongooseSchemaConfig } from "src/utils/database/schema.config";

@Schema(mongooseSchemaConfig)
export class DoseEntity {
  @Prop()
  time: string;

  @Prop()
  uniqueCode: string;

  @Prop({ type: String, enum: ["pending", "taken", "skipped"]})
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "UserEntity" })
  patient: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "DrugProductEntity" })
  item: string;

  @Prop()
  brandName: string;

  @Prop()
  strength: string;

  @Prop()
  genericName: string;

  @Prop()
  drugType: string;

  @Prop()
  frequency: string;

  @Prop()
  amount: number;

  @Prop()
  foodRelation: string;

  @Prop()
  routeOfAdmin: string;
}

export type DoseDocument = DoseEntity & Document;
export const DoseSchema = SchemaFactory.createForClass(DoseEntity);