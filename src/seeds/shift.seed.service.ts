import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShiftDocument, ShiftEntity } from 'src/shifts/schema/shifts.schema';

@Injectable()
export class ShiftSeedsService implements OnModuleInit {
  constructor(

     @InjectModel(ShiftEntity.name)
      private shiftModel: Model<ShiftDocument>,
  ) {}
  async onModuleInit() {
    //we want to create morning, afternoon, night shift and weekend shifts and other shifts 
    try {
         //we want to create morning, afternoon, night shift and weekend shifts and other shifts 
         //we want to check if names Morning shift, Afternoon Shift, Night Shift, Weekend Shift do not exist and then we proceed, if not, do nothing
         const shiftsExist = await this.shiftModel.find({
              name: {
                    $in: ['Morning Shift', 'Afternoon Shift', 'Night Shift', 'Weekend Shift']
                }
            });
            if (shiftsExist.length === 0) {
                const morningShift = await this.shiftModel.create({
                    name: 'Morning Shift',
                    startTime: '08:00',
                    endTime: '16:00',
                })
                const afternoonShift = await this.shiftModel.create({
                    name: 'Afternoon Shift',
                    startTime: '16:00',
                    endTime: '00:00',
                })
                const nightShift = await this.shiftModel.create({
                    name: 'Night Shift',
                    startTime: '00:00',
                    endTime: '08:00',
                })
                const weekendShift = await this.shiftModel.create({
                    name: 'Weekend Shift',
                    startTime: '08:00',
                    endTime: '16:00',
                })
               
                console.log('shifts created', morningShift, afternoonShift, nightShift, weekendShift);
            }


        // const morningShift = new this.shiftModel({
        //     name: 'Morning Shift',
        //     startTime: '08:00',
        //     endTime: '16:00',
        // });
        // await morningShift.save();
        // console.log('Morning Shift created successfully');
        // const afternoonShift = new this.shiftModel({
        //     name: 'Afternoon Shift',
        //     startTime: '16:00',
        //     endTime: '00:00',
        // });
        // await afternoonShift.save();
        // console.log('Afternoon Shift created successfully');
        // const nightShift = new this.shiftModel({
        //     name: 'Night Shift',
        //     startTime: '00:00',
        //     endTime: '08:00',
        // });
        // await nightShift.save();
        // console.log('Night Shift created successfully');
        // const weekendShift = new this.shiftModel({
        //     name: 'Weekend Shift',
        //     startTime: '08:00',
        //     endTime: '16:00',
        // });
        // await weekendShift.save();
        // console.log('Weekend Shift created successfully');
        // const otherShift = new this.shiftModel({
        //     name: 'Other Shift',
        //     startTime: '08:00',
        //     endTime: '16:00',
        // });
        // await otherShift.save();
        // console.log('Other Shift created successfully');
    }
    catch (error) {
        console.log(error)
    }
  }
  

}
