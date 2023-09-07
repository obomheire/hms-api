import { Module } from '@nestjs/common';
import { InventoryService } from './service/inventory.service';
import { InventoryController } from './controller/inventory.controller';
import { StockService } from './service/stock.service';
import { StockController } from './controller/stock.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StockEntity, StockSchema } from './schema/stock.schema';
import { UnitTypeController } from './controller/unitType.controller';
import { UnitTypeService } from './service/unitType.service';
import { UnitTypeEntity, UnitTypeSchema } from './schema/unitType.schema';
import { ItemTypeController } from './controller/itemType.controller';
import { ItemTypeService } from './service/itemType.service';
import { ItemTypeEntity, ItemTypeSchema } from './schema/itemType.schema';
import { NewVendorController } from './controller/newVendor.controller';
import { NewVendorService } from './service/newVendor.service';
import { NewVendorEntity, NewVendorSchema } from './schema/newVendor.schema';
import { ItemProductController } from './controller/itemProduct.controller';
import { ItemProductService } from './service/itemProdcut.service';
import { ItemProductEntity, ItemProductSchema } from './schema/itemProduct.schema';
import { ItemRequisitionController } from './controller/itemRequisition.controller';
import { ItemRequisitionService } from './service/itemRequisition.service';
import { ItemRequisitionEntity, ItemRequisitionSchema } from './schema/itemRequisition.schema';
import { LaboratoryModule } from 'src/laboratory/laboratory.module';
import { ItemBatch, ItemBatchSchema } from './schema/batch.schema';
import { RequisitionDisputeEntity, RequisitionDisputeSchema } from 'src/utils/schemas/dispute-requisition.schema';
import { PharmacyModule } from 'src/pharmacy/pharmacy.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    LaboratoryModule,
    NotificationModule,
    PharmacyModule,
    MongooseModule.forFeatureAsync([
      {
        name: StockEntity.name,
        useFactory: () => {
          return StockSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: UnitTypeEntity.name,
        useFactory: () => {
          return UnitTypeSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: ItemTypeEntity.name,
        useFactory: () => {
          return ItemTypeSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: NewVendorEntity.name,
        useFactory: () => {
          return NewVendorSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: ItemProductEntity.name,
        useFactory: () => {
          return ItemProductSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: ItemRequisitionEntity.name,
        useFactory: () => {
          return ItemRequisitionSchema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: ItemBatch.name,
        useFactory: () => {
          return ItemBatchSchema;
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
    InventoryController,
    StockController,
    UnitTypeController,
    ItemTypeController,
    NewVendorController,
    ItemProductController,
    ItemRequisitionController,
  ],
  providers: [
    InventoryService,
    StockService,
    UnitTypeService,
    ItemTypeService,
    NewVendorService,
    ItemProductService,
    ItemRequisitionService,
  ],
  exports: [ItemRequisitionService]
})
export class InventoryModule {}
