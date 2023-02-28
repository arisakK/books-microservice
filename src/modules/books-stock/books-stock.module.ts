import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { BooksStockMicroservice } from './books-stock.microservice'
import { BooksStockService } from './books-stock.service'

import { DB_CONNECTION_NAME } from '../../constants'
import { models } from '../../mongoose.providers'

@Module({
  imports: [MongooseModule.forFeature(models, DB_CONNECTION_NAME)],
  controllers: [BooksStockMicroservice],
  providers: [BooksStockService],
})
export class BooksStockModule {}
