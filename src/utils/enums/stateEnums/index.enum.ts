import { CameroonStatesEnum } from './cameroon/states.enum';
import { GhanaStatesEnum } from './ghana/states.enum';
import { NigerStatesEnum } from './niger/state.enum';
import { NigerianStatesEnum } from './nigeria/states.enum';
import { TogoStatesEnum } from './togo/states.enum';
import { BeninStatesEnum } from './benin/state.enum';

export const StateEnum = {
  ...NigerianStatesEnum,
  ...CameroonStatesEnum,
  ...TogoStatesEnum,
  ...GhanaStatesEnum,
  ...BeninStatesEnum,
  ...NigerStatesEnum,
};

export type StateEnum =
  | NigerianStatesEnum
  | CameroonStatesEnum
  | TogoStatesEnum
  | GhanaStatesEnum
  | BeninStatesEnum
  | NigerStatesEnum;
