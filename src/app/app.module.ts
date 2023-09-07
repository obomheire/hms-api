import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './service/app.service';
import { AppController } from './controller/app.controller';
import { envConfig } from '../config/constant/env.configuration';
import { configValidation } from '../config/validator/config.validator';
import { MailsModule } from '../providers/mails/mails.module';
import { UserModule } from '../user/user.module';
import { PatientsModule } from 'src/patients/patients.module';
import { TokenMiddleware } from 'src/utils/middlewares/token.middleware';
import { AuthModule } from 'src/auth/auth.module';
import { AppointmentsModule } from 'src/appointments/appointments.module';
import { TasksModule } from 'src/tasks/tasks.module';
import { DepartmentModule } from 'src/department/department.module';
import { WardsModule } from 'src/wards/wards.module';
import { SeedsModule } from 'src/seeds/seeds.module';
import { ShiftsModule } from 'src/shifts/shifts.module';
import { AdminModule } from 'src/admin/admin.module';
import { LaboratoryModule } from 'src/laboratory/laboratory.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { PharmacyModule } from 'src/pharmacy/pharmacy.module';
import { RoleModule } from 'src/role/role.module';
import { SmsModule } from 'src/sms/sms.module';
import { AccountingModule } from 'src/accounting/accounting.module';
import { NotificationModule } from 'src/notification/notification.module';
import { PaymentModule } from 'src/payment/payment.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { InvestigationBookingModule } from 'src/investigation-booking/investigation-booking.module';
import { HmoModule } from 'src/hmo/hmo.module';

@Module({
  imports: [
    UserModule,
    PatientsModule,
    InventoryModule,
    ShiftsModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>(envConfig.CONNECTION_STRING),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: false,
      validationSchema: configValidation,
      envFilePath: ['.env'],
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      ignoreErrors: false,
    }),
    TerminusModule,
    HttpModule,
    AuthModule,
    AppointmentsModule,
    MailsModule,
    TasksModule,
    DepartmentModule,
    WardsModule,
    SeedsModule,
    AdminModule,
    LaboratoryModule,
    PharmacyModule,
    RoleModule,
    SmsModule,
    AccountingModule,
    NotificationModule,
    PaymentModule,
    InvestigationBookingModule,
    HmoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
  
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    return consumer
      .apply(TokenMiddleware)
      .exclude(
        { path: '/api/v1/auth/login', method: RequestMethod.POST },
        { path: '/api/v1/patients/mobile/patient-login', method: RequestMethod.POST },
        { path: '/api/v1/auth/forgot-password', method: RequestMethod.POST },
        { path: '/api/v1/user/change-password-login', method: RequestMethod.PATCH },
        { path: '/api/v1/webhook', method: RequestMethod.POST },
        { path: '/api/v1/patients/mobile/forgot-password', method: RequestMethod.POST },
        { path: '/api/v1/patients/mobile/reset-password', method: RequestMethod.POST },
        { path: '/api/v1/auth/change-password-login/:id', method: RequestMethod.PATCH },
        { path: '/api/v1/auth/reset-password/:token', method: RequestMethod.PATCH },
        { path: '/api/v1/notification/create', method: RequestMethod.POST },
        )
      .forRoutes('*');
  } 
}
// export class AppModule {}


