import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model, SortOrder } from 'mongoose'

import { Books, BooksDocument } from './books.schema'

import { DB_CONNECTION_NAME } from '../../constants'

@Injectable()
export class BooksService {
  @InjectModel(Books.name, DB_CONNECTION_NAME)
  private readonly booksModel: Model<BooksDocument>

  getModel(): Model<BooksDocument> {
    return this.booksModel
  }

  async getByObjectId(objectId: string): Promise<Books> {
    return this.booksModel.findOne({ objectId }, { _id: 0 })
  }

  async getByTitle(title: string): Promise<Books> {
    return this.booksModel.findOne({ title }, { _id: 0 })
  }

  async getPagination(
    conditions: FilterQuery<BooksDocument>,
    pagination?: { page: number; perPage: number },
    sort: { [key: string]: SortOrder } | string = { _id: 1 },
    select = { _id: 0 },
  ): Promise<[Books[], number]> {
    const { page = 1, perPage = 20 } = pagination

    return Promise.all([
      this.booksModel
        .find(conditions)
        .select(select)
        .sort(sort)
        .skip((page - 1) * +perPage)
        .limit(+perPage)
        .lean(),
      this.booksModel.countDocuments(conditions),
    ])
  }
}
