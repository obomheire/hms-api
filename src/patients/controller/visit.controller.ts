import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { string } from "joi";
import { FilterBodyDto } from "src/inventory/dto/itemRequisition.dto";
import { AssessmentLogDto, UpdateAssessmentLogDto } from "../dto/assessmentLog.dto";
import { FilterPatientDto } from "../dto/filterPatient.dto";
import { CreateVisitItemDto, UpdateVisitItemDto } from "../dto/visit-item.dto";
import { CreateVisitDto, UpdateVisitDto } from "../dto/visit.dto";
import { VisitService } from "../service/visit.service";
import { Request } from "express";

@ApiBearerAuth('Bearer')
@ApiTags('Visits')
@Controller('visit')
export class VisitController {
    constructor(
        private readonly visitService: VisitService
    ) {}

    //create visit
    @ApiBody({
        type: CreateVisitDto,
        description: 'create visit request body',
    })
    @Post()
    async createVisit(@Body() body: CreateVisitDto) {
        return await this.visitService.createVisit(body);
    }

    //update visit
    @ApiParam({
        name: 'visitId',
        type: 'string',
        description: 'update visit with id',
    })
    @ApiBody({
        type: CreateVisitItemDto,
        description: 'update visit request body',
    })
    @Patch(':visitId')
    async updateVisit(
        @Param('visitId') visitId: string,
        @Body() visit: CreateVisitItemDto,
        @Req() req: any,

    ) {
        return await this.visitService.updateVisit(visitId, visit, req);
    }

    @ApiBody({
        type: UpdateVisitItemDto,
        description: 'update visit item request body',
    })
    @ApiParam({
        name: 'visitItemId',
        type: 'string',
        description: 'update visit with id',
    })
    @Patch('update/:visitItemId')
    async updateVisitItem(
        @Param('visitItemId') visitItemId: string,
        @Body() visit: UpdateVisitItemDto,
        @Req() req: any,

    ) {
        return await this.visitService.updateVisitItem(visit, visitItemId);
    }

    //get visit item
    @ApiParam({
        name: 'visitItemId',
        type: 'string',
        description: 'gets a single visit item with id',
    })
    @Get('item/:visitItemId')
    async getVisitItem(@Param('visitItemId') visitItemId: string) {
        return await this.visitService.getVisitItem(visitItemId);
    }


    //delete visit
    @ApiParam({
        name: 'visitId',
        type: 'string',
        description: 'delete visit with id',
    })
    @Delete(':visitId')
    async deleteVisit(@Param('visitId') visitId: string) {
        return await this.visitService.deleteVisit(visitId);
    }

    //get visit
    @ApiParam({
        name: 'visitId',
        type: 'string',
        description: 'gets a single visit with id',
    })
    @Get(':visitId')
    async getVisit(@Param('visitId') visitId: string) {
        return await this.visitService.getVisit(visitId);
    }

    //get all visits
    @ApiQuery({
        name: 'search',
        type: 'string',
        description: 'search visits',
    })
    @ApiBody({
        type: string,
        description: 'search visits request body',
    })

    @Post('visits')
    async getAllVisits(@Query('search') search?: string, @Body('date') date?: string) {
        return await this.visitService.getVisits(search, date);
    }

    //get all visits by patient id
    @ApiParam({
        name: 'patientId',
        type: 'string',
        description: 'gets all visits by patient id',
    })
    @ApiBody({
        type: string,
        description: 'get all visits by patient id request body',
    })
    @ApiQuery({
        name: 'search',
        type: 'string',
        description: 'search visits',
    })
    @Post('visits/:patientId')
    async getAllVisitsByPatientId(@Param('patientId') patientId: string, @Query('search') search?: string, @Body('date') date?: string) {
        return await this.visitService.getPatientVisits(patientId, search, date);
    }

