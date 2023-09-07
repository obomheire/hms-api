import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { FilterQuery, Model, Types } from 'mongoose';
import { userInfo } from 'os';
import { FilterAppointmentDto } from 'src/appointments/dto/filterAppointment.dto';
import { AdmissionStatusEnum } from 'src/patients/enum/admissionStatus.enum';
import {
  PatientDocument,
  PatientEntity,
} from 'src/patients/schema/patients.schema';
import { VisitService } from 'src/patients/service/visit.service';
import { UserDocument } from 'src/user/schema/user.schema';
import { CreateWardDto, UpdateWardDto } from '../dto/ward.dto';
import { WardDocument, WardEntity } from '../schema/wards.schema';

@Injectable()
export class WardsService {
  constructor(
    @InjectModel(WardEntity.name)
    private wardModel: Model<WardDocument>,
    @InjectModel(PatientEntity.name)
    private patientModel: Model<PatientDocument>,
    private readonly visitService: VisitService,
  ) {}

  //we want to create wards
  create = async (createWardDto: CreateWardDto) => {
    try {
      const ward = new this.wardModel(createWardDto);
      return await ward.save();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  getWardById = async (id: string): Promise<WardDocument> => {
    try {
      const ward = await this.wardModel.findById(id);
      if (!ward) throw new NotFoundException('Ward not found');
      return ward;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //we want to get all wards
  findAll = async (
    page = 1,
    limit = 15,
    search = '',
  ): Promise<WardDocument | any> => {
    try {
      const wards = await this.wardModel
        .find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { headOfWard: { $regex: search, $options: 'i' } },
          ],
        })
        .populate('headOfWard', 'firstName lastName staffId')
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      const wardStat = await this.wardModel.find();
      const totalBeds = wardStat.reduce((acc, ward) => acc + ward.totalBeds, 0);
      const totalWards = wardStat.length;

      const count = await this.wardModel
        .countDocuments({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { headOfWard: { $regex: search, $options: 'i' } },
          ],
        })
        .exec();
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return {
        wards,
        totalBeds,
        totalWards,
        totalPages,
        currentPage,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //we want to be able to update the ward
  update = async (id: string, updateWardDto: UpdateWardDto) => {
    try {
      return await this.wardModel.findByIdAndUpdate(id, updateWardDto, {
        new: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  admitPatientToWard = async (
    id: string,
    patientId: string,
  ): Promise<WardDocument> => {
    try {
      const patient = await this.patientModel.findById(patientId);
      if (patient.admissionStatus === AdmissionStatusEnum.ADMITTED) {
        throw new ConflictException('patient is admitted already');
      }
      const ward = await this.wardModel.findById(id);

      if (ward.totalBeds > ward.usedBeds) {
        patient.admissionStatus = AdmissionStatusEnum.ADMITTED;
        patient.admissionDate = new Date();
        patient.bedNumber = ward.usedBeds + 1;
        patient.ward = ward.id;
        patient.dischargeDate = null;
        await patient.save();

        ward.usedBeds = ward.usedBeds + 1;
        ward.patients.push(patientId);
        await ward.save();
        return ward;
      } else {
        throw new NotFoundException('No bed available in this ward');
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  dischargePatientForDeath = async (
    id: string,
    patientId: string,
    reasonForDeath: string,
  ): Promise<any> => {
    try {
      const patient = await this.patientModel.findById(patientId);
      if (
        patient.admissionStatus === AdmissionStatusEnum.DISCHARGED ||
        patient.admissionStatus === AdmissionStatusEnum.OUTPATIENT
      ) {
        throw new ConflictException('patient is discharged already');
      }
      patient.admissionStatus = AdmissionStatusEnum.DEAD;
      patient.dischargeDate = new Date();

      patient.reasonForDeath = reasonForDeath;
      await patient.save();
      const updatedWard = await this.wardModel.findByIdAndUpdate(
        id,
        { $pull: { patients: patientId }, $inc: { usedBeds: -1 } },
        { new: true },
      );
      return {
        patient,
        updatedWard,
        admissionDate: patient.admissionDate,
        dischargeDate: patient.dischargeDate,
      };
    } catch (err) {
      throw err;
    }
  };

  dischargePatientFromWard = async (
    id: string,
    patientId: string,
    date: string,
  ): Promise<any> => {
    try {
      //we want to be able to change the admissionStatus for the patient to 'DISCHARGED' at this point and assign him the next available bed number
      const patient = await this.patientModel.findById(patientId);
      if (!patient) {
        throw new NotFoundException('patient not found');
      }
      patient.bedNumber = 0;
      patient.admissionStatus = AdmissionStatusEnum.PENDING;
      const dateFormatted = new Date(date);
      patient.dischargeDate = dateFormatted;
      patient.ward = '';
      await patient.save();

      const updatedWard = await this.wardModel.findByIdAndUpdate(
        id,
        { $pull: { patients: patientId }, $inc: { usedBeds: -1 } },
        { new: true },
      );

      return {
        updatedWard,
        admissionDate: patient.admissionDate,
        dischargeDate: patient.dischargeDate,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  transferPatientFromOneWardToAnother = async (
    id: string,
    patientId: string,
    newWardId: string,
  ): Promise<any> => {
    try {
      //we want to be able to change the admissionStatus for the patient to 'ADMITTED' at this point and assign him the next available bed number

      const patient = await this.patientModel.findByIdAndUpdate(
        patientId,
        { admissionStatus: 'admitted' },
        { new: true },
      );
      //we want to be able to get the ward and check if the bed is available
      const ward = await this.wardModel.findById(newWardId);
      if (ward.totalBeds === ward.usedBeds) {
        throw new InternalServerErrorException('No bed available in this ward');
      }
      //we want to be able to update the ward with the new patient
      const updatedWard = await this.wardModel.findByIdAndUpdate(
        newWardId,
        { $push: { patients: patientId }, $inc: { usedBeds: 1 } },
        { new: true },
      );
      //we want to be able to update the ward with the new patient
      const updatedWard2 = await this.wardModel.findByIdAndUpdate(
        id,
        { $pull: { patients: patientId }, $inc: { usedBeds: -1 } },
        { new: true },
      );
      return { updatedWard, admissionDate: patient.admissionDate };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  getPatientsInSingleWard = async (
    id: string,
    page = 1,
    limit = 15,
    query: FilterQuery<PatientDocument>,
    // body: FilterAppointmentDto
  ): Promise<any> => {
    try {
      // let { startDate, endDate } = body;
      // if (!endDate) {
      //   endDate = new Date(startDate)
      //   .toISOString()
      //   .replace(/T.*/, 'T23:59:59.999Z');
      // }
      const ward = await this.wardModel
        .findById(id)
        .populate(
          'patients',
          'firstName lastName age gender ID admissionDate bedNumber',
        );

      const patients = ward.patients.filter((patient: any) => {
        return (
          patient.firstName
            .toLowerCase()
            .includes(query.search.toLowerCase()) ||
          patient.lastName.toLowerCase().includes(query.search.toLowerCase())
        );
      });
      const count = patients.length;
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return {
        patients: patients.slice((page - 1) * limit, page * limit),
        totalPages,
        count,
        currentPage,
        ward,
        msg: 'success',
      };
    } catch (err) {
      throw err;
    }
  };

  // const ward = await this.wardModel.findById(id)
  // .populate('headOfWard', 'firstName lastName')
  // .populate('patients', 'firstName lastName')
  // .exec()
  // const patients = await this.patientModel.find({
  //     $and: [
  //         {_id: {$in: ward.patients}},
  //         query
  //     ]
  // }).skip((page - 1) * limit).limit(limit).exec();
  // const count = await this.patientModel.countDocuments({
  //     $and: [
  //         {_id: {$in: ward.patients}},
  //         query
  //     ]
  // }).exec();

  // const ward = await this.wardModel.findById(id).populate('headOfWard', 'firstName lastName').exec();
  // const patients = await this.patientModel.find({...query, _id: {$in: ward.patients}}).skip((page - 1) * limit).limit(limit).select('firstName lastName age gender admissionStatus').exec();
  // const count = await this.patientModel.countDocuments({...query, _id: {$in: ward.patients}}).exec();
  // const totalPages = Math.ceil(count / limit);
  // const currentPage = page
  // return {
  //     ward,
  //     patients,
  //     count,
  //     totalPages,
  //     currentPage
  // }
  //     }
  //     catch(error){
  //         throw new InternalServerErrorException(error.message);
  //     }
  // }

  scheduleDischargeForLater = async (
    id: string,
    patientId: string,
    dischargeDate: Date,
  ): Promise<WardDocument | any> => {
    try {
      //we want to change the status of the patient to pending
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //we want to get total number of used beds and total number of unused beds
  getWardStatistics = async (id: string): Promise<any> => {
    try {
      const ward = await this.wardModel.findById(id);
      const usedBeds = ward.usedBeds;
      const unusedBeds = ward.totalBeds - ward.usedBeds;
      return {
        usedBeds,
        unusedBeds,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //get bed statistics for all the ward- total number of used and unused beds in all the wards
  getBedStatistics = async (): Promise<any> => {
    try {
      const wards = await this.wardModel.find();
      let usedBeds = 0;
      let unusedBeds = 0;
      wards.forEach((ward) => {
        usedBeds += ward.usedBeds;
        unusedBeds += ward.totalBeds - ward.usedBeds;
      });

      return {
        usedBeds,
        unusedBeds,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //we want to get total number of beds of all wards, total number of wards, and details of the wards
  getWardDetails = async (): Promise<any> => {
    try {
      const wards = await this.wardModel.find();
      const totalBeds = wards.reduce((acc, ward) => acc + ward.totalBeds, 0);
      const totalWards = wards.length;
      return {
        wards,
        totalBeds,
        totalWards,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //we want to be able to delete ward
  deleteWard = async (id: string): Promise<string> => {
    try {
      const ward = await this.wardModel.findByIdAndDelete(id);
      return 'ward successfully deleted';
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  getStaffInSingleWard = async (
    id: string,
    page = 1,
    limit = 15,
    search?: string,
  ): Promise<any> => {
    try {
      const ward = await this.wardModel
        .findById(id)
        .populate({
          path: 'staff',
          populate: {
            path: 'role',
            model: 'RoleEntity',
          },
        })
        .exec();

      let staff = ward.staff;

      if (search) {
        staff = ward.staff.filter((staff: any) => {
          return (
            staff.firstName.toLowerCase().includes(search.toLowerCase()) ||
            staff.lastName.toLowerCase().includes(search.toLowerCase()) ||
            staff.staffId.toLowerCase().includes(search.toLowerCase())
          );
        });
      }

      const count = staff.length;
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return {
        staff: staff.slice((page - 1) * limit, page * limit),
        totalPages,
        count,
        currentPage,
        msg: 'success',
      };
    } catch (error) {
      throw error;
    }
  };

  getStaffInWard = async (id: string): Promise<any> => {
    try {
      const ward = await this.wardModel.findById(id).populate({
        path: 'staff',
        populate: {
          path: 'role',
          model: 'RoleEntity',
        },
      });
      return ward.staff;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //get all ward with department id
  getWardsByDepartment = async (id: string): Promise<any> => {
    try {
      const wards = await this.wardModel.find({ department: id });
      return wards;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //delete ward only if there are np patients in them
  deleteWardIfEmpty = async (id: string): Promise<any> => {
    try {
      const ward = await this.wardModel.findById(id);
      if (ward.usedBeds === 0) {
        await this.wardModel.findByIdAndDelete(id);
        return 'ward successfully deleted';
      } else {
        return 'ward not empty';
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  //get total number of wards
  getTotalWards = async (): Promise<any> => {
    try {
      return await this.wardModel.countDocuments();
    } catch (error) {
      throw error;
    }
  };

  //get the most recent visits of all patients in a ward
  getRecentVisits = async (userId: string): Promise<any> => {
    try {
      const user = new Types.ObjectId(userId);

      const userWard = await this.wardModel.findOne({ staff: user });

      if (!userWard) throw new NotFoundException('Ward not found');

      const ward = await this.wardModel
        .findById(userWard.id)
        .populate('patients')
        .sort({ createdAt: -1 })
        .exec();
      const patients: any = ward?.patients;
      let visitsArray: any = [];
      for (const patient of patients) {
        const visit = await this.visitService.getMostRecentVisit(patient._id);
        const recommendation = visit?.recommendation;
        const assessmentLog = visit?.assessmentLog;
        const patientName = patient.firstName + ' ' + patient.lastName;
        const visitObject = {
          patientId: patient._id,
          patientName: patientName,
          assessmentLog: assessmentLog,
          recommendation: recommendation,
        };
        visitsArray.push(visitObject);
      }
      return visitsArray;
    } catch (error) {
      throw error;
    }
  };
}
