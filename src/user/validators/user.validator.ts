import * as Joi from 'joi';

export const loginValidator = Joi.object({
  email: Joi.string().trim().required().messages({
    'string.base': `"name" should be a type of 'text'`,
    'any.required': `"name" is a required field`,
  }),
  password: Joi.string()
    .trim()
    .min(8)
    // .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .required()
    // .messages({
    //   'string.base': `"password" should be a type of 'text'`,
    //   'any.required': `"password" is a required`,
    //   'string.pattern.base':
    //     'Password must be minimum of 8 characters, contain an uppercase letter, a number and a special character',
    // }),
});

// export const createUserValidator = Joi.object({
//   username: Joi.string().required(),
//   password: Joi.string()
//     .trim()
//     .min(8)
//     .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
//     .required()
//     .messages({
//       'string.base': `"password" should be a type of 'text'`,
//       'any.required': `"password" is a required`,
//       'string.pattern.base':
//         'Password must be minimum of 8 characters, contain an uppercase letter, a number and a special character',
//     }),
//   email: Joi.string().trim().email().required().messages({
//     'string.base': `"email" should be a type of 'text'`,
//     'any.required': `"email" is a required field`,
//   }),
//   role: Joi.string()
//     .valid(...Object.values(RoleTypeEnum))
//     .required(),
//   company: Joi.string()
//     .valid(...Object.values(CompanyEnum))
//     .required(),
// });

// export const userSearchValidator = Joi.object({
//   limit: Joi.number().default(1),
//   page: Joi.number().default(1),
//   id: Joi.array().items(Joi.string()).allow(null),
//   username: Joi.array().items(Joi.string()),
//   email: Joi.array().items(
//     Joi.string().trim().email().messages({
//       'string.base': `"email" should be a type of 'text'`,
//       'any.required': `"email" is a required field`,
//     }),
//   ),
// });
