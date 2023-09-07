// import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// import { Response } from 'express';
// import { FuturexStaffTokenDto, TokenDto } from 'src/auth/dtos/token.dto';

// export const TokenDataDecorator = createParamDecorator(
//   (data: unknown, ctx: ExecutionContext) => {
//     const response: Response = ctx.switchToHttp().getResponse();
//     return response.locals.tokenData as TokenDto;
//   },
// );

// export const FuturexStaffTokenDataDecorator = createParamDecorator(
//   (data: unknown, ctx: ExecutionContext) => {
//     const response: Response = ctx.switchToHttp().getResponse();
//     return response.locals.futurexStaffTokenData as FuturexStaffTokenDto;
//   },
// );
