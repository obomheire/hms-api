import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { IResponse } from "src/utils/constants/constant";
import { CreateHmoDto, UpdateHmoDto } from "../dto/hmo.dto";
import { HmoService } from "../service/hmo.service";

@Controller('hmo')
@ApiTags('HMO')
@ApiBearerAuth('Bearer')
export class HmoController {
    constructor(
        private readonly hmoService: HmoService,
    ) {}

    @Post()
    @ApiBody({
        type: CreateHmoDto,
        description: 'Create hmo request body',
    })
    async createHmo(@Body() data: CreateHmoDto): Promise<IResponse> {
        const hmo = await this.hmoService.createHmo(data);
        return {
            status: 201,
            message: 'Hmo created successfully',
            data: hmo,
        }
    }

    @Get()
    @ApiQuery({
        name: 'search',
        type: 'string',
        required: false,
        description: 'search string',
    })
    async getHmos(@Query('search') search?: string): Promise<IResponse> {
        const hmos = await this.hmoService.getHmos(search);
        return {
            status: 200,
            message: 'Hmos fetched successfully',
            data: hmos,
        }
    }

    @Get('mobile')
    @ApiQuery({
        name: 'search',
        type: 'string',
        required: false,
        description: 'search string',
    })
    async getMobileHmos(@Query('search') search?: string): Promise<IResponse> {
        const hmos = await this.hmoService.getHmos(search);
        return {
            status: 200,
            message: 'Hmos fetched successfully',
            data: hmos,
        }
    }

    @Get('mobile/:id')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Get hmo by id',
    })
    async getMobileHmoById(@Param('id') id: string): Promise<IResponse> {
        const hmo = await this.hmoService.getHmoById(id);
        return {
            status: 200,
            message: 'Hmo fetched successfully',
            data: hmo,
        }
    }

    @Get(':id')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Get hmo by id',
    })
    async getHmoById(@Param('id') id: string): Promise<IResponse> {
        const hmo = await this.hmoService.getHmoById(id);
        return {
            status: 200,
            message: 'Hmo fetched successfully',
            data: hmo,
        }
    }

    @Patch(':id')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Update hmo by id',
    })
    async updateHmo(@Body() data: UpdateHmoDto, @Param('id') id: string): Promise<IResponse> {
        const hmo = await this.hmoService.updateHmo(data, id);
        return {
            status: 200,
            message: 'Hmo updated successfully',
            data: hmo,
        }
    }

    @Delete(':id')
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Delete hmo by id',
    })
    async deleteHmo(@Param('id') id: string): Promise<IResponse> {
        const hmo = await this.hmoService.deleteHmo(id);
        return {
            status: 200,
            message: 'Hmo deleted successfully',
            data: hmo,
        }
    }

}