import { AccountStatusEnum } from 'src/utils/enums/accountStatus.enum';
import { ApplicationPermissions } from 'src/utils/enums/permissions.enum';

export class TokenDto {
  ID?: string;
  user: string;
  staffId?: string;
  id?: string;
  category?: string;
  email?: string
  accountStatus?: AccountStatusEnum;
}
