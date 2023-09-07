import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CategoryEnum } from 'src/utils/enums/category.enum';
import { mongooseSchemaConfig } from '../../database/schema.config';
import { AllergyLevelEnum } from '../../enums/allergies.enum';

// @Schema(mongooseSchemaConfig)

export class AllergiesEntity {
    @Prop({ type: String, enum: CategoryEnum})
    category: CategoryEnum

    @Prop()
    allergen: string

    @Prop({type: String})
    level: AllergyLevelEnum

    @Prop()
    reaction: string
}

// export const AllergiesSchema = SchemaFactory.createForClass(AllergiesEntity);
// export type AllergiesDocument = AllergiesEntity & Document;
