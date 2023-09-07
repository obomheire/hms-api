import { forwardRef, Module } from '@nestjs/common';
import { PharmacyController } from './controller/pharmacy.controller';
import { PharmacyService } from './service/pharmacy.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DrugTypeEntity, DrugTypeSchema } from './schema/drugType.schema';
import { DrugGenericEntity, DrugGenericSchema } from './schema/generic.schema';
import { DrugProductEntity, DrugProductSchema } from './schema/product.schema';
import { DrugTypeController } from './controller/drugType.controller';
import { ProductController } from './controller/product.controller';
import { GenericController } from './controller/generic.controller';
import { DrugTypeService } from './service/drugType.service';
import { GenericService } from './service/generic.service';
import { ProductService } from './service/product.service';
import {
  RequisitionEntity,
  RequisitionSchema,
} from './schema/requisition.schema';
import { RequisitionController } from './controller/requisition.controller';
import { RequisitionService } from './service/requisition.service';
import { ProductBatchEntity, ProductBatchSchema } from './schema/batches.schema';
import { PatientEntity, PatientSchema } from 'src/patients/schema/patients.schema';
import { PatientsModule } from 'src/patients/patients.module';
import { PharmacyPrescriptionEntity, PharmacyPrescriptionSchema } from 'src/patients/schema/pharmacyPrescription.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { RequisitionDisputeEntity, RequisitionDisputeSchema } from 'src/utils/schemas/dispute-requisition.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { ProductOrderEntity, ProductOrderSchema } from './schema/product-order.schema';
import { ProductOrderService } from './service/product-order.service';
import { ProductOrderController } from './controller/product-order.controller';
import { TransactionTypeModule } from 'src/transaction-types/transaction-type.module';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    forwardRef(() => PatientsModule),
    CloudinaryModule,
    NotificationModule,
    TransactionTypeModule,
    AdminModule,
    MongooseModule.forFeatureAsync([
      {
        name: DrugTypeEntity.name,
        useFactory: () => {
          return DrugTypeSchema;
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
        name: ProductOrderEntity.name,
        useFactory: () => {
          return ProductOrderSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: ProductBatchEntity.name,
        useFactory: () => {
          return ProductBatchSchema;
        },
      },
    ]),

    MongooseModule.forFeatureAsync([
      {
        name: DrugGenericEntity.name,
        useFactory: () => {
          return DrugGenericSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: DrugProductEntity.name,
        useFactory: () => {
          return DrugProductSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: RequisitionEntity.name,
        useFactory: () => {
          return RequisitionSchema;
        },
      },
    ]),
        MongooseModule.forFeatureAsync([
      {
        name: PharmacyPrescriptionEntity.name,
        useFactory: () => {
          return PharmacyPrescriptionSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: RequisitionDisputeEntity.name,
        useFactory: () => {
          return RequisitionDisputeSchema;
        },
      },
    ]),
  ],
  controllers: [
    PharmacyController,
    DrugTypeController,
    ProductController,
    GenericController,
    RequisitionController,
    ProductOrderController
  ],
  providers: [
    PharmacyService,
    DrugTypeService,
    GenericService,
    ProductService,
    RequisitionService,
    ProductOrderService
  ],
  exports: [
    ProductService,
    GenericService,
    RequisitionService,
    ProductOrderService
  ],
})
export class PharmacyModule {}
