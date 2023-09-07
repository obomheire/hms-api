import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { CardPayload } from '../dto/car-payload.dto';


@Injectable()
export class CardEncryptionService {
  // private readonly algorithm = process.env.ALGORITHM;
  private readonly algorithm: string = 'aes-256-cbc';

  private readonly key = process.env.SECRET_KEY // Replace with your secret key

  encrypt(cardPayload: CardPayload): string {
    const cardDetails = JSON.stringify(cardPayload);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.key), iv);
    const encrypted = cipher.update(cardDetails);
    const finalBuffer = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${finalBuffer.toString('hex')}`;
  }

  decrypt(encryptedDetails: string): CardPayload {
    const [iv, encrypted] = encryptedDetails.split(':');
    const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.key), Buffer.from(iv, 'hex'));
    const decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
    const finalBuffer = Buffer.concat([decrypted, decipher.final()]);
    const cardDetails = finalBuffer.toString();
    return JSON.parse(cardDetails);
  }
}
