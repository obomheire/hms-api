import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { TestService } from "src/laboratory/service/test.service";

@Injectable()
export class GeBookingGuard implements CanActivate {
  constructor(private readonly testService: TestService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const id = request.params.testId;
    console.log(id, 'id')

    if (!id) {
      throw new ForbiddenException(' Test ID is required');
    }

    const account = await this.testService.getTest(id);

    if (!account) {
      throw new ForbiddenException('Test does not exist');
    }

    return true;
  }
}
