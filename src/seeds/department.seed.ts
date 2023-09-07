// import { Command } from 'nestjs-command';
// import { Injectable, OnModuleInit } from '@nestjs/common';

// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { DepartmentDocument, DepartmentEntity } from 'src/department/schema/department.schema';

// @Injectable()
// export class DepartmentSeed {
//   constructor(
//     @InjectModel(DepartmentEntity.name)
//     private departmentModel: Model<DepartmentDocument>,
//   ) {}

//     @Command({
//         command: 'seed:department',
//         describe: 'seed department',
//     })
//     async create() {
//         //create a general outpatient department
//         try {

//             const generalOutpatientDepartment = new this.departmentModel({
//                 name: 'General Outpatient Department',
//             });
//             await generalOutpatientDepartment.save();
//             console.log('General Outpatient Department created successfully');
//         } catch (error) {
//             console.log(error);
//         }
//     }
// }