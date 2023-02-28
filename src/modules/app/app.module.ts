import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { ThrottlerModule } from '@nestjs/throttler'

import { BooksStockModule } from '../books-stock/books-stock.module'
import { BooksModule } from '../books/books.module'
import { UsersOrderModule } from '../users-order/users-order.module'

import configuration from '../../config/configuration'
import { mongooseModuleAsyncOptions } from '../../mongoose.providers'
import { throttlerAsyncOptions } from '../../throttler.providers'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync(mongooseModuleAsyncOptions),
    ThrottlerModule.forRootAsync(throttlerAsyncOptions),
    BooksModule,
    BooksStockModule,
    UsersOrderModule,
  ],
})
export class AppModule {}
