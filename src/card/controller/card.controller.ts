import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { IResponse } from "src/utils/constants/constant";
import { CardDto } from "../dto/card.dto";
import { CardService } from "../service/card.service";

@ApiBearerAuth("Bearer")
@ApiTags('Card')
@Controller('card')
export class CardController {
    constructor(
        private readonly cardService: CardService,
    ) {}


    @ApiBody({
        type: CardDto,
        description: 'creates a card request body',
    })
    @Post()
    async createCard(@Body() body: CardDto): Promise<IResponse> {
        const data = await this.cardService.createCard(body);
        return {
            status: HttpStatus.CREATED,
            message: 'Card created successfully',
            data
        }
    }

    @Get()
    async getCards(@Req() req: Request): Promise<IResponse> {
        const data = await this.cardService.getCards(req.user as unknown as string);
        return {
            status: HttpStatus.OK,
            message: 'Cards retrieved successfully',
            data
        }
    }

    @ApiParam({
        name: 'id',
        type: String,
        description: 'Card id'
    })
    @Get(':id')
    async getCardById(@Req() req: Request, @Param('id') id: string ): Promise<IResponse> {
        const data = await this.cardService.getCardById(id, req.user as unknown as string);
        return {
            status: HttpStatus.OK,
            message: 'Card retrieved successfully',
            data
        }
    }


    @ApiParam({
        name: 'id',
        type: String,
        description: 'Card id'
    })
    @Patch(':id')
    async updateCard(@Param('id') id: string, @Body() body: CardDto): Promise<IResponse> {
        const data = await this.cardService.updateCard(body, id);
        return {
            status: HttpStatus.OK,
            message: 'Card updated successfully',
            data
        }
    }

    @ApiParam({
        name: 'id',
        type: String,
        description: 'Card id'
    })
    @Delete(':id')
    async deleteCard(@Param('id') id: string): Promise<IResponse> {
        const data = await this.cardService.deleteCard(id);
        return {
            status: HttpStatus.OK,
            message: 'Card deleted successfully',
            data
        }
    }

}