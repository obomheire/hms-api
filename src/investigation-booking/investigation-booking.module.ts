import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LaboratoryModule } from "src/laboratory/laboratory.module";
import { InvestigationBookingController } from "./controllers/investigation-booking.controller";
import { InvestigationBookingListener } from "./listeners/investigation-booking.listener";
import { InvestigatioBookingEntity, InvestigationBookingSchema } from "./schema/investigation-booking.schema";
import { InvestigationBookingService } from "./services/investigation-booking.service";

@Module({
    providers: [InvestigationBookingService, InvestigationBookingListener],
    exports: [InvestigationBookingService],
    controllers: [InvestigationBookingController],
    imports: [
      LaboratoryModule,
      MongooseModule.forFeatureAsync([
        {
          name: InvestigatioBookingEntity.name,
          useFactory: () => {
            return InvestigationBookingSchema;
          },
        },
      ]),
    ],
  })
  export class InvestigationBookingModule {}
  