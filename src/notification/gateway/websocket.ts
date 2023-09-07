import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationsService } from '../service/notifications.service';

@WebSocketGateway({ namespace: 'api/notifications'})
export class NotificationsGateway implements OnGatewayConnection {
  constructor(private readonly notificationsService: NotificationsService) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    // const userId = client.handshake.query.userId.toString();
    console.log(client?.handshake, "handshake")
    // const notifications = await this.notificationsService.findByUserId(userId);
    console.log("connected")
  }

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

  @SubscribeMessage('markAsRead')
  async markAsRead(client: Socket, id: string) {
    const notification = await this.notificationsService.markAsRead(id);
    client.broadcast
      .to(notification.userId)
      .emit('notificationRead', notification);
  }
}
