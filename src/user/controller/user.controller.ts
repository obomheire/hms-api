import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Param,
  Delete,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ChangePasswordDto } from '../dto/changePassword.dto';
import { ChangePasswordLogin } from '../dto/changePasswordLogin.dto';
import { FilterByRoleAndStatus } from '../dto/filterByRole.dto';
import { SearchDto } from '../dto/searchDto';
import { CreateUserDto, UpdateUserDto } from '../dto/user.staff.dto';
import { UserService } from '../services/user.service';
import { ApiBody, ApiParam, ApiQuery, ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MultipartFile } from '@fastify/multipart';
import { Request } from 'express';
import { File } from 'src/minio/decorator/file.decorator';
import { reference } from 'src/utils/constants/constant';
// import { MinioService } from 'src/minio/service/minio.service';
import { FileUploadDto } from 'src/minio/dto/file.dto';
import { UploadGuard } from 'src/minio/guard/file.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('User')
@ApiBearerAuth("Bearer")
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    // private readonly minioService: MinioService
    ) {}

  @ApiBody({
    type: UpdateUserDto,
    description: 'update user request body',
  })
  @ApiParam({
    name: 'id',
    description: 'uddate user by id',
  })
  @Patch('update/:id')
  async update(@Param() id: string, @Body() userInfo: UpdateUserDto) {
    return await this.userService.update(id, userInfo);
  }

  @ApiBody({
    type: CreateUserDto,
    description: 'change password request body',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('filename'))
  @Post('add-staff')
  async addStaff(@Body() body: CreateUserDto, @UploadedFile() filename?: Express.Multer.File,) {
    return await this.userService.createStaff(body, filename);
  }

  @ApiParam({
    name: 'staffId',
    description: 'get staff by id',
  })
  @Get('get-staff/:id')
  async getStaff(@Param('staffId') staffId: string) {
    return await this.userService.getStaff(staffId);
  }

  @Get('mobile/get-staff/:id')
  async getMobileStaff(@Param('staffId') staffId: string) {
    return await this.userService.getStaff(staffId);
  }

  @Get('test')
  async testing() {
    return 'yes';
  }

  @ApiBody({
    type: UpdateUserDto,
    description: 'update staff request body',
  })
  @ApiParam({
    name: 'staffId',
    description: 'update staff by id',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('filename'))
  @Patch('update-staff/:staffId')
  async updateStaff(
    @Param('staffId') staffId: string,
    @Body() body: UpdateUserDto,
    @UploadedFile() filename?: Express.Multer.File,
  ) {
    return await this.userService.updateStaff(staffId, body, filename);
  }

  @ApiQuery({
    name: 'role',
    description: 'get all staff, query by role',
  })
  @Get('get-all-staff-by-role')
  async getAllStaffByRole(@Query('role') role: string) {
    return await this.userService.getStaffByRole(role);
  }

  @ApiParam({
    name: 'staffId',
    description: 'suspend staff by id',
  })
  @Patch('suspend-staff/:staffId')
  async suspendStaff(@Param('staffId') staffId: string) {
    return await this.userService.suspendStaff(staffId);
  }

  @ApiParam({
    name: 'staffId',
    description: 'get single staff by id',
  })
  @Get('get-single-staff/:staffId')
  async getSingleStaff(@Param('staffId') staffId: string) {
    return await this.userService.getStaff(staffId);
  }

  @ApiParam({
    name: 'staffId',
    description: 'delete staff by id',
  })
  @Delete('delete-staff/:staffId')
  async deleteStaff(@Param('staffId') staffId: string) {
    return await this.userService.deleteStaff(staffId);
  }

  @ApiParam({
    name: 'staffId',
    description: 'reactivate staff by id',
  })
  @Patch('reactivate-staff/:staffId')
  async reactivateStaff(@Param('staffId') staffId: string) {
    return await this.userService.reactivateStaff(staffId);
  }

  // @ApiQuery({
  //   name: 'query',
  //   type: SearchDto,
  //   description: 'get all staff, query by search',
  // })
  @ApiBody({
    type: SearchDto,
    description: 'get all staff, query by search',
  })
  
  @Post('get-all-staff')
  async getAllStaff(@Body() body: SearchDto) {
    return await this.userService.getAllStaffs(body);
  }


  @Get('filter')
  async filterByRoleAndStatusAndAlphabet(
    @Query() query: FilterByRoleAndStatus,
  ) {
    return await this.userService.filterByRoleAndStatusAndAlphabet(query);
  }

  @ApiBody({
    type: ChangePasswordDto,
    description: 'change password request body',
  })
  @Patch('change-password')
  async changePassword(
    @Body()
    body: ChangePasswordDto,
    @Req() req: any,
  ) {
    return await this.userService.changePassword(body, req);
  }

  @ApiBody({
    type: ChangePasswordLogin,
    description: 'change password at first login request body',
  })
  @Patch('change-password-login')
  async changePasswordLogin(
    @Body()
    body: ChangePasswordLogin,
    // @getUser() user: any,
  ) {
    return await this.userService.changePasswordAtFirstLogin(body);
  }

  @ApiQuery({
    name: 'search',
    type: String,
    description: 'get all staff, query by search',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'get all staff, query by page',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    description: 'get all staff, query by limit',
  })
  @Get('get-free-doctors')
  async getFreeDoctors(@Query('page') page: number, @Query('limit') limit: number, @Query('search') search: string) {
    return await this.userService.getFreeUsers(page, limit, search);
  }

  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   type: FileUploadDto
  // })
  // @Post('profile-image')
  // @UseGuards(UploadGuard)
  // async uploadFile(@File() file: MultipartFile, @Req() req: Request) {
  //   console.log(file)
  //   const [status, title, message, data] = await this.minioService.put(
  //     file,
  //     'media',
  //     reference().replace(/-/g, '_'),
  //   );
  //   console.log(data, title, message, status, 'data')
  //   return 'yes'
  // }

}
