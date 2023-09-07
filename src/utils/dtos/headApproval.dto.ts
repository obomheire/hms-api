import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { headApprovalEnum } from '../enums/requisitionStatus';

export class headApprovalDto {
  @ApiProperty({ enum: headApprovalEnum, example: headApprovalEnum.PENDING, default: headApprovalEnum.PENDING })
  headApprovalEnum: headApprovalEnum;
  @IsEnum(headApprovalEnum)
  headApproval: headApprovalEnum;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  headApprovalComment: string;
}
