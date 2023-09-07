import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NotificationService } from '../service/notification.service';
import { AppNotificationService } from '../service/socket-notification.service';
import { Request } from 'express';

@Controller('notification')
@ApiTags('Notification')
@ApiBearerAuth('Bearer')
export class NotificationController {
  constructor(private readonly notificationService: AppNotificationService) {}

  //read one notification
  @ApiParam({ name: 'id', description: 'Notification id' })
  @Patch('mobile/read/:id')
  async readNotification(@Param('id') id: string) {
    return this.notificationService.readNotification(id);
  }

  //read all notifications
  @Patch('mobile/read-all')
  async readAllNotifications(@Req() req: Request) {
    return this.notificationService.readNotifications(req.user.toString());
  }

  //get all notifications
  @ApiQuery({ name: 'page', description: 'Page number' })
  @ApiQuery({ name: 'limit', description: 'Limit number' })
  @Get('mobile/all')
  async getAllNotifications(
    @Req() req: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 100,
  ) {
    return this.notificationService.getAllNotificationsByUserId(
      req.user.toString(),
      page,
      limit,
    );
  }

  //delete notification
  @ApiParam({ name: 'id', description: 'Notification id' })
  @Delete('mobile/delete/:id')
  async deleteNotification(@Param('id') id: string) {
    return this.notificationService.deleteNotification(id);
  }

//   @Post('create')
//   async createNotification() {
//     return this.notificationService.createNotification({
//       userId: 'patient',
//       message: 'You have a new appointment',
//       title: 'New Appointment',
//     });
//   }

 @Get('mobile/count')
 async getUnreadNotificationsCount(@Req() req: Request) {
    return this.notificationService.getCountOfUnreadNotifications(
      req.user.toString(),
    );
  }


  @ApiQuery({ name: 'page', description: 'Page number' })
  @ApiQuery({ name: 'limit', description: 'Limit number' })
  @Get('account')
  async getAccountNotification(@Query('page') page = 1, @Query('limit') limit = 100) {
    return this.notificationService.getAllNotificationsForAccount(page, limit);
  }

  @ApiQuery({ name: 'page', description: 'Page number' })
  @ApiQuery({ name: 'limit', description: 'Limit number' })
  @Get('pharmacy')
  async getPharmacyNotification(@Query('page') page = 1, @Query('limit') limit = 100) {
    return this.notificationService.getAllNotificationsForPharmacy(page, limit);
  }

  @ApiQuery({ name: 'page', description: 'Page number' })
  @ApiQuery({ name: 'limit', description: 'Limit number' })
  @Get('lab')
  async getLabNotification(@Query('page') page = 1, @Query('limit') limit = 100) {
    return this.notificationService.getAllNotificationsForLaboratory(page, limit);
  }
}
