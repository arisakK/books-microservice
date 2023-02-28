import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import dayjs from 'dayjs'
import {
  Aggregate,
  FilterQuery,
  Model,
  PipelineStage,
  SortOrder,
} from 'mongoose'

import { UsersOrder, UsersOrderDocument } from './users-order.schema'

import { DB_CONNECTION_NAME } from '../../constants'

@Injectable()
export class UsersOrderService {
  @InjectModel(UsersOrder.name, DB_CONNECTION_NAME)
  private readonly usersOrderModel: Model<UsersOrderDocument>

  getModel(): Model<UsersOrderDocument> {
    return this.usersOrderModel
  }

  async getPagination(
    conditions: FilterQuery<UsersOrderDocument>,
    pagination?: { page: number; perPage: number },
    sort: { [key: string]: SortOrder } | string = { _id: 1 },
    select = {},
  ): Promise<[UsersOrder[], number]> {
    const { page = 1, perPage = 20 } = pagination

    return Promise.all([
      this.usersOrderModel
        .find(conditions)
        .select(select)
        .sort(sort)
        .skip((page - 1) * +perPage)
        .limit(+perPage)
        .lean(),
      this.usersOrderModel.countDocuments(conditions),
    ])
  }

  async getHistoryByOrder(
    objectId: string,
    pagination?: { page: number; perPage: number },
  ): Promise<Aggregate<any[]>> {
    const { page, perPage } = pagination
    const pipeline: PipelineStage[] = [
      {
        $match: { userId: objectId },
      },
      {
        $lookup: {
          from: 'books-stock',
          localField: 'bookStockId',
          foreignField: 'objectId',
          as: 'bookStock',
        },
      },
      {
        $unwind: '$bookStock',
      },
      {
        $lookup: {
          from: 'books',
          localField: 'bookStock.bookId',
          foreignField: 'objectId',
          as: 'book',
        },
      },
      {
        $unwind: '$book',
      },
      {
        $project: {
          _id: 0,
          title: '$book.title',
          genre: '$book.genre',
          quantity: '$quantity',
          total: '$totalPrice',
          buyAt: '$createdAt',
        },
      },
      {
        $sort: { buyAt: -1 },
      },
      {
        $skip: (page - 1) * +perPage,
      },
      {
        $limit: +perPage,
      },
    ]

    return this.usersOrderModel.aggregate(pipeline)
  }

  async countHistoryByOrder(
    objectId: string,
    pagination?: { page: number; perPage: number },
  ): Promise<number> {
    return (await this.getHistoryByOrder(objectId, pagination)).length
  }