    //get all visits by doctor id
    // @ApiParam({
    //     name: 'doctorId',
    //     type: 'string',
    //     description: 'gets all visits by doctor id',
    // })
    // @ApiBody({
    //     type: string,
    //     description: 'get all visits by patient id request body',
    // })
    // @ApiQuery({
    //     name: 'search',
    //     type: 'string',
    //     description: 'search visits',
    // })   
    // @Post('visits/doctor/:doctorId')
    // async getAllVisitsByDoctorId(@Param('doctorId') doctorId: string, @Query('search') search: string, @Body() date: string) {
    //     return await this.visitService.getDoctorVisits(doctorId, search, date);
    // }

    //get patient visit statistics
    @ApiParam({
        name: 'patientId',
        type: 'string',
        description: 'gets patient visit statistics',
    })
    @Get('statistics/:patientId')
    async getPatientVisitStatistics(@Param('patientId') patientId: string) {
        return await this.visitService.getPatientVisitStatistics(patientId);
    }

    //create assessment log
    // @ApiParam({
    //     name: 'visitId',
    //     type: 'string',
    //     description: 'create assessment log with visit id',
    // })
    // @ApiBody({
    //     type: AssessmentLogDto,
    //     description: 'create assessment log request body',
    // })
    // @Post('assessment/:visitId')
    // async createAssessmentLog(@Param('visitId') visitId: string, @Body() body: AssessmentLogDto) {
    //     return await this.visitService.createAssessmentLog(body, visitId);
    // }

    //update assessment log
    // @ApiParam({
    //     name: 'id',
    //     type: 'string',
    //     description: 'update assessment log with visit id',
    // })
    // @ApiParam({
    //     name: 'userId',
    //     type: 'string',
    //     description: 'user id of the uset',
    // })
    // @ApiBody({
    //     type: UpdateAssessmentLogDto,
    //     description: 'update assessment log request body',
    // })
    // @Patch('assessment/:id/:userId')
    // async updateAssessmentLog(@Param('id') id: string, @Param('userId') userId: string, @Body() body: UpdateAssessmentLogDto) {
    //     return await this.visitService.updateAssessmentLog(id, body, userId);
    // }

    //get assessment logs
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'gets all assessment logs with log id',
    })
    @Get('assessment/:visitId')
    async getAssessmentLogs(@Param('id') id: string) {
        return await this.visitService.getAssessmentLogById(id);
    }

    //get most recent visit for a patient
    @ApiParam({
        name: 'patientId',
        type: 'string',
        description: 'gets most recent visit for a patient',
    })
    @Get('recent/:patientId')
    async getMostRecentVisit(@Param('patientId') patientId: string) {
        console.log('patientId', patientId)
        return await this.visitService.getMostRecentVisit(patientId);
    }

    //get most recent visit item
    @ApiParam({
        name: 'patientId',
        type: 'string',
        description: 'gets most recent visit item for a patient',
    })
    @Get('recent/item/:patientId')
    async getMostRecentVisitItem(@Param('patientId') patientId: string) {
        console.log('patientId', patientId)
        return await this.visitService.getMostRecentVisitItem(patientId);
    }

    @Get('mobile/recent/self/visit-item')
    async getMostRecentVisitItemSelf(@Req() req: Request) {
        return await this.visitService.getMostRecentVisitItemSelf(req);
    }

    //end visit
    @ApiParam({
        name: 'visitId',
        type: 'string',
        description: 'end visit with id',
    })
    @Patch('end/:visitId')
    async endVisit(@Param('visitId') visitId: string) {
        return await this.visitService.endVisit(visitId);
    }


    //patient get self most recent visit
    @Get('mobile/self/recent/patient')
    async getPatientMostRecentVisit(@Req() req: Request) {
        return await this.visitService.getPatientMostRecentVisit(req);
    }

    //patient get visits
    @ApiBody({
        type: FilterPatientDto,
        description: 'get all visits by patient id request body',
    })
    @Post('mobile/self/visits')
    async getPatientVisits( @Req() req: Request, @Body() data?: FilterPatientDto) {
        return await this.visitService.getVisitsPatient(req, data);
    }
}