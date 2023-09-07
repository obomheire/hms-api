import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Request, Response, NextFunction } from 'express';
import { ProductOrderService } from "../service/product-order.service";

@Injectable()
export class UpdateProductOrderGuard implements CanActivate {
  constructor(private readonly productOrderService: ProductOrderService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const id = request.params.id;
    console.log(id, 'id')

    const response: Response = context.switchToHttp().getResponse();
    const token = response.locals.token

    if (!id) {
      throw new ForbiddenException(' order ID is required');
    }

    const order = await this.productOrderService.findOne(id);

    if (!order) {
      throw new ForbiddenException('order does not exist');
    }

    if(order.patient.toString() !== token.toString()){
        throw new ForbiddenException('you cant access this order');
    }

    return true;
  }
}
