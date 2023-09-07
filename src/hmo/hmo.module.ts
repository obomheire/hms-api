import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HmoController } from "./controller/hmo.controller";
import { HmoEntity, HmoSchema } from "./schema/hmo.schema";
import { HmoService } from "./service/hmo.service";

@Module({
    imports: [
      MongooseModule.forFeatureAsync([
        {
          name: HmoEntity.name,
          useFactory: () => {
            return HmoSchema;
          },
        },
      ]),
      
    ],
    controllers: [HmoController],
    providers: [HmoService],
  })
  export class HmoModule {}
  