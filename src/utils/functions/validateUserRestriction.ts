// import { UnauthorizedException } from '@nestjs/common';
// import { TokenDto } from 'src/auth/dtos/token.dto';
// import { RoleRestrictionEnum } from '../enums/roleRestriction.enum';

// /**
//  * This function run a check if a user authorized to login to a particular portal.
//  * and their restrictions.
//  * @param tokenData This is the token generated when user logs in
//  */
// export const validateUserRestriction = (staffResult, staff) => {
//   if (
//     !staffResult.stateRole &&
//     staff.restriction === RoleRestrictionEnum.State
//   ) {
//     throw new UnauthorizedException(
//       'you are not authorized to login to a state portal. Please contact your administrator',
//     );
//   } else if (
//     !staffResult.districtRole &&
//     staff.restriction === RoleRestrictionEnum.District
//   ) {
//     throw new UnauthorizedException(
//       'you are not authorized to login to a district portal. Please contact your administrator',
//     );
//   } else if (
//     !staffResult.schoolRole &&
//     staff.restriction === RoleRestrictionEnum.School
//   ) {
//     throw new UnauthorizedException(
//       'you are not authorized to login to a school portal. Please contact your administrator',
//     );
//   }
// };
