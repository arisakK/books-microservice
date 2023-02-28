import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { BooksMicroservice } from './books.microservice'
import { BooksService } from './books.service'

import { BooksStockService } from '../books-stock/books-stock.service'

import { DB_CONNECTION_NAME } from '../../constants'
import { models } from '../../mongoose.providers'

@Module({
  imports: [MongooseModule.forFeature(models, DB_CONNECTION_NAME)],
  controllers: [BooksMicroservice],
  providers: [BooksService, BooksStockService],
})
export class BooksModule {}
