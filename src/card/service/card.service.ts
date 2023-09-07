import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CardDocument, CardEntity } from "../schema/card.schema";

@Injectable()
export class CardService {
    constructor(
        @InjectModel(CardEntity.name) private readonly cardModel: Model<CardDocument>,
    ) {}

    async createCard(card: Partial<CardEntity>): Promise<CardDocument> {
        const newCard = new this.cardModel(card);
        return await newCard.save();
    }

    async getCards(user: string): Promise<CardDocument[]> {
        return await this.cardModel.find({ user }).exec();
    }

    async getCardById(id: string, user: string): Promise<CardDocument> {
        return await this.cardModel.findOne({ _id: id, user }).exec();
    }

    async updateCard(card: Partial<CardEntity>, id: string): Promise<CardDocument> {
        return await this.cardModel.findByIdAndUpdate(id, card, { new: true });
    }

    async deleteCard(id: string): Promise<CardDocument> {
        return await this.cardModel.findByIdAndDelete(id);
    }
}