import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
// import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {  Model, Types } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { TokenService } from 'src/auth/services/token.service';
import { TokenDto } from 'src/auth/dtos/token.dto';
import { AccountStatusEnum } from '../enums/accountStatus.enum';
import { UserEntity, UserDocument} from 'src/user/schema/user.schema'

@Injectable()
export class TokenMiddleware implements NestMiddleware {
  constructor(
    private readonly tokenService: TokenService,
    // @InjectModel(UserEntity.name)
    // private UserModel: Model<UserDocument>,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      throw new UnauthorizedException(
        'you must be logged in to access this route',
      );
    }
    const authorizationHeader = req.headers.authorization;
    const [bearer, token] = authorizationHeader.split(' ');
    if (bearer !== 'Bearer') {
      throw new NotFoundException('please provide a Bearer token');
    }

    if (!token) {
      throw new Notification('token not found');
    }
    const tokenData: TokenDto = await this.tokenService.verify(token);

    if (tokenData.accountStatus === AccountStatusEnum.SUSPENDED) {
      throw new BadRequestException(
        'your account is suspended, kindly reach out to your administrator for instructions on reactivating your account',
      );
    }
    if (tokenData.accountStatus === AccountStatusEnum.INACTIVE) {
      throw new BadRequestException(
        'you need to log in and reset your password',
      );
    }
    if (tokenData.category === 'patient') {

      if (!req.originalUrl.includes('mobile')) {
        throw new UnauthorizedException(
          'you are not authorized to access this route',
        );
      }
    }

    res.locals.token = tokenData.user;

   
    const userID = new Types.ObjectId(tokenData.user);
    req.user = userID
    // const user = await this.UserModel.findById(userID)
    // console.log(user)
    // req.user = user;
    // res.locals.tokenData = tokenData;
    // console.log(res.locals.tokenData);
    next();
  }
}
