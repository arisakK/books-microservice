import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { nanoid } from 'nanoid'

export type BooksStockDocument = HydratedDocument<BooksStock>

@Schema({ collection: 'books-stock', timestamps: true, versionKey: false })
export class BooksStock {
  @Prop({
    type: String,
    index: true,
    unique: true,
    default: () => nanoid(10),
  })
  objectId?: string

  @Prop({
    type: String,
    index: true,
    unique: true,
    required: true,
  })
  bookId: string

  @Prop({ type: String, index: true, required: true })
  title: string

  @Prop({ type: Number, required: true })
  quantity: number

  @Prop({ type: Number, required: true })
  totalQuantity: number

  @Prop({
    type: Number,
    default: 0,
  })
  quantityBought?: number

  @Prop({ type: Number, default: 0 })
  totalOrder?: number

  @Prop({ type: Date, default: null })
  lastOrderAt?: Date

  @Prop({ type: Date, default: new Date() })
  quantityUpdateAt?: Date

  @Prop({ type: Date, default: new Date() })
  lastStockCheck?: Date

  @Prop({
    type: String,
    default: 'ACTION',
  })
  status?: string
}

export const BooksStockSchema = SchemaFactory.createForClass(BooksStock)
