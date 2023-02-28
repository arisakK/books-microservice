import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose'

import { DB_CONNECTION_NAME } from './constants'
import {
  BooksStock,
  BooksStockSchema,
} from './modules/books-stock/books-stock.schema'
import { Books, BooksSchema } from './modules/books/books.schema'
import {
  UsersOrder,
  UsersOrderSchema,
} from './modules/users-order/users-order.schema'

export const models = [
  {
    name: Books.name,
    schema: BooksSchema,
  },
  {
    name: BooksStock.name,
    schema: BooksStockSchema,
  },
  {
    name: UsersOrder.name,
    schema: UsersOrderSchema,
  },
]

export const mongooseModuleAsyncOptions: MongooseModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  connectionName: DB_CONNECTION_NAME,
  useFactory: async (configService: ConfigService) => {
    return {
      uri: configService.get<string>('database.host'),
      ...configService.get<any>('database.options'),
    } as MongooseModuleAsyncOptions
  },
}
