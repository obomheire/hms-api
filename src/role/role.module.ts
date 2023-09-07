import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DesignationController } from './controller/designation.controller';
import { RoleController } from './controller/role.controller';
import { DesignationEntity, DesignationSchema } from './schema/designation.schema';
import { RoleEntity, RoleSchema } from './schema/role.schema';
import { DesignationService } from './service/designation.service';
import { RoleService } from './service/role.service';


@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: RoleEntity.name,
        useFactory: () => {
          return RoleSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: DesignationEntity.name,
        useFactory: () => {
          return DesignationSchema;
        },
      },
    ]),
  ],
  controllers: [RoleController, DesignationController],
  providers: [RoleService, DesignationService],
  exports: [DesignationService, RoleService],
})
export class RoleModule {}
