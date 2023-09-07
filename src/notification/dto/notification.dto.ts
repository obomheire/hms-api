import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { NotificationType } from "../enum/notification.enum";

export class NotificationDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @IsOptional()
    key?: string;

    @IsEnum(NotificationType)
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsOptional()
    message: string;
}