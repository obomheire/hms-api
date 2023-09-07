import * as mongoose from 'mongoose';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { RoleTypeEnum } from 'src/utils/enums/role.enum';
import { ApplicationPermissions } from 'src/utils/enums/permissions.enum';
import { urls } from '../constants/constant';

@Schema(mongooseSchemaConfig)
export class RoleEntity {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: RoleTypeEnum.User })
  roleType: RoleTypeEnum;

  // @Prop({ type: Object.values(ApplicationPermissions) })
  // permissions: ApplicationPermissions[];
  @Prop({
    type: [{ url: String, module: String }],
    validate: {
      validator: (permissions: any[]) => {
        return permissions.every((permission) => {
          return urls.some(
            (url) =>
              url.url === permission.url && url.module === permission.module,
          );
        });
      },
      message: 'Invalid permissions',
    },
    default: [],
  })
  permissions: { url: string; module: string }[];
}

export const RoleSchema = SchemaFactory.createForClass(RoleEntity);
export type RoleDocument = RoleEntity & Document;

RoleSchema.index({ name: 1 }, { unique: true });

RoleSchema.pre('save', function (next) {
  //change the name and description to uppercase
  this.name = this.name.toUpperCase();
  if (this.description) {
    this.description = this.description?.toUpperCase();
  }
  next();
});
