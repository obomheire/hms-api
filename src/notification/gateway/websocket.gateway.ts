import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: 'mobile/hms', cors: { origin: '*'} })
export class WebSocketGate {
  @WebSocketServer()
  server: Server;


  // async handleConnection(client: any) {
  //   // const notifications = await this.notificationsService.findAll();
  //   client.emit('notifications', notifications);
  // }
}
