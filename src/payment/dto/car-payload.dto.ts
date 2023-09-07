import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CardPayload {
  @IsString()
  @IsNotEmpty()
  cardno: string;

  @IsString()
  @IsNotEmpty()
  expirymonth: string;

  @IsString()
  @IsNotEmpty()
  expiryyear: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @IsString()
  @IsNotEmpty()
  cvv: string;

  @IsString()
  @IsNotEmpty()
  txRef: string = 'MC-' + Date.now();
}
