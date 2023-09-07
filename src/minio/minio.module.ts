import { Global, Module } from '@nestjs/common';
import { MinioService } from './service/minio.service';

@Global()
@Module({
  controllers: [],
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}
