import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserSchema } from 'src/user/schema/user.schema';
import { WardsModule } from 'src/wards/wards.module';
import { DepartmentController } from './controller/department.controller';
import { UnitController } from './controller/unit.controller';
import { DepartmentEntity, DepartmentSchema } from './schema/department.schema';
import { UnitEntity, UnitSchema } from './schema/unit.schema';
import { DepartmentService } from './service/department.service';
import { UnitService } from './service/unit.service';

@Module({
  imports: [
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
        name: UnitEntity.name,
        useFactory: () => {
          return UnitSchema;
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
    WardsModule,
  ],
  controllers: [DepartmentController, UnitController],
  providers: [DepartmentService, UnitService],
})
export class DepartmentModule {}
