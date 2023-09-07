import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from './controller/notification.controller';
import { NotificationsGateway } from './gateway/websocket';
import { WebSocketGate } from './gateway/websocket.gateway';
import { NotificationEntity, NotificationSchema } from './schema/notification.schema';
import { NotificationsService } from './service/notifications.service';
import { AppNotificationService } from './service/socket-notification.service';
// import { FirebaseModule } from 'nestjs/firebase';

// export const ServiceAccount = {
//     type: process.env.FIREBASE_TYPE,
//     project_id: process.env.FIREBASE_PROJECT_ID,
//     private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
//     private_key: process.env.FIREBASE_PRIVATE_KEY,
//     client_email: process.env.FIREBASE_CLIENT_EMAIL,
//     client_id: process.env.FIREBASE_CLIENT_ID,
//     auth_uri: process.env.FIREBASE_AUTH_URI,
//     token_uri: process.env.FIREBASE_TOKEN_URI,
//     auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
//     client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
// };


@Module({
  controllers: [NotificationController],
  imports: [
    // Import the MongooseModule forFeature() method to register the Notification schema
    MongooseModule.forFeatureAsync([
      {
        name: NotificationEntity.name,
        useFactory: () => {
          return NotificationSchema;
        },
      },
    ]),
    // FirebaseModule.forRoot({
    //   // Import the FirebaseModule forRoot() method to register the Firebase service
    //   credential: admin.credential.cert(serviceAccount),
    // }),

  ],
  providers: [AppNotificationService, WebSocketGate, NotificationsGateway, NotificationsService],
  exports: [AppNotificationService, NotificationsGateway],
})
export class NotificationModule {}
