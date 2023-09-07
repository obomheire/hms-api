import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentsModule } from 'src/appointments/appointments.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PatientsModule } from 'src/patients/patients.module';
import { UserModule } from 'src/user/user.module';
import { WardsModule } from 'src/wards/wards.module';
import { AdminController } from './controller/admin.controller';
import { HospitalAddressEntity, HospitalAddressSchema } from './schema/hospital-profile.schema';
import { AdminService } from './service/admin.service';
import { HospitalProfileService } from './service/hospital-address.service';

@Module({
  imports: [
    UserModule,
    forwardRef(() =>PatientsModule),
    AppointmentsModule,
    WardsModule,
    CloudinaryModule,
    MongooseModule.forFeatureAsync([
      {
        name: HospitalAddressEntity.name,
        useFactory: () => {
          return HospitalAddressSchema;
        },
      },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, HospitalProfileService],
  exports: [AdminService, HospitalProfileService],
})
export class AdminModule {}
