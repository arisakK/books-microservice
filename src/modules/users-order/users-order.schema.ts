import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type UsersOrderDocument = HydratedDocument<UsersOrder>

@Schema({ collection: 'users-order', timestamps: true, versionKey: false })
export class UsersOrder {
  @Prop({
    type: String,
    index: true,
    required: true,
  })
  userId: string

  @Prop({
    type: String,
    index: true,
    required: true,
  })
  bookStockId: string

  @Prop({
    type: Number,
    required: true,
  })
  quantity: number

  @Prop({
    type: Number,
    required: true,
  })
  totalPrice: number

  @Prop({
    type: Number,
    required: true,
  })
  includingVat: number
}

export const UsersOrderSchema = SchemaFactory.createForClass(UsersOrder)
