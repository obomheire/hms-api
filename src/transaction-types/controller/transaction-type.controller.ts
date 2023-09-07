import { Body, Controller, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IResponse } from 'src/utils/constants/constant';
import { TransactionTypeDto, UpdateTransactionTypeDto } from '../dto/transaction-type.dto';
import { TransactionTypeService } from '../services/transaction-type.service';

@ApiTags('Transaction Type')
@ApiBearerAuth()
@Controller('transaction-type')
export class TransactionTypeController {
  constructor(
    private readonly transactionTypeService: TransactionTypeService,
  ) {}

  @Post()
  async create(@Body() body: TransactionTypeDto): Promise<IResponse> {
    const data = await this.transactionTypeService.createTransactionType(body);
    return {
      status: HttpStatus.CREATED,
      message: 'Transaction type created successfully',
      data
    }
  }

  @Get()
  async findAll(): Promise<IResponse> {
    const data = await this.transactionTypeService.getTransactionTypes();
    return {
      status: HttpStatus.OK,
      message: 'Transaction type fetched successfully',
      data
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IResponse> {
    const data = await this.transactionTypeService.getTransactionTypeById(id);
    return {
      status: HttpStatus.OK,
      message: 'Transaction type fetched successfully',
      data
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateTransactionTypeDto): Promise<IResponse> {
    const data = await this.transactionTypeService.updateTransactionType(body, id);
    return {
      status: HttpStatus.OK,
      message: 'Transaction type updated successfully',
      data
    }
  }
}
