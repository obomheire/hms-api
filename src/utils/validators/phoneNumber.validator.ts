import * as Joi from 'joi';
import { CountryCodeEnum } from '../enums/countryCodes.enum';
import { PhoneNumberSchema } from '../schemas/phoneNumber.schema';

export const phoneNUmberValidator = Joi.object({
  code: Joi.string()
    .valid(...Object.values(CountryCodeEnum))
    .required(),
  number: Joi.when('code', {
    is: CountryCodeEnum.Nigeria,
    then: Joi.string()
      .min(10)
      .max(10)
      .regex(/^[0-9]{10}$/)
      .messages({
        'string.pattern.base': `Phone number must have 10 digits. Kindly check if a character(s) is included`,
      })
      .required(),
  }),
  local: Joi.string(),
}).custom((value: PhoneNumberSchema) => {
  switch (value.code) {
    case CountryCodeEnum.Nigeria:
      value.local = `0${value.number}`;
      break;
    default:
      value.local = `0`;
    // TODO: don't add a default to explicitly define the format for each supported countries phone number
  }
  return value;
});
