import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RoleModule } from "src/role/role.module";
import { WardsModule } from "src/wards/wards.module";
import { TransactionTypeController } from "./controller/transaction-type.controller";
import { TransactionTypeListener } from "./listeners/transaction-types.listener";
import { TransactionTypeEntity, TransactionTypeSchema } from "./schema/transaction-type.schema";
import { TransactionTypeService } from "./services/transaction-type.service";

@Module({
    providers: [TransactionTypeService, TransactionTypeListener],
    exports: [TransactionTypeService],
    controllers: [TransactionTypeController],
    imports: [
        RoleModule,
        forwardRef(() => WardsModule),
        MongooseModule.forFeatureAsync([
            {
                name: TransactionTypeEntity.name,
                useFactory: () => {
                    return TransactionTypeSchema;
                },
            },
        ]),
    ]
})
export class TransactionTypeModule {}