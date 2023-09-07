import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { UserDocument, UserEntity } from 'src/user/schema/user.schema';
import { ClinicService } from 'src/wards/service/clinic.service';
import { WardsService } from 'src/wards/service/wards.service';
import { DepartmentDto, UpdateDepartmentDto } from '../dto/department.dto';
import { DepartmentDocument, DepartmentEntity } from '../schema/department.schema';
import { UnitService } from './unit.service';

@Injectable()
export class DepartmentService {
    constructor(
        @InjectModel(DepartmentEntity.name) private departmentModel: Model<DepartmentDocument>,
        @InjectModel(UserEntity.name) private userModel: Model<UserDocument>,
        private readonly wardsService: WardsService,
        private readonly clinicService: ClinicService,
        private readonly unitService: UnitService,
    ){}

    async createDepartment(department: DepartmentDto): Promise<DepartmentDocument> {
        try {
            const departmentExists = await this.departmentModel.findOne({ name: department.name });
            if (departmentExists) {
                throw new ConflictException(`Department with name ${department.name} already exists`);
            }
            const newDepartment = new this.departmentModel(department);
            return await newDepartment.save();
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async findAllDepartments(page = 1, limit = 15, query: FilterQuery<DepartmentDocument>): Promise<DepartmentDocument[] | any> {
        try {
            const departments = await this.departmentModel.find(query)
            .populate('staff', 'firstName lastName staffId')
            .populate('headOfDept', 'firstName lastName staffId')
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();
            const count = await this.departmentModel.countDocuments(query).exec();
            const totalPages = Math.ceil(count / limit);
            const currentPage = page;
            return {
                departments,
                count,
                totalPages,
                currentPage
            }
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    //we want to find the department by id and populate the staff column which is an array of user entity in the department with firstName, lastName and staffId
    async findDepartmentById(id: string): Promise<any> {
        try {
            const department = await this.departmentModel.findById(id)
            //we want to get populate the firstName, lastName and staffId of staff inside department. we will loop through the ids inside the staff column to get the entities
            const staff = await this.userModel.find({ _id: { $in: department.staff } }, 'firstName lastName staffId');
            return {
                department,
                staff
            }
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async updateDepartment(id: string, department: UpdateDepartmentDto): Promise<DepartmentDocument> {
        try {
            return await this.departmentModel.findByIdAndUpdate(id, department, { new: true });
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    //WE WANT TO BE ABLE TO TRANSFER STAFF FROM ONE DEPARTMENT TO ANOTHER
    async transferStaffToDepartment(id: string, staffId: string, newDept: string): Promise<DepartmentDocument> {
        try {
            //we want to be able to add the staffId to the department's staff array
            const department = await this.departmentModel.findByIdAndUpdate(newDept, { $push: { staff: staffId } }, { new: true });
            //we want to be able to remove the staffId from the previous department's staff array
            await this.departmentModel.findByIdAndUpdate(id, { $pull: { staff: staffId } });
            return department;
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async deleteDepartment (id: string): Promise<string> {
        try {
            //throw an error to remove all staff from the dept before you are able to delete it, else, you wont be able to delete it
            const department = await this.departmentModel.findById(id);
            if (department.staff.length > 0) {
                throw new BadRequestException(
                  `Please remove all staff from department ${department.name} before deleting it`,
                );
            }
            await this.departmentModel.findByIdAndDelete(id);
            return `Department with id ${id} deleted successfully`;
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    //we want to be able to remove one or multiple staff from department at a time

    async removeStaffFromDepartment(id: string, staffId: string[]): Promise<DepartmentDocument> {
        try {
            return await this.departmentModel
            .findByIdAndUpdate(id, { $pull: { staff: { $in: staffId } } }, { new: true });
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    //get all staff of department
    //we want to be able to search through first name, lastname and staffid of the staff in the dept
    async searchStaffOfDepartment(id: string, query: FilterQuery<UserDocument>): Promise<any> {
        try {
            const department = await this.departmentModel
            .findById(id)
            .populate('staff', 'firstName lastName staffId')
            .exec();
            const staff = department.staff;
            const filteredStaff = staff.filter((staff: any) => {
                return (
                    staff.firstName.toLowerCase().includes(query.search.toLowerCase()) ||
                    staff.lastName.toLowerCase().includes(query.search.toLowerCase()) ||
                    staff.staffId.toLowerCase().includes(query.search.toLowerCase())
                )
            })
            return filteredStaff;
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
        }
    async getStaffOfDepartment(id: string): Promise<any> {
        try {
            const department = await this.departmentModel
            .findById(id)
            .populate('staff', 'firstName lastName staffId')
            .exec();
            return department.staff;
        }
        catch(error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async getDeptStat(id: string): Promise<any> {
        const department = await this.departmentModel.findById(id)
        const wards = await this.wardsService.getWardsByDepartment(id)
        const clinics = await this.clinicService.getClinicsByDepartmentId(id)
        const units = await this.unitService.getUnitsByDepartmentId(id)
        const staff = await this.getStaffOfDepartment(id)
        return { department, wards, clinics, units, staff }
    }

    //get only staff that are not in any department
    async getStaffNotInDepartment(search?: string): Promise<any> {
        try {
            const staffIds = await this.departmentModel.distinct('staff');
            const query = {
                _id: { $nin: staffIds },
                firstName: { $regex: new RegExp(search, 'i') },
                lastName: { $regex: new RegExp(search, 'i') },
                staffId: { $regex: new RegExp(search, 'i') },
            };
            const projection = { firstName: 1, lastName: 1, staffId: 1, _id: 1, age: 1 };
            const staffNotInDept = await this.userModel.find(query, projection);
            return staffNotInDept;
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }


    //get all doctors in a department
    async getDoctorsInDepartment(id: string): Promise<any> {
        try {
            const department = await this.departmentModel.findById(id);
            //get all the staff in the department and then filter out the doctors
            const staff = await this.userModel.find({ _id: { $in: department.staff } }).populate('role', 'name').exec();
            const doctors = staff.filter((staff: any) => staff.role.name === 'DOCTOR');
            return doctors;
           
        }
        catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
    
    
}
