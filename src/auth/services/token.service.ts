import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { envConfig } from 'src/config/constant/env.configuration';
import { TokenDto } from '../dtos/token.dto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokenService {
  constructor(private config: ConfigService) {}
  
  tokenize({
    data,
    expiresIn = this.config.get(envConfig.JWT_LIFESPAN),
  }: {
    data: TokenDto;
    expiresIn?: string;
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      const tokenSecret = this.config.get(envConfig.TOKEN_SECRET);
      jwt.sign(data, tokenSecret, { expiresIn }, (err, decoded) => {
        if (err) reject(new InternalServerErrorException(err));
        resolve(decoded);
      });
    });
  }

  verify(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const tokenSecret = this.config.get(envConfig.TOKEN_SECRET);
      jwt.verify(token, tokenSecret, (err: any, decoded: any) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            throw new UnauthorizedException('Token has expired');
          }
          reject(new UnauthorizedException(err));
        }
        resolve(decoded);
      });
    });
  }

  decode(token: string) {
    return jwt.decode(token, { complete: true });
  }

  /**function that abstract generation of jwt and refresh token */
  async generateTokens(info: TokenDto) {
    const { ID, user, staffId, category, accountStatus } = info;
    // generate jwt
    const authorizationToken = await this.tokenize({
      data: {
        ID,
        user,
        staffId,
        category,
        accountStatus,
      },
      expiresIn: this.config.get(envConfig.JWT_LIFESPAN),
    });
    return { authorizationToken };
  }
  catch(e) {
    Logger.error(e);
    throw new BadRequestException(e.message);
  }
}
