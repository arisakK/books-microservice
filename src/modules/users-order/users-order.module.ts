import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { UsersOrderMicroservice } from './users-order.microservice'
import { UsersOrderService } from './users-order.service'

import { DB_CONNECTION_NAME } from '../../constants'
import { models } from '../../mongoose.providers'

@Module({
  imports: [MongooseModule.forFeature(models, DB_CONNECTION_NAME)],
  controllers: [UsersOrderMicroservice],
  providers: [UsersOrderService],
})
export class UsersOrderModule {}
