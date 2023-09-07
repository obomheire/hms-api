import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DrugTypeDto, UpdateDrugTypeDto } from '../dto/drugType.dto';
import { DrugTypeService } from '../service/drugType.service';

@ApiBearerAuth("Bearer")
@ApiTags('Pharmacy Drug Type')
@Controller('drugtype')
export class DrugTypeController {
  constructor(private readonly drugTypeService: DrugTypeService) {}

  @ApiBody({
    type: DrugTypeDto,
    description: 'creates a drug type request body',
  })
  //We want to create drug type
  @Post('create')
  async createDrugType(@Body() drugType: DrugTypeDto): Promise<DrugTypeDto> {
    return await this.drugTypeService.createDrugType(drugType);
  }

  // We want to get all drug type
  @Get('getall')
  async getAllDrugType(): Promise<DrugTypeDto[]> {
    return await this.drugTypeService.getAllDrugType();
  }

  @Get('mobile/getall')
  async getAllDrugTypeMobile(): Promise<DrugTypeDto[]> {
    return await this.drugTypeService.getAllDrugType();
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'gets a single drug type by id',
  })
  // We want to get a drug type by id
  @Get('getone/:id')
  async getDrugTypeById(@Param('id') drugTypeId: string): Promise<DrugTypeDto> {
    return await this.drugTypeService.getDrugTypeById(drugTypeId);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'update a single drug type by id',
  })
  @ApiBody({
    type: UpdateDrugTypeDto,
    description: 'update a drug type request body',
  })
  // We want to edit drug type
  @Patch('edit/:id')
  async editDrugType(
    @Param('id') drugTypeId: string,
    @Body() drugType: UpdateDrugTypeDto,
  ): Promise<DrugTypeDto> {
    return await this.drugTypeService.editDrugType(drugTypeId, drugType);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'delete a single drug type by id',
  })
  // We want to delete drug type
  @Delete('removeone/:id')
  async deleteDrugType(@Param('id') drugTypeId: string): Promise<DrugTypeDto> {
    return await this.drugTypeService.deleteDrugType(drugTypeId);
  }
}
