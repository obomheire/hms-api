import * as Joi from 'joi';
export const emailValidator = Joi.string().email().allow('', null);
