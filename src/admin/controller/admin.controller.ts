import { Controller, Get, Post, Patch, Param, Body, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FilterPatientDto } from 'src/patients/dto/filterPatient.dto';
import { CalendarFilterDto } from 'src/patients/dto/visit.dto';
import { CalendarFilterEnum } from 'src/patients/enum/visit-status.enum';
import Api from 'twilio/lib/rest/Api';
import { HospitalProfileDto, UpdateHospitalProfileDto } from '../dto/admin.dto';
import { AdminService } from '../service/admin.service';
import { HospitalProfileService } from '../service/hospital-address.service';

@ApiTags('Admin')
@ApiBearerAuth('Bearer')
@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly hospitalProfileService: HospitalProfileService
    ) {}

    @ApiBody({ type: FilterPatientDto })
    @Post('dashboard')
    async getAdminDashboardData(@Body() data?: FilterPatientDto) {
        return await this.adminService.getAdminDashboardData(data);
    }

    @Get('get-mortality-details')
    async getMortarlityDetails(){
        return await this.adminService.getMortarlityDetails()
    }

    //dashboard analytics
    @ApiQuery({ name: 'query', enum: CalendarFilterEnum, required: false })
    @Get('dashboard-analytics')
    async getDashboardAnalytics(@Query('query') query?: CalendarFilterEnum){
        return await this.adminService.getVisitsAdminCalendar(query)
    }

    @Get('nurse-dashboard')
    async nurseDashboard(){
        return await this.adminService.nurseDashboard()
    }

    @ApiParam({ name: 'id', required: true })
    @Get('nurse-ward-logs/:id')
    async getNurseWardLogs(@Param('id') id: string){
        return await this.adminService.getLogsForWard(id)
    }

    @ApiBody({
        type: HospitalProfileDto,
    })
    @Post('hospital-profile')
    @UseInterceptors(FileInterceptor('filename'))
    async createHospitalProfile(@Body() body: HospitalProfileDto, @UploadedFile() filename?: Express.Multer.File, ) {
        return await this.hospitalProfileService.createHospitalProfile(body, filename);
    }

    @Patch('hospital-profile/:id')
    @UseInterceptors(FileInterceptor('filename'))
    async updateHospitalProfile(@Body() body: UpdateHospitalProfileDto, @Param('id') id: string, @UploadedFile() filename?: Express.Multer.File) {
        return await this.hospitalProfileService.updateHospitalProfile(body, id, filename);
    }


    @Get('hospital-profile')
    async getHospitalProfile() {
        return await this.hospitalProfileService.getHospitalProfile();
    }

}
