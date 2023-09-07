import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WardEntity, WardSchema } from './schema/wards.schema';
import { WardsController } from './controller/wards.controller';
import { ClinicEntity, ClinicSchema } from './schema/clinic.schema';
import { PatientEntity, PatientSchema } from 'src/patients/schema/patients.schema';
import { WardsService } from './service/wards.service';
import { ClinicService } from './service/clinic.service';
import { ClinicController } from './controller/clinic.controller';
import { DepartmentEntity, DepartmentSchema } from 'src/department/schema/department.schema';
import { PatientsModule } from 'src/patients/patients.module';

@Module({
  imports: [
    forwardRef(() => PatientsModule),
    MongooseModule.forFeatureAsync([
      {
        name: WardEntity.name,
        useFactory: () => {
          return WardSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: ClinicEntity.name,
        useFactory: () => {
          return ClinicSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: PatientEntity.name,
        useFactory: () => {
          return PatientSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: DepartmentEntity.name,
        useFactory: () => {
          return DepartmentSchema;
        },
      },
    ]),
  ],
  providers: [WardsService, ClinicService],
  controllers: [WardsController, ClinicController],
  exports: [WardsService, ClinicService]
})
export class WardsModule {}
