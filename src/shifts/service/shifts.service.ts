import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  NotImplementedException,
  BadGatewayException,
  ServiceUnavailableException,
  NotAcceptableException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { DepartmentDocument, DepartmentEntity } from 'src/department/schema/department.schema';
import { UserDocument, UserEntity } from 'src/user/schema/user.schema';
import { CreateShiftsDto, UpdateShiftsDto } from '../dto/shifts.dto';
import { ShiftDocument, ShiftEntity } from '../schema/shifts.schema';

@Injectable()
export class ShiftsService {
    constructor (
        @InjectModel(UserEntity.name)
        private UserModel: Model<UserDocument>,
        @InjectModel(DepartmentEntity.name)
        private departmentModel: Model<DepartmentDocument>,
        @InjectModel(ShiftEntity.name)
        private shiftModel: Model<ShiftDocument>,
    ) {}


    //update shifts 
    async updateShifts(shifts: UpdateShiftsDto, id: string): Promise<ShiftDocument> {
        try {
            const shift = await this.shiftModel.findById(id);
            if (!shift) {
                throw new NotFoundException('Shift not found');
            }
            // const department = await this.departmentModel.findById(shifts.department);
            // if (!department) {
            //     throw new BadRequestException('Department not found');
            // }
            const updatedShift = await this.shiftModel.findByIdAndUpdate(id, shifts, {new: true});
            return updatedShift;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    //get all shifts
    async getAllShifts(): Promise<ShiftDocument[]> {
        try {
            const shifts = await this.shiftModel.find();
            return shifts;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
    //to adjust shifts, we are setting startTime and the endTime for the shift. The time is saved as ISOString() to the database. Check is made to see if a shift in a particular department does not exist within the range of startTime and endTime for new one passed in the request. and the total hours to be returned as response for the shift
    async adjustShifts(shifts: UpdateShiftsDto, id: string): Promise<ShiftDocument> {
        try {
            const { startTime, endTime } = shifts
            const shift = await this.shiftModel.findById(id);
            if (!shift) {
                throw new NotFoundException('Shift not found');
            }
            // const department = await this.departmentModel.findById(shifts.department);
            // if (!department) {
            //     throw new BadRequestException('Department not found');
            // }
            //we want to check if the time range has been alloted to another shift. The time is passed as a string but is saved in the database as number
            //the time saved in the database has been converted to ms and saved as number to the database
            // const startTime = new Date(shifts.startTime).getTime();
            // const endTime = new Date(shifts.endTime).getTime();
            const shiftExists = await this.shiftModel.findOne({ startTime: {$lte: startTime}, endTime: {$gte: endTime}});
            
            //startTime and endTime to be converted to ms and saved
            const updatedShift = await this.shiftModel.findByIdAndUpdate(id, {startTime, endTime}, {new: true});
            return updatedShift;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

/*
const shiftExists = await this.shiftModel.findOne({department: shifts.department, startTime: {$lte: shifts.startTime}, endTime: {$gte: shifts.endTime}});
            if (shiftExists) {
                throw new ConflictException('Shift already exists');
            }
            const updatedShift = await this.shiftModel.findByIdAndUpdate(id, shifts, {new: true});
            return updatedShift;
*/