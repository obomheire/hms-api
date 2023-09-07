/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { hash } from 'bcryptjs';
import { MailsService } from 'src/providers/mails/mails.service';
import {
  CreateUserDto,
  responseDto,
  UpdateUserDto,
} from '../dto/user.staff.dto';
import { UserDocument, UserEntity } from '../schema/user.schema';
import {
  generateIncrementalValue,
  generateIncrementalValues,
} from '../../utils/functions/generateIncrementalValue';
import { sendWelcomeStaffEmail } from 'src/providers/mails/welcome.template';
import { sendResetPasswordMail } from 'src/providers/mails/forgotPassword.template';
import { AccountStatusEnum } from 'src/utils/enums/accountStatus.enum';
import { TokenService } from 'src/auth/services/token.service';
import { LoginDto } from '../dto/user.dto';
import { ChangePasswordDto } from '../dto/changePassword.dto';
import { ChangePasswordLogin } from '../dto/changePasswordLogin.dto';
import { ResetPasswordDto } from '../dto/resetPassword.dto';
import { SearchDto } from '../dto/searchDto';
import * as bcrypt from 'bcryptjs';
import { type } from 'os';
import { profile } from 'console';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { RoleService } from 'src/role/service/role.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserEntity.name)
    private UserModel: Model<UserDocument>,
    private mailService: MailsService,
    private tokenService: TokenService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly roleService: RoleService,
  ) {}

  async update(id: string, userInfo: UpdateUserDto) {
    // const { id, ...rest } = userInfo;
    const user = await this.UserModel.findByIdAndUpdate(
      {
        _id: id,
      },
      { ...userInfo },
      { new: true },
    );
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async login(loginCredentials: LoginDto) {
    const { password, email, staffId } = loginCredentials;
    const user = await this.UserModel.findOne({
      $or: [{ email: email }, { staffId: staffId }],
    })
      .populate('role')
      .exec();

    if (!user) return undefined;
    const isValidPassword = await UserEntity.isValidPassword(
      password,
      user.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException(
        'Invalid credentials, kindly check your details again',
      );
    }
    return user;
  }

  changePasswordAtFirstLogin = async (data: ChangePasswordLogin) => {
    try {
      const { oldPassword, newPassword, confirmPassword, email } = data;
      const user = await this.UserModel.findOne({
        email,
      });
      if (!user) throw new NotFoundException('user not found');

      const isValid = await bcrypt.compare(oldPassword, user.password);
      if (!isValid) {
        throw new UnauthorizedException(
          'Invalid credentials, kindly check your details again',
        );
      }

      if (newPassword !== confirmPassword) {
        throw new BadRequestException('passwords do not match');
      }
      const hashedPassword = await hash(newPassword, 10);

      user.password = hashedPassword;
      user.accountStatus = AccountStatusEnum.ACTIVE;
      await user.save();

      return user;
    } catch (err: any) {
      throw new InternalServerErrorException(err.message);
    }
  };

  changePassword = async (data: ChangePasswordDto, req: any) => {
    try {
    const { oldPassword, password, confirmPassword } = data;
    const user = await this.UserModel.findById(req.user.toString());
    if (!user) throw new NotFoundException('user not found');
    const isValidPassword = await UserEntity.isValidPassword(
      oldPassword,
      user.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException(
        'Invalid credentials, kindly check your details again',
      );
    }
    if (password !== confirmPassword) {
      throw new BadRequestException('passwords do not match');
    }
    const hashedPassword = await hash(password, 10);
    const updatedUser = await this.UserModel.findByIdAndUpdate(
      { _id: req.user.toString() },
      { password: hashedPassword },
      { new: true },
    );
    return updatedUser;
    } catch (err: any) {
      throw new InternalServerErrorException(err.message);
    }
    
  };

  getSelfProfile = async (authUser?: UserDocument) => {
    const user = await this.UserModel.findById({ _id: authUser.id })
      .populate(['Organisation', 'role'])
      .exec();
    if (!user) throw new NotFoundException('user not found');
    return user;
  };

  forgotPassword = async (email: string) => {
    try {
      const user = await this.UserModel.findOne({ email });
      if (!user) throw new NotFoundException('user not found');
      const token = await this.tokenService.generateTokens({
        user: user._id,
        staffId: user.staffId,
        email: user.email,
        accountStatus: user.accountStatus,
      });
      //edehjamesraphael@gmail.com
      const link = `https://www.localhost:3000/reset-password/${token.authorizationToken}`;
      const text = `Hi ${user.firstName}, click on the link below to reset your password`;
      const html = sendResetPasswordMail(user.firstName, link);
      await this.mailService.sendMail(text, html, email, 'Reset Password');
      return {
        message: 'password reset link sent to your email',
        token: token,
        user: user,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  };

  resetPassword = async (
    token: string,
    data: ResetPasswordDto,
  ): Promise<UserDocument> => {
    const { password, confirmPassword } = data;
    try {
      const { user: id } = await this.tokenService.verify(token);
      const user = await this.UserModel.findById({ _id: id });
      if (!user) throw new NotFoundException('user not found');
      if (password !== confirmPassword) {
        throw new BadRequestException('passwords do not match');
      }
      const { password: hashedPassword, salt } = await UserEntity.hashPassword(
        password,
      );
      user.password = hashedPassword;
      user.salt = salt;
      return await user.save();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  };

  createStaff = async (staff: CreateUserDto, filename?: Express.Multer.File,): Promise<any> => {
    try {
      const staffExists = await this.UserModel.findOne({
        email: staff.email,
      });
      if (staffExists) {
        throw new BadRequestException('Staff already exists');
      }
      const password = (Math.random() + 1).toString(36).substring(2);
      const salt = await hash(password, 10);
      const hashedPassword = await hash(password, salt);
      const serialNumber = await generateIncrementalValues(
        // <--- this is the function that generates the serial number
        this.UserModel,
      ); 

      let uploadImage: any
      let profilePicture: string = ''
      if(filename){
       uploadImage = await this.cloudinaryService.uploadImage(filename);
       profilePicture = uploadImage.secure_url
      }

      const staffId = `ID-${serialNumber}`;
      const newStaff = new this.UserModel({
        ...staff,
        password: hashedPassword,
        staffId,
        salt,
        profilePicture
      });

      const savedStaff = await newStaff.save();
      const fullname = `${savedStaff.firstName} ${savedStaff.lastName}`;

      const text = `Hello ${savedStaff.firstName} ${savedStaff.lastName}, welcome to our organization. Your staff ID is ${staffId} and your password is ${password}. Please change your password after logging in.`;
      const htmlTemplate = sendWelcomeStaffEmail(
        fullname,
        staff.email,
        staffId,
        password,
      );

      this.mailService.sendMail(
        text,
        htmlTemplate,
        staff.email,
        'Staff Account',
      );

      return {
        message: `Please check your email for your login details`,
        savedStaff,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  };


  updateStaff = async (id: string, staff: UpdateUserDto, filename?: Express.Multer.File,): Promise<any> => {
    try {
      const staffExists = await this.UserModel.findById({
        _id: id,
      });
      const oldEmail: string = staffExists.email;
      if (!staffExists) {
        throw new NotFoundException('Staff does not exist');
      }

      let uploadImage: any
      let profilePicture: string = ''
      console.log(filename, 'filename')
      if(filename){
       uploadImage = await this.cloudinaryService.uploadImage(filename);
       profilePicture = uploadImage.secure_url
      }
      const updatedStaff = await this.UserModel.findByIdAndUpdate(
        { _id: id },
        { ...staff,
          profilePicture,
         },
        { new: true },
      );
      const { password: _, salt: __, ...staffData } = updatedStaff.toObject();
      if (updatedStaff.email !== oldEmail) {
        const password = (Math.random() + 1).toString(36).substring(2);
        const salt = await hash(password, 10);
        const hashedPassword = await hash(password, salt);
        const text = `Hello ${updatedStaff.firstName} ${updatedStaff.lastName}, your email has been changed to ${updatedStaff.email}. Please use this email to login to your account. Your password remains the same`;
        const htmlTemplate = sendWelcomeStaffEmail(
          updatedStaff.firstName,
          updatedStaff.email,
          updatedStaff.staffId,
          password,
        );
        this.mailService.sendMail(
          text,
          htmlTemplate,
          updatedStaff.email,
          'Staff Account Update',
        );
        updatedStaff.password = hashedPassword;
        updatedStaff.accountStatus = AccountStatusEnum.INACTIVE;

        return {
          message:
            'Staff update successful. Please check your email for your new login details',
          updatedStaff,
        };
      }
      return `Staff with ID ${staffData.staffId} updated successfully`;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  };

  getStaffByRole = async (role: string): Promise<UserDocument[]> => {
    try {
      const staff = await this.UserModel.find({
        role,
      });
      if (!staff) {
        throw new NotFoundException('Staff does not exist');
      }
      // const staffData = staff.map((staff) => {
      //   const { password: _, salt: __, ...staffData } = staff.toObject();
      //   return staffData;
      // });
      return staff;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  };

  suspendStaff = async (id: string): Promise<string> => {
    try {
      const staffExists = await this.UserModel.findById({
        _id: id,
      });
      if (!staffExists) {
        throw new NotFoundException('Staff does not exist');
      }

      const updatedStaff = await this.UserModel.findByIdAndUpdate(
        { _id: id },
        { $set: { accountStatus: 'suspended' } },
        { new: true },
      );

      const { password: _, salt: __, ...staffData } = updatedStaff.toObject();
      return `Staff with ID ${staffData.staffId} suspended successfully`;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  };

  reactivateStaff = async (id: string): Promise<string> => {
    try {
      const staffExists = await this.UserModel.findById({
        _id: id,
      });
      if (!staffExists) {
        throw new NotFoundException('Staff does not exist');
      }
      if (staffExists.accountStatus === 'active') {
        throw new BadRequestException('Staff is already active');
      }

      if (staffExists.accountStatus === 'inactive') {
        throw new BadRequestException('Staff has to be onboarded by himself');
      }

      const updatedStaff = await this.UserModel.findByIdAndUpdate(
        { _id: id },
        { $set: { accountStatus: 'active' } },
        { new: true },
      );

      const { password: _, salt: __, ...staffData } = updatedStaff.toObject();
      return `Staff with ID ${staffData.staffId} has been reactivated successfully`;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  };

  getStaff = async (id: string): Promise<any> => {
    try {
      const staffExists = await this.UserModel.findById({
        _id: id,
      }).populate('role').populate('designation')
      if (!staffExists) {
        throw new NotFoundException('Staff does not exist');
      }
      const { password: _, salt: __, ...staffData } = staffExists.toObject();
      return staffData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  };

  deleteStaff = async (id: string): Promise<string> => {
    try {
      const staffExists = await this.UserModel.findById({
        _id: id,
      });
      if (!staffExists) {
        throw new NotFoundException('Staff does not exist');
      }
      await this.UserModel.findByIdAndDelete({ _id: id });
      return `Staff with ID ${staffExists.staffId} deleted successfully`;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  };

  filterStaff = async (
    filter: FilterQuery<UserDocument>,
  ): Promise<UserDocument[]> => {
    try {
      const staff = await this.UserModel.find(filter);
      if (!staff) {
        throw new NotFoundException('Staff does not exist');
      }
      return staff;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  };

  getAllStaffs = async (
    input?: SearchDto
  ): Promise<any> => {
    try {
      let { page, limit, roleFilter, search } = input;
      console.log(page, limit, search, )
      page = +page
      limit = +limit 
      const query = {};
      if (roleFilter) {
        query['role'] = roleFilter;
      }
      if (search) {
        console.log('search', search)
        query['$or'] = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { staffId: { $regex: search, $options: 'i' } },
        ];
      }

      const staffs = await this.UserModel.find(query)
        .populate('role')
        .skip((page - 1) * limit)
        .limit(limit);
      const count = await this.UserModel.countDocuments(query);
      const currentPage = page;
      const totalPages = Math.ceil(count / limit);
      const data = staffs.map((staff: any) => {
        const { password: _, salt: __, ...staffData } = staff.toObject();
        return staffData;
      });
      return { data, count, currentPage, totalPages };
    } catch (error) {
      throw error;
    }
  };

  searchStaff = async ({
    limit = 10,
    page = 1,
    search = '',
  }: {
    limit?: number;
    page?: number;
    search?: string;
  }): Promise<UserDocument[]> => {
    try {
      const staffs = await this.UserModel.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { id: { $regex: search, $options: 'i' } },
          { role: { $regex: search, $options: 'i' } },
        ],
      })
        .skip((page - 1) * limit)
        .limit(limit);
      return staffs;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  };

  searchStaffByIdOrRole = async ({
    limit = 10,
    page = 1,
    search = '',
  }: {
    limit?: number;
    page?: number;
    search?: string;
  }): Promise<UserDocument[]> => {
    try {
      const staffs = await this.UserModel.find({
        $or: [
          { id: { $regex: search, $options: 'i' } },
          { role: { $regex: search, $options: 'i' } },
        ],
      }).limit(limit);
      return staffs;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  };

  //   filterByStatus = async (
  //     status: string,
  //     limit = 10,
  //     page = 1,
  //   ): Promise<UserDocument[]> => {
  //     try {
  //       const staffs = await this.UserModel.find({ accountStatus: status })
  //         .skip((page - 1) * limit)
  //         .limit(limit);
  //       return staffs;
  //     } catch (error) {
  //       throw new InternalServerErrorException(error);
  //     }
  //   };

  filterByRoleAndStatusAndAlphabet = async ({
    role = '',
    status = '',
    alphabet = '',
    limit = 10,
    page = 1,
    search = '',
  }: {
    limit?: number;
    role?: string;
    status?: string;
    alphabet?: string;
    page?: number;
    search?: string;
  }): Promise<any> => {
    try {
      const staffs = await this.UserModel.find({
        role: role,
        accountStatus: status,
        $or: [
          { firstName: { $regex: `^${alphabet}`, $options: 'i' } },
          { lastName: { $regex: `^${alphabet}`, $options: 'i' } },
          { email: { $regex: `^${alphabet}`, $options: 'i' } },
        ],
      })
        .skip((page - 1) * limit)
        .limit(limit);

      const count = await this.UserModel.countDocuments({
        role: role,
        accountStatus: status,
        $or: [
          { firstName: { $regex: `^${alphabet}`, $options: 'i' } },
          { lastName: { $regex: `^${alphabet}`, $options: 'i' } },
          { email: { $regex: `^${alphabet}`, $options: 'i' } },
        ],
      });
      const currentPage = page;
      const totalPages = Math.ceil(count / limit);
      return { staffs, count, currentPage, totalPages };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  };

  //we want to get total number of users
  getTotalUsers = async (): Promise<number> => {
    try {
      const count = await this.UserModel.countDocuments();
      return count;
    } catch (error) {
      throw error;
    }
  };

  getFreeUsers = async (
    page = 1,
    limit = 10,
    search = ''
  ): Promise<UserDocument[] | any> => {
    try {
      const doctorRole = await this.roleService.findRoleByName('DOCTOR');
      console.log(doctorRole, 'doctorRole');
      if (!doctorRole) {
        throw new NotFoundException('Role not found');
      }
      
      const query = {
        isFree: true,
        role: doctorRole._id.toString(),
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
      
      const users = await this.UserModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
        
      const count = await this.UserModel.countDocuments(query);
      const currentPage = page;
      const totalPages = Math.ceil(count / limit);
      
      return { users, count, currentPage, totalPages };
    } catch (error) {
      throw error;
    }
  };
  

  //update user's isFree status
  updateIsFree = async (id: string, isFree: boolean): Promise<UserDocument> => {
    try {
      return await this.UserModel.findByIdAndUpdate(
        id,
        { isFree },
        { new: true },
      );
    } catch (error) {
      throw error;
    }
  };
}

// changePasswordAtFirstLogin = async (
//   id: string,
//   password: string,
//   confirmPassword: string,
// ) => {
//   try {
//     const user = await this.UserModel.findById({ _id: id });
//     if (!user) throw new NotFoundException('user not found');
//     if (password !== confirmPassword)
//       throw new BadRequestException('passwords do not match');
//     const { password: hashedPassword, salt } = await UserEntity.hashPassword(
//       password,
//     );
//     user.password = hashedPassword;
//     user.salt = salt;
//     user.accountStatus = AccountStatusEnum.ACTIVE;
//     return await user.save();
//   } catch (e) {
//     throw new BadRequestException(e.message);
//   }
// };

// changeSelfPassword = async (
//   id: string,
//   password: string,
//   confirmPassword: string,
// ) => {
//   try {
//     const user = await this.UserModel.findById({ _id: id });
//     if (!user) throw new NotFoundException('user not found');
//     if (password !== confirmPassword)
//       throw new BadRequestException('passwords do not match');
//     const { password: hashedPassword, salt } = await UserEntity.hashPassword(
//       password,
//     );
//     user.password = hashedPassword;
//     user.salt = salt;
//     return await user.save();
//   } catch (e) {
//     throw new BadRequestException(e.message);
//   }
// };
