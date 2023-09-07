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
import { GenericDto, UpdateGenericDto } from '../dto/generic.dto';
import { GenericService } from '../service/generic.service';

@ApiTags('Pharmacy Generic')
@ApiBearerAuth("Bearer")
@Controller('generic')
export class GenericController {
  constructor(private readonly genericService: GenericService) {}

  @ApiBody({
    type: GenericDto,
    description: 'creates a generic request body',
  })
  // We want to create generic
  @Post('create')
  async createGeneric(@Body() generic: GenericDto) {
    return await this.genericService.createGeneric(generic);
  }

  // We want to get all generic
  @Get('getall')
  async getAllGeneric() {
    return await this.genericService.getAllGeneric();
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'gets a single generic by id',
  })
  // We want to get generic by id
  @Get('getone/:id')
  async getGenericById(@Param('id') genericId: string) {
    return await this.genericService.getGenericById(genericId);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'update a single generic by id',
  })
  @ApiBody({
    type: UpdateGenericDto,
    description: 'update a generic request body',
  })
  // We want to edit generic
  @Patch('edit/:id')
  async editGeneric(
    @Param('id') genericId: string,
    @Body() generic: UpdateGenericDto,
  ) {
    return await this.genericService.editGeneric(genericId, generic);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'delete a single generic by id',
  })
  // We want to delete generic
  @Delete('remove/:id')
  async deleteGeneric(@Param('id') genericId: string) {
    return await this.genericService.deleteGeneric(genericId);
  }
}
