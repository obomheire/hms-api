import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  FilterVendorDto,
  NewVendorDto,
  UpdateNewVendorDto,
} from '../dto/newVendor.dto';
import { NewVendorService } from '../service/newVendor.service';

@ApiBearerAuth('Bearer')
@ApiTags('Inventory New Vendor')
@Controller('newvendor')
export class NewVendorController {
  constructor(private readonly newVendorService: NewVendorService) {}

  @ApiBody({
    type: NewVendorDto,
    description: 'creates a new vendor request body',
  })
  //We want to create new vendor
  @Post('create')
  async createNewVendor(
    @Body() newVendor: NewVendorDto,
  ): Promise<NewVendorDto> {
    return await this.newVendorService.createNewVendor(newVendor);
  }

  @ApiBody({
    type: FilterVendorDto,
    description: 'Filter Vendor request body',
  })
  // We want to get all new vendor
  @Post('getall')
  async getAllNewVendor(@Body() filterBodyDto?: FilterVendorDto) {
    return await this.newVendorService.getAllNewVendor(filterBodyDto);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'gets a single new vendor by id',
  })
  // We want to get a new vendor by id
  @Get('getone/:id')
  async getNewVendorById(
    @Param('id') newVendorId: string,
  ): Promise<NewVendorDto> {
    return await this.newVendorService.getNewVendorById(newVendorId);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'update a single new vendor by id',
  })
  @ApiBody({
    type: UpdateNewVendorDto,
    description: 'update a new vendor request body',
  })
  // We want to update a new vendor by id
  @Patch('edit/:id')
  async updateNewVendorById(
    @Param('id') newVendorId: string,
    @Body() newVendor: UpdateNewVendorDto,
  ): Promise<NewVendorDto> {
    return await this.newVendorService.updateNewVendorById(
      newVendorId,
      newVendor,
    );
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'delete a single new vendor by id',
  })
  // We want to delete a new vendor by id
  @Delete('delete/:id')
  async deleteNewVendorById(
    @Param('id') newVendorId: string,
  ): Promise<NewVendorDto> {
    return await this.newVendorService.deleteNewVendorById(newVendorId);
  }

  // Toggle the active field in vendor to true or false
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'vendor id',
  })
  @ApiBody({
    type: UpdateNewVendorDto,
    description: 'update a new vendor request body',
  })
  @Patch('toggle-vendor/:id')
  async toggleNewVendorStatus(
    @Param('id') newVendorId: string,
    @Body() updateNewVendorDto: UpdateNewVendorDto,
  ): Promise<NewVendorDto> {
    return await this.newVendorService.toggleNewVendorStatus(
      newVendorId,
      updateNewVendorDto,
    );
  }
}
