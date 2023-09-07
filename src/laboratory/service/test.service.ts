import {  BadRequestException,
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
import { CreateTestDto, UpdateTestDto } from '../dto/test.dto';
import { TestDocument, TestEntity } from '../schema/test.schema';

@Injectable()
export class TestService {
        constructor (
        @InjectModel(TestEntity.name)
    private readonly testModel: Model<TestDocument>,
    ){}

    //create test
    async createTest(test: any): Promise<TestEntity> {
        try {
            const newTest = new this.testModel(test);
            return await newTest.save();
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    //edit test
    async editTest(testId: string, test: UpdateTestDto): Promise<TestEntity> {
        try {
            const updatedTest = await this.testModel.findByIdAndUpdate
            (testId
            , test, { new: true });
            if(!updatedTest){
                throw new NotFoundException('Test not found');
            }
            return updatedTest;
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    //delete test
    async deleteTest(testId: string): Promise<string> {
        try {
            const deletedTest = await this.testModel.findByIdAndDelete(testId);
            if(!deletedTest){
                throw new NotFoundException('Test not found');
            }
            return 'test deleted';
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    //get all tests
    async getAllTests(search?: string ): Promise<TestEntity[]> {
        try {
            if (search) {
                return await this.testModel.find({ testName: { $regex: new RegExp(search, 'i') } });
            }
            return await this.testModel.find()
            

        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async getAllTestsMobile(page:number, limit: number, search?: string ): Promise<any> {
        try {
            const query = {};
            if (search) {
                query['name'] = { $regex: search, $options: 'i' };
            }
            const res = await this.testModel.find(query).skip((page - 1) * limit).limit(limit).exec();
            const count = await this.testModel.countDocuments(query);
            const currentPage = page;
            const totalPages = Math.ceil(count / limit);
            return { res, currentPage, totalPages, count };

        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    //get single test
    async getSingleTest(testId: string): Promise<TestEntity> {
        try {
            const test = await this.testModel.findById(testId);
            if(!test){
                throw new NotFoundException('Test not found');
            }
            return test;
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async getTest(id: string): Promise<TestEntity> {
        return await this.testModel.findById(id).exec();
    }

}
