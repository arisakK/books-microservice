import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model, SortOrder } from 'mongoose'

import { BooksStock, BooksStockDocument } from './books-stock.schema'

import { BooksDocument } from '../books/books.schema'

import { DB_CONNECTION_NAME } from '../../constants'

@Injectable()
export class BooksStockService {
  @InjectModel(BooksStock.name, DB_CONNECTION_NAME)
  private readonly BooksStockModel: Model<BooksStockDocument>

  getModel(): Model<BooksStockDocument> {
    return this.BooksStockModel
  }

  async getByObjectId(objectId: string): Promise<BooksStock> {
    return this.BooksStockModel.findOne({ objectId })
  }

  async getByBookId(bookId: string): Promise<BooksStock> {
    return this.BooksStockModel.findOne({ bookId })
  }

  async getPagination(
    conditions: FilterQuery<BooksStockDocument>,
    pagination?: { page: number; perPage: number },
    sort: { [key: string]: SortOrder } | string = { _id: 1 },
    select = { _id: 0 },
  ): Promise<[BooksStock[], number]> {
    const { page = 1, perPage = 20 } = pagination
    return Promise.all([
      this.BooksStockModel.find(conditions)
        .select(select)
        .sort(sort)
        .skip((page - 1) * +perPage)
        .limit(+perPage)
        .lean(),
      this.BooksStockModel.countDocuments(conditions),
    ])
  }

  async getRunningOut(
    conditions: FilterQuery<BooksDocument>,
    pagination?: { page: number; perPage: number },
    sort: { [key: string]: SortOrder } | string = { _id: 1 },
  ): Promise<[BooksStock[], number]> {
    const { page = 1, perPage = 20 } = pagination

    return Promise.all([
      this.BooksStockModel.find(conditions, { _id: 0 })
        .sort(sort)
        .skip((page - 1) * +perPage)
        .limit(+perPage),
      this.BooksStockModel.countDocuments(conditions),
    ])
  }
}
