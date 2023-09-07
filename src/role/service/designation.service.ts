import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateDesignationDto, UpdateDesignationDto } from '../dtos/designation.dto';
import { DesignationDocument, DesignationEntity } from '../schema/designation.schema';


@Injectable()
export class DesignationService {
    constructor (
        @InjectModel(DesignationEntity.name) private designationModel: Model<DesignationDocument>,
    ){}

    //create designation
    async createDesignation(designation: CreateDesignationDto): Promise<DesignationDocument> {
        try {
            const newDesignation = new this.designationModel(designation);
            return await newDesignation.save();
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('Designation already exists');
            }
            throw new InternalServerErrorException();
        }
    }

    //edit designation
    async editDesignation(designationId: string, designation: UpdateDesignationDto): Promise<DesignationDocument> {
        try {
            const editedDesignation = await this.designationModel.findByIdAndUpdate(
                designationId,
                designation,
                { new: true },
            );
            if (!editedDesignation) {
                throw new BadRequestException('Designation not found');
            }
            return editedDesignation;
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('Designation already exists');
            }
            throw new InternalServerErrorException();
        }
    }

    //get all designations
    async getDesignations(): Promise<DesignationDocument[]> {
        try {
            const designations = await this.designationModel.find();
            return designations;
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }

    //get all designations under role id
    async getDesignationsByRole(roleId: string): Promise<DesignationDocument[]> {
        try {
            const designations = await this.designationModel.find({role
                : roleId});
            return designations;
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }

    //get designation by id
    async getDesignationById(designationId: string): Promise<DesignationDocument> {
        try {
            const designation = await this.designationModel.findById(designationId).populate('role');
            if (!designation) {
                throw new NotFoundException('Designation not found');
            }
            return designation;
            } catch (error) {
            throw new InternalServerErrorException();
        }
    }

    async deleteDesignation(designationId: string): Promise<string> {
       try {
            const deletedDesignation = await this.designationModel.findByIdAndDelete(designationId);
            if (!deletedDesignation) {
                throw new BadRequestException('designation not found');
            }
            return 'designation deleted';
        } catch (error) {
            throw new InternalServerErrorException();
        }
    } 

}