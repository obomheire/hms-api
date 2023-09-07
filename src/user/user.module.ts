// import { Module } from '@nestjs/common';

// @Module({})
// export class UserModule {}

import { Global, Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserAuthController } from './controller/user.auth.controller';
import { UserEntity, UserSchema } from 'src/user/schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MailsModule } from 'src/providers/mails/mails.module';
import { UserService } from './services/user.service';
import { AuthModule } from 'src/auth/auth.module';
// import { MinioModule } from 'src/minio/minio.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { RoleModule } from 'src/role/role.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: UserEntity.name,
        useFactory: () => {
          return UserSchema;
        },
      },
    ]),
    ConfigModule,
    MailsModule,
    AuthModule,
    CloudinaryModule,
    RoleModule
    // MinioModule
  ],
  providers: [UserService],
  controllers: [UserController, UserAuthController],
  exports: [UserService]
})
export class UserModule {}

