import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose'
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { RoleEntity } from './role.schema';

@Schema(mongooseSchemaConfig)
export class DesignationEntity {
  @Prop({required: true, unique: true})
  name: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: RoleEntity.name })
  role: Types.ObjectId;

  // @Prop({ type: Object.values(ApplicationPermissions) })
  // permissions: ApplicationPermissions[];
}

export const DesignationSchema = SchemaFactory.createForClass(DesignationEntity);
export type DesignationDocument = DesignationEntity & Document;

// DesignationSchema.pre('save', function (next) {
//   //capitalise first letter of name and description if they exist
//   this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
//   if (this.description) {
//     this.description =

//       this.description.charAt(0).toUpperCase() + this.description.slice(1);
//   }
//   next();
// });