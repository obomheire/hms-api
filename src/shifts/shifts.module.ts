import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DepartmentEntity, DepartmentSchema } from 'src/department/schema/department.schema';
import { UnitEntity, UnitSchema } from 'src/department/schema/unit.schema';
import { UserEntity, UserSchema } from 'src/user/schema/user.schema';
import { ScheduleController } from './controller/schedule.controller';
import { ShiftsController } from './controller/shifts.controller';
import { ScheduleEntity, ScheduleSchema } from './schema/schedule.schema';
import { ShiftEntity, ShiftSchema } from './schema/shifts.schema';
import { ScheduleService } from './service/schedule.service';
import { ShiftsService } from './service/shifts.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: ShiftEntity.name,
        useFactory: () => {
          return ShiftSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: ScheduleEntity.name,
        useFactory: () => {
          return ScheduleSchema;
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
    MongooseModule.forFeatureAsync([
      {
        name: UserEntity.name,
        useFactory: () => {
          return UserSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: UnitEntity.name,
        useFactory: () => {
          return UnitSchema;
        },
      },
    ]),
  ],
  providers: [ShiftsService, ScheduleService],
  controllers: [ShiftsController, ScheduleController],
})
export class ShiftsModule {}
