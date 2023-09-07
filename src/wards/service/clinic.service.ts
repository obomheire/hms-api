import { Injectable, InternalServerErrorException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { DepartmentDocument, DepartmentEntity } from 'src/department/schema/department.schema';
import { CreateClinicDto, UpdateClinicDto } from '../dto/clinic.dto';
import { ClinicDocument, ClinicEntity } from '../schema/clinic.schema';

@Injectable()
export class ClinicService {
    constructor (
        @InjectModel(ClinicEntity.name)
        private clinicModel: Model<ClinicDocument>,
        @InjectModel(DepartmentEntity.name)
        private departmentModel: Model<DepartmentDocument>,
    ){}

    //create clinic
    // async createClinic(clinic: CreateClinicDto): Promise<ClinicDocument> {
    //     try {
    //         const newClinic = new this.clinicModel(clinic);
    //         // console.log(newClinic)
    //         const createdClinic = await newClinic.save();
    //         console.log(createdClinic)
    //         return createdClinic;
    //     } catch (error) {
    //         // if (error.code === 11000) {
    //         //     throw new ConflictException('Clinic already exists');
    //         // }
    //         throw new InternalServerErrorException();
    //     }
    // }

    create = async (clinicDto: CreateClinicDto) => {
        try{
            const clinic = new this.clinicModel(clinicDto);
            return await clinic.save();
        }
        catch(error){
            throw new InternalServerErrorException(error.message);
        }
    }

    //update clinic
    async updateClinic(id: string, clinic: UpdateClinicDto): Promise<ClinicDocument> {
        try {
            const updatedClinic = await this.clinicModel.findByIdAndUpdate(id, clinic, { new: true });
            if (!updatedClinic) {
                throw new NotFoundException('Clinic not found');
            }
            return updatedClinic;
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('Clinic already exists');
            }
            throw new InternalServerErrorException(error.message);
        }
    }

    // assign one or more staff to clinic. the staff and clinic must belong to same department
    async assignStaffToClinic(clinicId: string, staffId: Types.ObjectId[]): Promise<ClinicDocument> {
        try {
            const clinic = await this.clinicModel.findById
            (clinicId).populate('department');
            const departmentId = clinic.department._id;
            const staff = await this.departmentModel.findById
            (departmentId).populate('staff');
            const staffIds = staff.staff.map((staff) => staff.id);
            console.log(staffIds)
            const staffIdsToAssign = staffId.filter((id: any) => staffIds.includes(id));
            console.log(staffIdsToAssign)
            console.log(staffId)
            const assignedStaff = await this.clinicModel.findByIdAndUpdate
            (clinicId, { $addToSet: { staff: { $each: staffIdsToAssign } } }, { new: true });
            return assignedStaff;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    //remove one or more staff from clinic
    async removeStaffFromClinic(clinicId: string, staffId: Types.ObjectId[]): Promise<ClinicDocument> {
        try {
            const clinic = await this.clinicModel.findById
            (clinicId).populate('department');
            const departmentId = clinic.department._id;
            const staff = await this.departmentModel.findById
            (departmentId).populate('staff');
            const staffIds = staff.staff.map((staff) => staff.id);
            const staffIdsToRemove = staffId.filter((id: any) => staffIds.includes(id));
            const removedStaff = await this.clinicModel.findByIdAndUpdate
            (clinicId, { $pull: { staff: { $in: staffIdsToRemove } } }, { new: true });
            return removedStaff;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
    
        

    //transfer staff from one clinic to another clinic in same department. the staff must belong to a clinic in same department as the new clinic
    async transferStaffToClinic(clinicId: string, staffId: Types.ObjectId, newClinicId: string): Promise<ClinicDocument> {
        try {
            const clinic = await this.clinicModel.findById(clinicId);
            const newClinic = await this.clinicModel.findById(newClinicId);
            const department = await this.departmentModel.findById(clinic.department);
            const staff = department.staff.find((staff) => staff._id == staffId);
            if (!staff) {
                throw new NotFoundException('Staff not found');
            }
            clinic.staff = clinic.staff.filter((staff) => staff._id != staffId);
            //check if newclinic is inside the department too
            if (newClinic.department == department._id) {
                newClinic.staff.push(staff);
                await newClinic.save();
            }
            return await clinic.save();
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    //get clinics by department id
    async getClinicsByDepartmentId(id: string): Promise<ClinicDocument[]> {
        try{
            const clinics = await this.clinicModel.find({department: id});
            return clinics;
        }
        catch(error){
            throw new InternalServerErrorException(error.message);
        }
    }

    //get clinic by clinic id
    async getClinicById(id: string): Promise<ClinicDocument> {
        try{
            const clinic = await this.clinicModel.findById(id).populate('headOfClinic').populate('department').populate('staff');
            return clinic;
        }
        catch(error){
            throw new InternalServerErrorException(error.message);
        }
    }
         
    //delete clinic
    async deleteClinic(id: string): Promise<string> {
        try {
            const deletedClinic = await this.clinicModel.findByIdAndDelete(id);
            if (!deletedClinic) {
                throw new NotFoundException('Clinic not found');
            }
            return "succesfull";
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async removeStaffFroClinic(
        clinicId: string,
        staffIds: Types.ObjectId[],
      ): Promise<ClinicDocument> {
        try {
          const unit = await this.clinicModel.findByIdAndUpdate(
            clinicId,
            { $pull: { staff: { $in: staffIds } } },
            { new: true },
          );
          return unit;
        } catch (error) {
          throw new InternalServerErrorException(error.message);
        }
      }

      //get all clinics
    async getAllClinics(): Promise<ClinicDocument[]> {
        try{
            const clinics = await this.clinicModel.find().populate('headOfClinic', 'firstName lastName staffId').populate('department').populate('staff', 'firstName lastName staffId');
            return clinics;
        }
        catch(error){
            throw new InternalServerErrorException(error.message);
        }
    }
    

}