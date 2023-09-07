import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import {
  NotificationDocument,
  NotificationEntity,
} from '../schema/notification.schema';
import { WebSocketGate } from '../gateway/websocket.gateway';

@Injectable()
export class AppNotificationService {
  constructor(
    @InjectModel(NotificationEntity.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly webSocketGateway: WebSocketGate,
  ) {}

  //create notification
  async createNotification(createNotificationDto: CreateNotificationDto) {
    try {
      const notification = new this.notificationModel(createNotificationDto);
      const result = await notification.save();
      this.webSocketGateway.server.emit('notification', result);
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  /*
@SubscribeMessage('createNotification')
  async create(client: Socket, notification: CreateNotificationDto) {
    console.log("notification")
    console.log(client.id)
    const createdNotification = await this.notificationsService.create(
      notification,
    );
    console.log(createdNotification)
    client.broadcast
      .to(notification.userId)
      .emit('newNotification', createdNotification);
  }
  */



  //get all notifications by user id
  async getAllNotificationsByUserId(userId: string, page = 1, limit = 100) {
    try {
      const result = await this.notificationModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      const count = await this.notificationModel.countDocuments({ userId });
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return { result, totalPages, currentPage, count };
    } catch (error) {
      console.log(error);
    }
  }

  //read a notification
  async readNotification(id: string) {
    try {
      const result = await this.notificationModel.findByIdAndUpdate(
        id,
        { read: true },
        { new: true },
      );
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  //read all notifications
  async readNotifications(userId: string): Promise<any> {
    try {
      const result = await this.notificationModel.updateMany(
        { userId, read: false },
        { read: true },
        { new: true },
      );
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  //delete a notification
  async deleteNotification(id: string): Promise<string> {
    try {
      await this.notificationModel.findByIdAndDelete(id);
      return 'Notification deleted successfully';
    } catch (error) {
      console.log(error);
    }
  }

  //delete all notifications
    async deleteNotifications(userId: ObjectId): Promise<string> {
        try {
           await this.notificationModel.deleteMany({ userId });
            return 'Notifications deleted successfully';
        }
        catch (error) {
            console.log(error);
        }
    }

    async getCountOfUnreadNotifications(userId: string): Promise<number> {
      try {
        const count = await this.notificationModel.countDocuments({ userId, read: false });
        return count;
      }
      catch (error) {
        throw error;
      }
    }

    //get all notifications for account, that is where 'to' is ACCOUNTS
    async getAllNotificationsForAccount(page = 1, limit = 100) {
      try {
        const result = await this.notificationModel
          .find({ to: 'ACCOUNTS' })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
        const unreadCount = await this.notificationModel.countDocuments({ to: 'ACCOUNTS', read: false });
        const count = await this.notificationModel.countDocuments({ to: 'ACCOUNTS' });
        const totalPages = Math.ceil(count / limit);
        const currentPage = page;
        return { result, totalPages, currentPage, count, unreadCount };
      } catch (error) {
        console.log(error);
      }
    }

    async getAllNotificationsForLaboratory(page = 1, limit = 100) {
      try {
        const result = await this.notificationModel
          .find({ to: 'Laboratory' })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
        const count = await this.notificationModel.countDocuments({ to: 'Laboratory' });
        const unreadCount = await this.notificationModel.countDocuments({ to: 'Laboratory', read: false });
        const totalPages = Math.ceil(count / limit);
        const currentPage = page;
        return { result, totalPages, currentPage, count, unreadCount };
      } catch (error) {
        console.log(error);
      }
    }

    //get all notifications for a, that is where 'key' is PHARMACY
    async getAllNotificationsForPharmacy(page = 1, limit = 100) {
      try {
        const result = await this.notificationModel
          .find({ key: 'Pharmacy' })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
        const count = await this.notificationModel.countDocuments({ key: 'PHARMACY' });
        const unreadCount = await this.notificationModel.countDocuments({ to: 'PHARMACY', read: false });
        const totalPages = Math.ceil(count / limit);
        const currentPage = page;
        return { result, totalPages, currentPage, count, unreadCount };
      } catch (error) {
        console.log(error);
      }
    }

}
