import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { CreateUnitDto, UpdateUnitDto } from '../dto/unit.dto';
import { DepartmentDocument, DepartmentEntity } from '../schema/department.schema';
import { UnitDocument, UnitEntity } from '../schema/unit.schema';

@Injectable()
export class UnitService {
  constructor(
    @InjectModel(UnitEntity.name) private unitModel: Model<UnitDocument>,
    @InjectModel(DepartmentEntity.name)
    private departmentModel: Model<DepartmentDocument>,
  ) {}

  //create unit
  async createUnit(body: CreateUnitDto): Promise<UnitDocument> {
    try {
      const unit = await this.unitModel.create(body);
      return unit;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Unit already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  //edit unit
  async updateUnit(id: string, body: UpdateUnitDto): Promise<UnitDocument> {
    try {
      const unit = await this.unitModel.findByIdAndUpdate(id, body, {
        new: true,
      });
      return unit;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Unit already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
  //assign staffs to from department to a unit. The staff to assign must first be a member of the department that owns the unit
  //multiple staff to be able to be assigned at a time
      async assignStaffToUnit(
        unitId: string,
        staffIds: Types.ObjectId[],
      ): Promise<UnitDocument> {
        try {
         //check if each of the staff being passed is not already in the unit
         //if not, add each of the staff of staffIds to the unit
          const unit = await this.unitModel.findById(unitId)
          .populate('staff')
          const staff = unit.staff
          const staffIdsInUnit = staff.map((staff) => staff._id);
          const staffIdsNotInUnit = staffIds.filter(
            (staffId) => !staffIdsInUnit.includes(staffId),
          );
          if (staffIdsNotInUnit.length > 0) {
            const staffs = await this.departmentModel
              .findById(unit.department)
              .populate('staff');
            const staffsInDepartment = staffs.staff;
            const staffIdsInDepartment = staffsInDepartment.map(
              (staff) => staff._id,
            );
            const staffIdsNotInDepartment = staffIdsNotInUnit.filter(
              (staffId) => !staffIdsInDepartment.includes(staffId),
            );
            if (staffIdsNotInDepartment.length > 0) {
              throw new ConflictException(
                `Staff with ids ${staffIdsNotInDepartment} are not in department`,
              );
            }
            const updatedUnit = await this.unitModel.findByIdAndUpdate(
              unitId,
              { $push: { staff: { $each: staffIdsNotInUnit } } },
              { new: true },
            );
            return updatedUnit;
          }
          throw new ConflictException(
            `Staff with ids ${staffIdsInUnit} are already in unit`,
          );
        } catch (error) {
          throw new InternalServerErrorException(error.message);
        }
      }




  //transfer staff from one unit in a department to another unit in same department
  async transferStaffToUnit(
    unitId: string,
    staffId: Types.ObjectId,
    newUnitId: Types.ObjectId,
  ): Promise<UnitDocument> {
    try {
      //verify the staff to add to unit belongs to department the unit belongs to
      const unit = await this.unitModel.findById(unitId).populate('department');
      const department = unit.department as unknown as DepartmentDocument;
      const staff = department.staff.find((staff) => staff._id == staffId);
      if (!staff) {
        throw new ConflictException('Staff does not belong to department');
      }
      //remove staff from unit
      const updatedUnit = await this.unitModel.findByIdAndUpdate(
        unitId,
        { $pull: { staff: staffId } },
        { new: true },
      );
      //add staff to new unit
      const newUnit = await this.unitModel.findByIdAndUpdate(
        newUnitId,
        { $push: { staff: staffId } },
        { new: true },
      );
      return newUnit;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Staff already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  //we want to get all units
  async getAllUnits(): Promise<UnitDocument[]> {
    try {
      const units = await this.unitModel.find().populate(['headOfUnit', 'department'])
      return units;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getUnitsByDepartmentId(id: string): Promise<UnitDocument[]> {
        try{
            const units = await this.unitModel.find({department: id});
            return units;
        }
        catch(error){
            throw new InternalServerErrorException(error.message);
        }
    }

    //get single unit by id
    async getUnitById(id: string): Promise<UnitDocument> {
        try{
            const unit = await this.unitModel
            .findById(id)
            .populate('staff')
            .populate('department')
            .populate('headOfUnit')
            return unit;
        }
        catch(error){
            throw new InternalServerErrorException(error.message);
        }
      }

      //delete unit
      async deleteUnit(id: string): Promise<string> {
        try {
          const unit = await this.unitModel.findByIdAndDelete(id);
          return 'sucessfully deleted unit';
        } catch (error) {
          throw new InternalServerErrorException();
        }
      }

      //remove one or more staff from unit at a time
      async removeStaffFromUnit(
        unitId: string,
        staffIds: Types.ObjectId[],
      ): Promise<UnitDocument> {
        try {
          const unit = await this.unitModel.findByIdAndUpdate(
            unitId,
            { $pull: { staff: { $in: staffIds } } },
            { new: true },
          );
          return unit;
        } catch (error) {
          throw new InternalServerErrorException();
        }
      }
  
  //we want to get all staff in a unit and be able to search by firstName and lastName
  async getStaffInUnit(
    unitId: string,
    search: string,
  ): Promise<any> {
    try {
      console.log(search);
      const unit = await this.unitModel.findById(unitId)
        .populate('staff')
      const staff = unit.staff;
      if (search) {
        const staffs = staff.filter(
          (staff: any) =>
            staff.firstName.toLowerCase().includes(search.toLowerCase()) ||
            staff.lastName.toLowerCase().includes(search.toLowerCase()),
        );
        return staffs;
      }
      return staff;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

}