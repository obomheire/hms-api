// import {
//   BadRequestException,
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   InternalServerErrorException,
//   NotFoundException,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { Response } from 'express';
// import { TokenDto } from 'src/auth/dtos/token.dto';
// @Injectable()
// export class CanPerformAction implements CanActivate {
//   constructor(private reflector: Reflector) {}
//   async canActivate(context: ExecutionContext) {
//     const requiredPermissions = this.reflector.get<string[]>(
//       'permissions',
//       context.getHandler(),
//     );
//     if (!requiredPermissions) return true;
//     try {
//       const response: Response = context.switchToHttp().getResponse();
//       const tokenData: TokenDto = response.locals.tokenData;
//       if (!tokenData) {
//         throw new NotFoundException('authorization header not specified');
//       }
//       if (!tokenData.permissions) {
//         throw new NotFoundException('staffs permissions not found');
//       }
//       const tokenDataPermissions: string[] = tokenData.permissions;
//       const hasPermission = tokenDataPermissions.some((p) =>
//         requiredPermissions.includes(p),
//       );
//       if (!hasPermission) {
//         throw new UnauthorizedException(
//           'you are not authorized to perform this action',
//         );
//       }
//       return true;
//     } catch (e) {
//       throw new BadRequestException(e.message);
//     }
//   }
// }
