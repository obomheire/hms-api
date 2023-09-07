import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const File = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req?.incomingFile;
  },
);
