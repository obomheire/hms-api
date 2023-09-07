import * as mongoose from 'mongoose';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose'
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { ApplicationPermissions } from 'src/utils/enums/permissions.enum';
import { PermissionCategory } from 'src/utils/enums/permissionCategory.enum';

@Schema(mongooseSchemaConfig)
export class PermissionEntity {
  @Prop({
    unique: true,
    uppercase: true,
    enum: Object.values(ApplicationPermissions),
  })
  operationName: ApplicationPermissions;

  @Prop({ lowercase: true })
  name: string; // this is the human readable name

  @Prop({ lowercase: true })
  description: string;

  @Prop({ default: true })
  visible: boolean;

  @Prop({
    enum: Object.values(PermissionCategory),
  })
  category: PermissionCategory;
}

export const PermissionSchema = SchemaFactory.createForClass(PermissionEntity);
export type PermissionDocument = PermissionEntity & Document
