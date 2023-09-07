import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserSchema } from 'src/user/schema/user.schema';
import { WardsModule } from 'src/wards/wards.module';
import { ConsultationEntity, ConsultationSchema } from './schema/consultation.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: ConsultationEntity.name,
        useFactory: () => {
          return ConsultationSchema;
        },
      },
    ]),
    
  ],
  controllers: [],
  providers: [],
})
export class ConsultationModule {}