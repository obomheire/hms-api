import { Controller, Get, HttpStatus, Param, Query, UseGuards } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { IResponse } from "src/utils/constants/constant";
import { GeBookingGuard } from "../guards/investigation-booking.guard";
import { InvestigationBookingService } from "../services/investigation-booking.service";

@ApiBearerAuth('Bearer')
@ApiTags('Investigation-Booking')
@Controller('investigation-booking')
export class InvestigationBookingController {
    constructor(
        private readonly investigationBookingService: InvestigationBookingService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    //get fully booked dates for a given investigation
    @ApiParam({
        name: 'testId',
        type: 'string',
        description: 'get fully booked dates for a given test',
    })
    @UseGuards(GeBookingGuard)
    @Get('mobile/fully-booked-dates/:testId')
    async getFullyBookedDates(@Param('testId') testId: string): Promise<IResponse> {
        const data = await this.investigationBookingService.getFullyBookedDates(testId);
        return {
            status: HttpStatus.OK,
            message: 'Successfully retrieved fully booked dates',
            data,
        };
        
    }
    

}