  async getOrderByGenre(): Promise<Aggregate<any[]>> {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'books-stock',
          localField: 'bookStockId',
          foreignField: 'objectId',
          as: 'bookStock',
        },
      },
      {
        $unwind: '$bookStock',
      },
      {
        $lookup: {
          from: 'books',
          localField: 'bookStock.bookId',
          foreignField: 'objectId',
          as: 'book',
        },
      },
      {
        $unwind: '$book',
      },
      {
        $group: {
          _id: '$book.genre',
          quantity: { $sum: '$quantity' },
          total: { $sum: '$total' },
          books: {
            $addToSet: {
              title: '$book.title',
              price: '$book.price',
            },
          },
        },
      },
      { $project: { _id: 0, genre: '$_id', quantity: 1, total: 1, books: 1 } },
    ]
    return this.usersOrderModel.aggregate(pipeline)
  }

  async getTopUserBought(pagination?: {
    page: number
    perPage: number
  }): Promise<Aggregate<any[]>> {
    const { page, perPage } = pagination
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'books-stock',
          localField: 'bookStockId',
          foreignField: 'objectId',
          as: 'bookStock',
        },
      },
      {
        $unwind: '$bookStock',
      },
      {
        $lookup: {
          from: 'books',
          localField: 'bookStock.bookId',
          foreignField: 'objectId',
          as: 'book',
        },
      },
      { $unwind: '$book' },
      {
        $group: {
          _id: {
            genre: '$book.genre',
            userId: '$userId',
            bookId: '$book.objectId',
            title: '$book.title',
          },
          imageUrl: { $first: '$book.imageUrl' },
          price: { $first: '$book.price' },
          totalPrice: { $sum: '$totalPrice' },
          quantity: { $sum: '$quantity' },
        },
      },
      {
        $group: {
          _id: {
            genre: '$_id.genre',
            userId: '$_id.userId',
          },
          quantity: { $sum: '$quantity' },
          totalPrice: { $sum: '$totalPrice' },
          books: {
            $addToSet: {
              bookId: '$_id.bookId',
              title: '$_id.title',
              imageUrl: '$imageUrl',
              price: '$price',
              totalPrice: '$totalPrice',
              quantity: '$quantity',
            },
          },
        },
      },
      {
        $group: {
          _id: '$_id.userId',
          totalPrice: { $sum: '$totalPrice' },
          quantity: { $sum: '$quantity' },
          books: {
            $addToSet: {
              genre: '$_id.genre',
              books: '$books',
            },
          },
        },
      },
      {
        $project: {
          userId: '$_id',
          totalPrice: 1,
          quantity: 1,
          books: 1,
          _id: 0,
        },
      },
      { $sort: { quantity: -1 } },
      {
        $skip: (page - 1) * +perPage,
      },
      {
        $limit: +perPage,
      },
    ]
    return this.usersOrderModel.aggregate(pipeline)
  }

  async countGetTopUserBought(pagination?: {
    page: number
    perPage: number
  }): Promise<number> {
    return (await this.getTopUserBought(pagination)).length
  }

  async getUserOrder(pagination?: {
    page: number
    perPage: number
  }): Promise<Aggregate<any[]>> {
    const { page, perPage } = pagination
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'books-stock',
          localField: 'bookStockId',
          foreignField: 'objectId',
          as: 'bookStock',
        },
      },
      {
        $unwind: '$bookStock',
      },
      {
        $lookup: {
          from: 'books',
          localField: 'bookStock.bookId',
          foreignField: 'objectId',
          as: 'book',
        },
      },
      { $unwind: '$book' },
      {
        $group: {
          _id: {
            userId: '$userId',
            bookId: '$book.objectId',
            title: '$book.title',
          },
          genre: { $first: '$book.genre' },
          imageUrl: { $first: '$book.imageUrl' },
          price: { $first: '$book.price' },
          totalPrice: { $sum: '$totalPrice' },
          quantity: { $sum: '$quantity' },
        },
      },
      {
        $group: {
          _id: '$_id.userId',
          quantity: { $sum: '$quantity' },
          totalPrice: { $sum: '$totalPrice' },
          books: {
            $addToSet: {
              genre: '$genre',
              bookId: '$_id.bookId',
              title: '$_id.title',
              imageUrl: '$imageUrl',
              price: '$price',
              totalPrice: '$totalPrice',
              quantity: '$quantity',
            },
          },
        },
      },
      {
        $project: {
          userId: '$_id',
          totalPrice: 1,
          quantity: 1,
          books: 1,
          _id: 0,
        },
      },
      { $sort: { quantity: -1 } },
      {
        $skip: (page - 1) * +perPage,
      },
      {
        $limit: +perPage,
      },
    ]
    return this.usersOrderModel.aggregate(pipeline)
  }

  async countGetUserOrder(pagination?: {
    page: number
    perPage: number
  }): Promise<number> {
    return (await this.getUserOrder(pagination)).length
  }

  async getReportByWeek(): Promise<Aggregate<any[]>> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          createdAt: {
            $gte: dayjs().subtract(7, 'days').toDate(),
            $lt: dayjs().add(1, 'days').toDate(),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%d/%m/%Y', date: '$createdAt' } },
          totalPrice: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
      {
        $project: { date: '$_id', totalPrice: 1, count: 1, _id: 0 },
      },
    ]
    return this.usersOrderModel.aggregate(pipeline)
  }

  async topSeller(): Promise<Aggregate<any[]>> {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'books-stock',
          localField: 'bookStockId',
          foreignField: 'objectId',
          as: 'bookStock',
        },
      },
      {
        $unwind: '$bookStock',
      },
      {
        $lookup: {
          from: 'books',
          localField: 'bookStock.bookId',
          foreignField: 'objectId',
          as: 'book',
        },
      },
      {
        $unwind: '$book',
      },
      {
        $group: {
          _id: '$book.title',
          genre: { $first: '$book.genre' },
          objectId: { $first: '$book.objectId' },
          quantity: { $sum: '$quantity' },
        },
      },
      {
        $project: {
          _id: 0,
          title: '$_id',
          quantity: 1,
          genre: 1,
          BookId: '$objectId',
        },
      },
      {
        $sort: { quantity: -1 },
      },
      { $limit: 10 },
    ]
    return this.usersOrderModel.aggregate(pipeline)
  }

  async topSellerByGenre(): Promise<Aggregate<any[]>> {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'books-stock',
          localField: 'bookStockId',
          foreignField: 'objectId',
          as: 'bookStock',
        },
      },
      {
        $unwind: '$bookStock',
      },
      {
        $lookup: {
          from: 'books',
          localField: 'bookStock.bookId',
          foreignField: 'objectId',
          as: 'book',
        },
      },
      {
        $unwind: '$book',
      },
      {
        $group: {
          _id: {
            genre: '$book.genre',
            id: '$book.title',
            objectId: '$book.objectId',
          },
          imageUrl: { $first: '$book.imageUrl' },
          price: { $first: '$book.price' },
          quantity: { $sum: '$quantity' },
        },
      },
      {
        $group: {
          _id: '$_id.genre',
          topSeller: {
            $addToSet: {
              bookId: '$_id.objectId',
              title: '$_id.id',
              imageUrl: '$imageUrl',
              price: '$price',
              quantity: '$quantity',
            },
          },
        },
      },
      {
        $project: {
          topSeller: {
            $sortArray: { input: '$topSeller', sortBy: { quantity: -1 } },
          },
        },
      },
      {
        $project: {
          _id: 0,
          genre: '$_id',
          topSeller: {
            $slice: ['$topSeller', 0, 9],
          },
        },
      },
    ]
    return this.usersOrderModel.aggregate(pipeline)
  }
}
