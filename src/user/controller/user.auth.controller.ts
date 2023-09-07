import {
  Body,
  Controller,
  NotFoundException,
  Patch,
  Post,
  Param
} from '@nestjs/common';
import { TokenService } from 'src/auth/services/token.service';
// import { RoleDto } from 'src/role/dtos/role.dto';
import { JoiObjectValidationPipe } from 'src/utils/pipes/validation.pipe';
import { LoginDto } from '../dto/user.dto';
import { UserService } from '../services/user.service';
import { loginValidator } from '../validators/user.validator';
import { ChangePasswordLogin } from '../dto/changePasswordLogin.dto';
import { ResetPasswordDto } from '../dto/resetPassword.dto';
import { ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('User Auth')
@Controller('auth')
export class UserAuthController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  @ApiBody({
    type: LoginDto,
    description: 'login request body',
  })
  @Post('login')
  async login(
    @Body(new JoiObjectValidationPipe(loginValidator))
    userLoginDetails: LoginDto,
  ) {
    const user = await this.userService.login(userLoginDetails);
    //if user.accountStatus is inactive, just return user
    if (user.accountStatus === 'inactive') {
      return user;
    }
    if (!user) throw new NotFoundException('user not found!');
    // const permissions: any = (user.role as unknown as RoleDto).permissions;
    const { authorizationToken } = await this.tokenService.generateTokens({
      // permissions,
      user: user.id,
      staffId: user.staffId,
      // Organisation: user.Organisation,
      accountStatus: user.accountStatus,
    });
    return {
      user,
      authorizationToken,
      // permissions
    };
  }

  @ApiBody({
    type: 'string',
    description: 'forgot password request body',
  })
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return await this.userService.forgotPassword(email);
  }

  @ApiBody({
    type: ResetPasswordDto,
    description: 'reset password request body',
  })
  @ApiParam({
    name: 'token',
    type: 'string',
    description: 'reset password by token',
  })
  @Patch('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() body: ResetPasswordDto,
  ) {
    return await this.userService.resetPassword(token, body);
  }

  @ApiBody({
    type: ChangePasswordLogin,
    description: 'change password at first login request body',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'change password at first login by id',
  })
  @Patch('change-password-login')
  async changePasswordLogin(
   
    @Body()
    body: ChangePasswordLogin,
  ) {
    return await this.userService.changePasswordAtFirstLogin(body);
  }
}
