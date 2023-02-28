import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { nanoid } from 'nanoid'

import EGenre from './enum/genre.enum'

export type BooksDocument = HydratedDocument<Books>

@Schema({ collection: 'books', timestamps: true, versionKey: false })
export class Books {
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
  title: string

  @Prop({
    type: String,
    required: true,
  })
  descr: string

  @Prop({
    type: String,
    required: true,
  })
  author: string

  @Prop({
    enum: EGenre,
    required: true,
  })
  genre: EGenre

  @Prop({
    type: String,
    required: true,
  })
  publisher: string

  @Prop({
    type: Number,
    required: true,
  })
  price: number

  @Prop({
    type: String,
    default: null,
  })
  imageUrl?: string

  @Prop({
    type: String,
    default: 'ACTION',
  })
  status?: string
}

export const BooksSchema = SchemaFactory.createForClass(Books)
