import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';


@Injectable()
export class UploadGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    console.log(req, 'req')

    const isMultipart = req?.isMultipart();
    const file = await req.file();
    if (!isMultipart || !file) {
      throw new BadRequestException(
        'The file you are attempting to upload is invalid',
      );
    }

    // const mime = file.mimetype as string;
    // if (!mime || !mime.startsWith('image/')) {
    //   throw new BadRequestException('You can only upload an image file');
    // }

    req.incomingFile = file;

    return true;
  }
}
