import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  async uploadImage(
    filename: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    // Check if the size of the file is more than 3MB
    if (filename.size > 3000000) {
      throw new Error('Please upload a file size not more than 3MB');
    }
    // Check if the file is an image
    if (!filename.mimetype.startsWith('image')) {
      throw new Error('Sorry, this file is not an image, please try again');
    }
    // Upload the file to a folder name profileImage in cloudinary
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        { folder: 'hms/images' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      toStream(filename.buffer).pipe(upload);
    });
  }

  //upload a pdf file
  async uploadPdf(
    filename: Express.Multer.File | any,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    if (filename.size > 3000000) {
      throw new Error('Please upload a file size not more than 3MB');
    }
    // if (!filename.mimetype.startsWith('application/pdf')) {
    //   throw new Error('Sorry, this file is not a pdf, please try again');
    // }
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        { folder: 'hms' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      toStream(filename).pipe(upload);
    });
  }

}
