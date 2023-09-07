import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MultipartFile } from '@fastify/multipart';
import * as Minio from 'minio';
import sharp from 'sharp';

@Injectable()
export class MinioService {
  private client: Minio.Client;
  private readonly logger = new Logger('Minio');
  constructor(private readonly confgiService: ConfigService) {
    this.client = new Minio.Client({
      endPoint: 'play.min.io',
      port:9000,
      useSSL: true,
      accessKey: 'Q3AM3UQ867SPQQA43P2F',
      secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG',
    });
  }

  async put(
    file: MultipartFile,
    bucketName: string,
    objectName: string,
  ): Promise<[boolean, string, string, any]> {
    // console.log(file)
    const name = file.filename;
    const [extension, ...others] = name.split('.').reverse();
    let result = {};
    let fileBuffer = await file.toBuffer();
    try {
      const isImage = await this.checkFile(fileBuffer);
      this.logger.log(isImage, 'isImage');
      if (isImage === true)
      console.log('hello')
        fileBuffer = await this.resizeAndCompressImage(fileBuffer);
        console.log(fileBuffer, 'fileBuffer')
        console.log(this.client, 'this.client')
        
      const result = await this.client.putObject(
        bucketName,
        `${objectName}.${extension}`,
        fileBuffer,
      );
      console.log(result, 'result')
    } catch (error) {
      this.logger.log({ error });
      return [false, 'Upload', 'Upload failed', null];
    }

    return [
      true,
      'Upload',
      'Upload successful',
      {
        ...result,
        bucketName,
        objectName: `${objectName}.${extension}`,
        size: Buffer.byteLength(fileBuffer),
      },
    ];
  }


  async get(bucketName: string, objectName: string) {
    return this.client.getObject(bucketName, objectName);
  }

  async checkFile(file: Buffer): Promise<boolean> {
    // Check if the image is an image by inspecting the header
    const isImage = await sharp(file)
      .metadata()
      .then((metadata) => metadata.format !== null)
      .catch(() => false);
    return isImage ? true : false;
  }

  async resizeAndCompressImage(imageBuffer: Buffer): Promise<Buffer> {
    // const MAX_BUFFER_SIZE = 1024 * 1024; //1mb

    // this.logger.log({
    //   maxsize: MAX_BUFFER_SIZE,
    //   imgSize: imageBuffer.byteLength,
    // });

    // if (imageBuffer.byteLength < MAX_BUFFER_SIZE) return imageBuffer;

    // Resize and compress the image
    const resizedImage = await sharp(imageBuffer)
      .resize({ width: 1000, height: 1000, fit: sharp.fit.inside })
      .jpeg({ quality: 80, force: false })
      .toBuffer();
    // this.logger.log('resized file');
    // if (resizedImage.length > 1024 * 1024) {
    //   throw new Error('The file uploaded is too large');
    // }
    console.log(resizedImage, 'resizedImage')

    return resizedImage;
  }
}
