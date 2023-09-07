import { Body, Controller, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from "@nestjs/swagger";
import { FilterBodyDto } from "src/inventory/dto/itemRequisition.dto";
import { AcceptOrRejectFollowUpDto, FollowUpDto } from "../dto/follow-up.dto";
import { FollowUpStatusEnum } from "../enum/follow-up-status.enum";
import { FollowUpService } from "../service/follow-up.service";

@ApiTags("FollowUps")
@ApiBearerAuth("Bearer")
@Controller("follow-up")
export class FollowUpController {
    constructor (private readonly followUpService: FollowUpService) {}

    //create follow up
    @ApiBody({
        type: FollowUpDto,
        description: "create follow up request body",
    })
    @Post('mobile')
    async createFollowUp(@Body() body: FollowUpDto, @Req() req: any) {
        return await this.followUpService.createFollowUp(body, req);
    }

    @ApiBody({
        type: FilterBodyDto,
        description: "get all follow ups request body",
    })
    @Post('all')
    async getFollowUpsAll(@Body() body: FilterBodyDto) {
        return await this.followUpService.getFollowUpsAll(body);
    }

    //get all follow ups
    @Get("mobile/all")
    async getFollowUps(@Req() req: any) {
        return await this.followUpService.getFollowUps(req);
    }

    @ApiParam({
        name: "followUpId",
        type: "string",
        description: "get follow up by id",
    })
    //get follow up by id
    @Get("mobile/single/:followUpId")
    async getFollowUpById(@Param("followUpId") followUpId: string) {
        return await this.followUpService.getFollowUpById(followUpId);
    }

    @ApiParam({
        name: "followUpId",
        type: "string",
        description: "change status of follow up",
    })
    //change status of follow up
    @Patch("mobile/change-status/:followUpId")
    async changeFollowUpStatus(
        @Param("followUpId") followUpId: string,
        @Body("status") status: FollowUpStatusEnum,
    ) {
        return await this.followUpService.changeFollowUpStatus(
            followUpId,
            status,
        );
    }

    @ApiParam({
        name: "followUpId",
        type: "string",
        description: "change status of follow up",
    })
    @ApiBody({
        type: AcceptOrRejectFollowUpDto,
        description: "accept or reschedule follow up request body",
    })

    //accept or reject follow up
    @Patch("mobile/accept-or-reschedule/:followUpId")
    async acceptOrRejectFollowUp(
        @Param("followUpId") followUpId: string,
        @Body() data: AcceptOrRejectFollowUpDto,
    ) {
        return await this.followUpService.acceptOrRejectFollowUp(
            followUpId,
            data,
        );
    }
}