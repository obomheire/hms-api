import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DepartmentDocument,
  DepartmentEntity,
} from 'src/department/schema/department.schema';
import { RoleDocument, RoleEntity } from 'src/role/schema/role.schema';
import { UserDocument, UserEntity } from 'src/user/schema/user.schema';
import * as bcrypt from 'bcrypt';
import { TransactionTypeService } from 'src/transaction-types/services/transaction-type.service';
import { TransactionTypeNameEnum } from 'src/transaction-types/enums/transaction-type.enum';
import { RoleService } from 'src/role/service/role.service';

@Injectable()
export class SeedsService implements OnModuleInit {
  private readonly logger = new Logger(SeedsService.name);
  constructor(
    @InjectModel(DepartmentEntity.name)
    private departmentModel: Model<DepartmentDocument>,

    @InjectModel(UserEntity.name)
    private userModel: Model<UserDocument>,

    @InjectModel(RoleEntity.name)
    private roleModel: Model<RoleDocument>,

    private readonly transactionTypeService: TransactionTypeService,

  ) {}
  async onModuleInit() {
    //create a general outpatient department
    //we want to create morning, afternoon, night shift and weekend shits
    try {
      //if department with the name General Outpatient Department exists, do nothing
      const department = await this.departmentModel.findOne({
        name: 'General Outpatient Department',
      });
      if (!department) {
        const department = await this.departmentModel.create({
          name: 'General Outpatient Department',
         
        });
        this.logger.log('department created', department);



      }
      //create a role
      const role = await this.roleModel.findOne({
        name: 'SUPERADMIN',
      });
      if (!role) {
        const role = await this.roleModel.create({
          name: 'SuperAdmin',
          description: 'SuperAdmin',
          roleType: 'Default'
        });

        console.log('role created', role);
      }

      //create a DOCTOR role if it does not exist
      const doctorRole = await this.roleModel.findOne({
        name: 'DOCTOR',
        description: 'DOCTOR',
      });
      if (!doctorRole) {
        const doctorRole = await this.roleModel.create({
          name: 'DOCTOR',
          roleType: 'User',
          description: 'DOCTOR'
        });
        Logger.log('doctor role created', doctorRole);
      }


      //create a user
      const user = await this.userModel.findOne({
        email: 'naheemadedokun@gmail.com',
      });
      if (!user) {
        const user = await this.userModel.create({
          email: 'naheemadedokun@gmail.com',
          password: await bcrypt.hash('password', 10),
          firstName: 'Naheem',
          lastName: 'Adedokun',
          middleName: 'Ademola',
          role: role._id,
          dateOfBirth: '1999-09-09',
          accountStatus: 'active',
          staffId: 'ID-000001'
        });
        this.logger.log('user created', user);
      }

      const transactionType = await this.transactionTypeService.getTransactionTypeByName('General Consultation');
      if (!transactionType) {
        const transactionType = await this.transactionTypeService.seedTransactionType({
          name: 'General Consultation',
          description: 'General Consultation',
          type: TransactionTypeNameEnum.CONSULTATION,
          amount: 1000,
          ward: null,
          specialty: null
        });
        this.logger.log('transaction type created', transactionType);
      }
    } catch (error) {
      this.logger.error(error.message);
    }
  }
  

}
