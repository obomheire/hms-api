import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CreateTestEventEnums } from "src/patients/events/patient.event";
import { InvestigationBookingDto } from "../dto/investigation-booking.dto";
import { InvestigationBookingService } from "../services/investigation-booking.service";

@Injectable()
export class InvestigationBookingListener {
  constructor(
    private readonly investigationBookingService: InvestigationBookingService,
  ) {}

  @OnEvent(CreateTestEventEnums.CREATE_INDIVIDUAL_TEST)
  async handleCreateIndividualTestEvent(event: InvestigationBookingDto[]) {
    Logger.log(event, "InvestigationBookingListener");
    
    try {
        const investigationBookingPromises = event.map(async (booking) => {
            console.log(booking);
            Logger.debug(booking, "InvestigationBookingListener");
            return this.investigationBookingService.createInvestigationBooking(booking);
        });
        
        const investigationBookings = await Promise.all(investigationBookingPromises);
        
        Logger.log(investigationBookings, "InvestigationBookingListener");
    } catch (error) {
        Logger.error(error, "InvestigationBookingListener");
    }
}

}