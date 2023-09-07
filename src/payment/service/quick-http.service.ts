import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService as NestHttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { concatMap, delay, retryWhen } from 'rxjs/operators';
import { lastValueFrom, of, throwError } from 'rxjs';
import { Method } from 'axios';
import { HttpResponse, isNullOrUndefined, Event } from 'src/utils/constants/constant';

@Injectable()
export class QuickHttpService {
  readonly retryCount = 0;
  readonly retryWait = 1000;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: NestHttpService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async request(
    url: string,
    method: string,
    data: any,
    params: any = null,
    headers: any = { 'content-type': 'application/json' },
  ): Promise<HttpResponse> {
    try {
      const $ = this.httpService
        .request({
          method: method as Method,
          url,
          ...(method === 'get' || isNullOrUndefined(data) ? {} : { data }),
          params,
          headers,
        })
        .pipe(
          // things don't always work as planned
          // if things go wrong, try again x times
          // however, delay trial in an incremental manner (multiples of 1 second)
          retryWhen((error) => {
            return error.pipe(
              concatMap((error, count) => {
                if (count < this.retryCount) {
                  return of(error);
                }
                return throwError(() => error);
              }),
              delay(this.retryWait),
            );
          }),
        );

      const response = await lastValueFrom($);

      if (response.status < 200 || response.status > 299) {
        return [
          false,
          response.status,
          response.statusText,
          null,
          response.data,
        ];
      }
      return [true, response.status, response.statusText, null, response.data];
    } catch (exception) {
      if (exception?.response?.data) {
        const response = exception?.response;

        return [
          false,
          response.status,
          response.statusText,
          null,
          response.data,
        ];
      }

      this.eventEmitter.emit(Event.LOG_ERROR, exception);

      return [
        false,
        503,
        'Service is Down',
        'One of our service is temporary down. We are on it, it would be back soon.',
        null,
      ];
    }
  }
}
