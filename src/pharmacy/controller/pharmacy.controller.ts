import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreatePharmacyDto } from '../dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from '../dto/update-pharmacy.dto';
import { PharmacyService } from '../service/pharmacy.service';

@ApiTags('Pharmacy')
@ApiBearerAuth("Bearer")
@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @ApiBody({
    type: CreatePharmacyDto,
    description: 'creates a pharmacy request body',
  })
  @Post()
  create(@Body() createPharmacyDto: CreatePharmacyDto) {
    return this.pharmacyService.create(createPharmacyDto);
  }

  @Get()
  findAll() {
    return this.pharmacyService.findAll();
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'gets a single pharmacy by id',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pharmacyService.findOne(+id);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'update a single pharmacy by id',
  })
  @ApiBody({
    type: UpdatePharmacyDto,
    description: 'update a pharmacy request body',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePharmacyDto: UpdatePharmacyDto,
  ) {
    return this.pharmacyService.update(+id, updatePharmacyDto);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'delete a single pharmacy by id',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pharmacyService.remove(+id);
  }
}
