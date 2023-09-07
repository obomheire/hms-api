import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  key?: string;

  @IsString()
  @IsOptional()
  otherId?: string;

  @IsString()
  @IsOptional()
  to: string;

  @IsOptional()
  otherFields?: { [key: string]: string | number | boolean | Date };

}
