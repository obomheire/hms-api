import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommandModule } from 'nestjs-command';
import { DepartmentEntity, DepartmentSchema } from 'src/department/schema/department.schema';
import { RoleModule } from 'src/role/role.module';
import { RoleEntity, RoleSchema } from 'src/role/schema/role.schema';
import { ShiftEntity, ShiftSchema } from 'src/shifts/schema/shifts.schema';
import { TransactionTypeModule } from 'src/transaction-types/transaction-type.module';
import { UserEntity, UserSchema } from 'src/user/schema/user.schema';
// import { DepartmentSeed } from './department.seed';
import { SeedsService } from './seeds.service';
import { ShiftSeedsService } from './shift.seed.service';

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
        name: ShiftEntity.name,
        useFactory: () => {
          return ShiftSchema;
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
        name: RoleEntity.name,
        useFactory: () => {
          return RoleSchema;
        },
      },
    ]),
    CommandModule,
    TransactionTypeModule
  ],
  providers: [SeedsService, ShiftSeedsService],
  // exports: [DepartmentSeed],
})
export class SeedsModule {}
