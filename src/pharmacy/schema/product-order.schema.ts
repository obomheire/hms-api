import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiParam, ApiProperty } from "@nestjs/swagger";
import mongoose from "mongoose";
import { mongooseSchemaConfig } from "src/utils/database/schema.config";
import { ProductOrderEnum } from "../enum/product-order.enum";
import { DrugProductEntity } from "./product.schema";

export class ProductOrderSchemaEntity {
    @ApiProperty()
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: DrugProductEntity.name,
    })
    product: string

    @ApiProperty()
    @Prop()
    quantity: number
}

@Schema(mongooseSchemaConfig)
export class ProductOrderEntity {
    @Prop({
        // type: [ProductOrderSchemaEntity]
    })
    items: ProductOrderSchemaEntity[]

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PatientEntity',
    })
    patient: string

    @Prop()
    uniqueCode: string;

    @Prop()
    totalCost: number

    @Prop({
        type: String,
        enum: Object.values(ProductOrderEnum),
    })
    status: ProductOrderEnum

    id: string

    @Prop()
    dispensedDate: string

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserEntity',
    })
    dispensedBy: string
}
export const ProductOrderSchema = SchemaFactory.createForClass(ProductOrderEntity);
export type ProductOrderDocument = ProductOrderEntity & Document;
