import {   BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  NotImplementedException,
  BadGatewayException,
  ServiceUnavailableException,
  NotAcceptableException,
  ConflictException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStockDto, UpdateStockDto } from '../dto/stock.dto';
import { StockDocument, StockEntity } from '../schema/stock.schema';

@Injectable()
export class StockService {
    constructor (
        @InjectModel(StockEntity.name)
    private readonly stockModel: Model<StockDocument>,
    ){}

    //we want to create stock
    async createStock(stock: CreateStockDto): Promise<StockEntity> {
        try {
            const newStock = new this.stockModel(stock);
            return await newStock.save();
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
    //we want to be able to edit stock
    async editStock(stockId: string, stock: UpdateStockDto): Promise<StockEntity> {
        try {
            const updatedStock = await this.stockModel.findByIdAndUpdate
            (stockId, stock, { new: true });
            if(!updatedStock){
                throw new NotFoundException('Stock not found');
            }
            return updatedStock;
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    //delete stock
    async deleteStock(stockId: string): Promise<string> {
        try {
            const deletedStock = await this.stockModel.findByIdAndDelete(stockId);
            if(!deletedStock){
                throw new NotFoundException('Stock not found');
            }
            return 'stock deleted';
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    //get all stocks
    async getAllStocks(): Promise<StockEntity[]> {
        try {
            return await this.stockModel.find();
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    //get single stock by id
    async getSingleStock(stockId: string): Promise<StockEntity> {
        try {
            const stock = await this.stockModel
            .findById(stockId)
            .populate('stock');
            if(!stock){
                throw new NotFoundException('Stock not found');
            }
            return stock;
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
}
