import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationEntity, NotificationDocument } from '../schema/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(NotificationEntity.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async create(notification: CreateNotificationDto): Promise<NotificationDocument> {
    const createdNotification = new this.notificationModel(notification);
    return createdNotification.save();
  }

  async findByUserId(userId: string): Promise<NotificationDocument[]> {
    return this.notificationModel.find({ userId }).exec();
  }

  async markAsRead(id: string): Promise<NotificationDocument> {
    return this.notificationModel.findByIdAndUpdate(
      id,
      { read: true },
      { new: true },
    );
  }
}
