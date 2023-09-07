import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { NotificationDto } from '../dto/notification.dto';
const ServiceAccount = require('src/utils/adminSdk.json');

const options = {
  priority: 'high',
  timeToLive: 60 * 60 * 24,
};

@Injectable()
export class NotificationService {
  private readonly app: admin.app.App;

  constructor() {
    this.app = admin.initializeApp({
      credential: admin.credential.cert(ServiceAccount),
    });
  }

//   async sendNotification(
//     data: NotificationDto
//   ) {
//     const { title, token, body, key, type } = data;
//     try {
//       const message = {
//         notification: {
//           title,
//           body,
//         },
//         token,
//         data: {
//           key,
//         },
//       };
//       console.log('Notification sent successfully');
//       return await this.app.messaging().send(token, message, options);
//     } catch (error) {
//       console.log(error);
//     }
//   }

  //send push notification
  async sendPushNotification(
    title: string,
    token: string,
    body: string,
    key?: string,
  ) {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        token,
        data: {
          key,
        },
      };
      console.log('Notification sent successfully');
      const response = await this.app
        .messaging()
        .send
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
    }
  }
}
