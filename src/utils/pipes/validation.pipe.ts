import {
  Injectable,
  PipeTransform,
  UnauthorizedException,
} from '@nestjs/common';
import { ObjectSchema, ArraySchema } from 'joi';

@Injectable()
export class JoiObjectValidationPipe implements PipeTransform {
  constructor(private readonly schema: ObjectSchema) {}
  async transform(data: any): Promise<void> {
    try {
      const value = await this.schema
        .unknown(false)
        .validateAsync(data, { stripUnknown: true });
      return value;
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }
}

@Injectable()
export class JoiArrayValidationPipe implements PipeTransform {
  constructor(private readonly schema: ArraySchema) {}
  async transform(data: any): Promise<void | any[]> {
    try {
      const value = await this.schema.validateAsync(data, {
        stripUnknown: true,
      });
      return value;
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }
}
