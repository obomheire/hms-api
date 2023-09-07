import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UnitTypeDto, UpdateUnitTypeDto } from '../dto/unitType.dto';
import { UnitTypeService } from '../service/unitType.service';

@ApiBearerAuth('Bearer')
@ApiTags('Inventory Unit Type')
@Controller('unittype')
export class UnitTypeController {
  constructor(private readonly unitTypeService: UnitTypeService) {}

  @ApiBody({
    type: UnitTypeDto,
    description: 'creates a unit type request body',
  })
  //We want to create unit type
  @Post('create')
  async createUnitType(@Body() unitType: UnitTypeDto): Promise<UnitTypeDto> {
    return await this.unitTypeService.createUnitType(unitType);
  }

  // We want to get all unit type
  @Get('getall')
  async getAllUnitType(): Promise<UnitTypeDto[]> {
    return await this.unitTypeService.getAllUnitType();
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'gets a single unit type by id',
  })
  // We want to get a unit type by id
  @Get('getone/:id')
  async getUnitTypeById(@Param('id') unitTypeId: string): Promise<UnitTypeDto> {
    return await this.unitTypeService.getUnitTypeById(unitTypeId);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'update a single unit type by id',
  })
  @ApiBody({
    type: UpdateUnitTypeDto,
    description: 'update a unit type request body',
  })
  // We want to edit unit type
  @Patch('edit/:id')
  async updateUnitTypeById(
    @Param('id') unitTypeId: string,
    @Body() unitType: UpdateUnitTypeDto,
  ): Promise<UnitTypeDto> {
    return await this.unitTypeService.updateUnitTypeById(unitTypeId, unitType);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'delete a single unit type by id',
  })
  // We want to delete unit type
  @Delete('delete/:id')
  async deleteUnitTypeById(
    @Param('id') unitTypeId: string,
  ): Promise<UnitTypeDto> {
    return await this.unitTypeService.deleteUnitTypeById(unitTypeId);
  }
}
