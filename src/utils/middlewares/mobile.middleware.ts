import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Response, Request } from "express";

@Injectable()
export class MobileMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    if (req.url.includes('/*/mobile') && !req.url.includes('mobile')) {
      throw new UnauthorizedException(
        'you are not authorized to access this route',
      );
    }

    next();
  }
}