import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { PatientEntity } from 'src/patients/schema/patients.schema';
import { UserEntity } from 'src/user/schema/user.schema';
import { mongooseSchemaConfig } from 'src/utils/database/schema.config';
import { NotificationType } from '../enum/notification.enum';

@Schema(mongooseSchemaConfig)
export class NotificationEntity {
  @Prop()
  title: string;

  @Prop({ type: Types.ObjectId, ref: UserEntity.name || PatientEntity.name })
  userId: string;

  @Prop()
  token: string;

  @Prop()
  key: string;

  @Prop({ type: String, enum: NotificationType })
  type: string;

  @Prop()
  link: string;

  @Prop({
    default: false,
  })
  read: boolean;

  @Prop()
  message: string;

  @Prop()
  otherId: string;

  @Prop()
  to: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  otherFields: { [key: string]: string|number|boolean };
}
export const NotificationSchema =
  SchemaFactory.createForClass(NotificationEntity);
export type NotificationDocument = NotificationEntity & Document;
