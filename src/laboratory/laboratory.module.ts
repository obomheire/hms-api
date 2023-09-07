import { forwardRef, Module } from '@nestjs/common';
import { LaboratoryService } from './service/laboratory.service';
import { LaboratoryController } from './controller/laboratory.controller';
import { TestService } from './service/test.service';
import { TestController } from './controller/test.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TestEntity, TestSchema } from './schema/test.schema';
import { LabStockService } from './service/labStock.service';
import { LabStockController } from './controller/labStock.controller';
import { LabStockEntity, LabStockSchema } from './schema/labStock.schema';
import {
  StockUsageEntity,
  StockUsageSchema,
} from './schema/recordUsage.schema';
import { PatientsModule } from 'src/patients/patients.module';
import { PatientsService } from 'src/patients/service/patients.service';
import {
  OrderEntity,
  OrderSchema,
} from 'src/utils/schemas/laboratory/makeorder.schema';
import {
  InvestigationEntity,
  InvestigationSchema,
} from 'src/patients/schema/investigation.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: TestEntity.name,
        useFactory: () => {
          return TestSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: LabStockEntity.name,
        useFactory: () => {
          return LabStockSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: StockUsageEntity.name,
        useFactory: () => {
          return StockUsageSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: OrderEntity.name,
        useFactory: () => {
          return OrderSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: InvestigationEntity.name,
        useFactory: () => {
          return InvestigationSchema;
        },
      },
    ]),
    forwardRef(() => PatientsModule),
    CloudinaryModule,
  ],
  controllers: [LaboratoryController, TestController, LabStockController],
  providers: [LaboratoryService, TestService, LabStockService],
  exports: [TestService, LabStockService],
})
export class LaboratoryModule {}
