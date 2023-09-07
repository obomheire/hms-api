import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CardController } from './controller/card.controller';
import { CardEntity, CardSchema } from './schema/card.schema';
import { CardService } from './service/card.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: CardEntity.name,
        useFactory: () => {
          return CardSchema;
        },
      },
    ]),
  ],
  providers: [CardService],
  controllers: [CardController],
})
export class CardModule {}
