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
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ProductListDto } from 'src/pharmacy/dto/product.dto';
import { IResponse } from 'src/utils/constants/constant';
import { CreateTestDto, TestPagination, UpdateTestDto } from '../dto/test.dto';
import { LaboratoryService } from '../service/laboratory.service';
import { TestService } from '../service/test.service';

@ApiBearerAuth("Bearer")
@ApiTags('Laboratory Test')
@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @ApiBody({
    type: CreateTestDto,
    description: 'Create test request body',
  })
  //create test
  @Post()
  async createTest(@Body() test: any) {
    return await this.testService.createTest(test);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Update test by id',
  })
  @ApiBody({
    type: UpdateTestDto,
    description: 'Update test request body',
  })
  //edit test
  @Patch(':testId')
  async editTest(@Param('testId') testId: string, @Body() test: UpdateTestDto) {
    return await this.testService.editTest(testId, test);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Delete test by id',
  })
  //delete test
  @Delete(':testId')
  async deleteTest(@Param('testId') testId: string) {
    return await this.testService.deleteTest(testId);
  }

  @ApiBody({
    type: TestPagination,
    required: false,
  })
  @Post('mobile')
  async getAllMobileTests(@Body() query: TestPagination): Promise<IResponse> {
    const data = await this.testService.getAllTestsMobile(
      query.page,
      query.limit,
      query.search,
    );
    return {
      status: 200,
      message: 'Tests fetched successfully',
      data
    }
  }

  @ApiQuery({
    name: 'search',
    type: 'string',
    description: 'Search test by name',
    required: false,
  })
  @Get()
  async getAllTests(@Query('search') search?: string) {
    return await this.testService.getAllTests(search);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Get test by id',
  })
  @Get(':testId')
  async getSingleTest(@Param('testId') testId: string) {
    return await this.testService.getSingleTest(testId);
  }

}
