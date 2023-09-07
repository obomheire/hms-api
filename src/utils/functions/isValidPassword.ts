import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

export const isValidPassword = async (password: string, hash: string) => {
  try {
    const result = await bcrypt.compare(password, hash);
    if (!result) {
      return false;
    }
    return true;
  } catch (e) {
    throw new InternalServerErrorException(e.message);
  }
};
