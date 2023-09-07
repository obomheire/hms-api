import { NigerianLocalGovernmentsEnum } from './nigeria/localGovernments.enum';
import { CameroonLocalGovernmentsEnum } from './cameroon/localGovernments.enum';
import { TogoLocalGovernmentsEnum } from './togo/localGovernments.enum';
import { GhanaLocalGovernmentsEnum } from './ghana/localgovernement.Eum';
import { BeninLocalGovernmentsEnum } from './benin/localGovernments.enum';
import { NigerienLocalGovernmentEnum } from './niger/localgovernment.enum';

export const LocalGovernmentsEnum = Object.assign(
  {},
  NigerianLocalGovernmentsEnum,
  CameroonLocalGovernmentsEnum,
  TogoLocalGovernmentsEnum,
  GhanaLocalGovernmentsEnum,
  BeninLocalGovernmentsEnum,
  NigerienLocalGovernmentEnum,
);

export type LocalGovernmentsEnum =
  | NigerianLocalGovernmentsEnum
  | CameroonLocalGovernmentsEnum
  | TogoLocalGovernmentsEnum
  | GhanaLocalGovernmentsEnum
  | BeninLocalGovernmentsEnum
  | NigerienLocalGovernmentEnum;
