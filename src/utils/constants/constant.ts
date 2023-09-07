import { randomBytes, createHash } from 'crypto';
import { hostname } from 'os';


export interface IResponse {
  status: number;
  message: string;
  data: any;
}

export const compareDateWithCurrentDate = (date: string) => {
  return new Date(date).toISOString().replace(/T.*/, 'T00:00:00.000Z') ===
  new Date().toISOString().replace(/T.*/, 'T00:00:00.000Z')
};

const host = createHash('md5').update(hostname()).digest('hex').substring(0, 6); // 6 xters
const processId = ('' + process.pid).padStart(3, '0'); 
export const reference = (service = 'SRP', maxLength = 26) => {
  const time = new Date().getTime(); // 13 xters
  const wildcard = randomBytes(256 / 8)
    .toString('hex')
    .substring(0, 6); // 7 xters
  return `${service}-${host}-${processId}-${wildcard}-${time}`
    .substring(0, maxLength - 1)
    .toUpperCase();
};
export type HttpResponse = [boolean, number, string, string, any];
export function isNullOrUndefined(value: any) {
  return value === undefined || value === null;
}
export enum Event {
  LOG_REQUEST = 'LOG_REQUEST',
  LOG_RESPONSE = 'LOG_RESPONSE',
  LOG_ERROR = 'LOG_ERROR',
  LOG_ACTIVITY = 'LOG_ACTIVITY',

  ENTITY_AFTER_LOAD = 'ENTITY_AFTER_LOAD',
  ENTITY_BEFORE_INSERT = 'ENTITY_BEFORE_INSERT',
  ENTITY_AFTER_INSERT = 'ENTITY_AFTER_INSERT',
  ENTITY_BEFORE_UPDATE = 'ENTITY_BEFORE_UPDATE',
  ENTITY_AFTER_UPDATE = 'ENTITY_AFTER_UPDATE',
  ENTITY_BEFORE_REMOVE = 'ENTITY_BEFORE_REMOVE',
  ENTITY_AFTER_REMOVE = 'ENTITY_AFTER_REMOVE',
  ENTITY_BEFORE_TRANSACTION_START = 'ENTITY_BEFORE_TRANSACTION_START',
  ENTITY_AFTER_TRANSACTION_START = 'ENTITY_AFTER_TRANSACTION_START',
  ENTITY_BEFORE_TRANSACTION_COMMIT = 'ENTITY_BEFORE_TRANSACTION_COMMIT',
  ENTITY_AFTER_TRANSACTION_COMMIT = 'ENTITY_AFTER_TRANSACTION_COMMIT',
  ENTITY_BEFORE_TRANSACTION_ROLLBACK = 'ENTITY_BEFORE_TRANSACTION_ROLLBACK',
  ENTITY_AFTER_TRANSACTION_ROLLBACK = 'ENTITY_AFTER_TRANSACTION_ROLLBACK',

  USER_BEFORE_REGISTER = 'USER_BEFORE_REGISTER',
  USER_AFTER_REGISTER = 'USER_AFTER_REGISTER',

  USER_BEFORE_LOGIN = 'USER_BEFORE_LOGIN',
  USER_AFTER_LOGIN = 'USER_AFTER_LOGIN',

  USER_BEFORE_PROFILE_UPDATE = 'USER_BEFORE_PROFILE_UPDATE',
  USER_AFTER_PROFILE_UPDATE = 'USER_AFTER_PROFILE_UPDATE',

  BVN_BEFORE_UPDATE = 'BVN_BEFORE_UPDATE',
  BVN_AFTER_UPDATE = 'BVN_AFTER_UPDATE',

  NEVER_BOUNCE_VERIFY = 'NEVER_BOUNCE_VERIFY',

  BVN_BEFORE_FETCH = 'BVN_BEFORE_FETCH',
  BVN_AFTER_FETCH = 'BVN_AFTER_FETCH',

  ATTEMPT_BOOST = 'ATTEMPT_BOOST',
}


export const getDiffereceInDays = (date1: Date, date2: Date) => {
  const diffInTime = date2.getTime() - date1.getTime();
  return Math.ceil(diffInTime / (1000 * 3600 * 24));
}