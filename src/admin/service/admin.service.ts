import { Injectable } from '@nestjs/common';
import { AppointmentsService } from 'src/appointments/service/appointments.service';
import { FilterPatientDto } from 'src/patients/dto/filterPatient.dto';
import { CalendarFilterDto } from 'src/patients/dto/visit.dto';
import { CalendarFilterEnum } from 'src/patients/enum/visit-status.enum';
import { PatientsService } from 'src/patients/service/patients.service';
import { VisitService } from 'src/patients/service/visit.service';
import { UserService } from 'src/user/services/user.service';
import { WardsService } from 'src/wards/service/wards.service';

@Injectable()
export class AdminService {
    constructor (
        private appointmentService: AppointmentsService,
        private userService: UserService,
        private wardsService: WardsService,
        private patientsService: PatientsService,
        private readonly visitService: VisitService,
    ){}

    async getAdminDashboardData(data?: FilterPatientDto,) {
        const appointments = await this.appointmentService.getTotalSpecialistAppointments();
        const staffs = await this.userService.getTotalUsers();
        const wards = await this.wardsService.getBedStatistics();
        const totalWards = await this.wardsService.getTotalWards();
        const patientsCount =
          await this.patientsService.getPatientCount();
        const {mortalityRate, count: mortarlityCount} =  await this.patientsService.getMortality(data)
        // const mortalityRate = (mortarlityCount / patientsCount) * 100;
        const admittedDischargeStat = await this.patientsService.getAdmittedAndOutPatientCount()
        
        return {
          appointments,
          staffs,
          wards,
          patientsCount,
          mortarlityCount,
          mortalityRate,
          admittedDischargeStat,
          totalWards
        };
    }

    async getMortarlityDetails (data?: FilterPatientDto,) {
        return await this.patientsService.getMortality(data)
    }

    async getVisitsAdminCalendar(data?: CalendarFilterEnum){
      return await this.visitService.getVisitsAdminCalendar(data)
    }

    async nurseDashboard() {
      const { totalPatientsSeen, appointments } = await this.appointmentService.getTotalPatientsSeenByAllDoctors();
      const {patients, count: patientCount} = await this.patientsService.getPatientCountForADay();
      const wards = await this.wardsService.getBedStatistics();
      return {
        totalPatientsSeen,
        appointments,
        patients,
        patientCount,
        wards
      }
    }

    async getLogsForWard(wardId: string) {
      const notes = await this.wardsService.getRecentVisits(wardId);
      return notes;
    }
    
}
