import { Controller, InternalServerErrorException } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'

import { BooksStock, BooksStockDocument } from './books-stock.schema'
import { BooksStockService } from './books-stock.service'

import { PayloadUpdateStockInterface } from '../books/interface/payload-update-stock.interface'
import { LoggerService } from '../logger/logger.service'

import { FindOptionsInterface } from '../../interfaces/find-options.interface'
import {
  PaginationInterface,
  PaginationResponseInterface,
} from '../../interfaces/pagination.interface'
import { BOOKS_STOCK } from '../../microservice.constants'

@Controller()
export class BooksStockMicroservice {
  private readonly logger: LoggerService = new LoggerService(
    BooksStockMicroservice.name,
  )

  constructor(private booksStockService: BooksStockService) {}

  @MessagePattern({
    cmd: BOOKS_STOCK,
    method: 'getByObjectId',
  })
  async getByObjectId(@Payload() objectId: string): Promise<BooksStock> {
    try {
      return this.booksStockService.getByObjectId(objectId)
    } catch (e) {
      this.logger.error(
        `catch on getByObjectId: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @MessagePattern({
    cmd: BOOKS_STOCK,
    method: 'getByBookId',
  })
  async getByBookId(@Payload() bookId: string): Promise<BooksStock> {
    try {
      return this.booksStockService.getByBookId(bookId)
    } catch (e) {
      this.logger.error(
        `catch on getByBookId: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @MessagePattern({
    cmd: BOOKS_STOCK,
    method: 'getPagination',
  })
  async getPagination(
    @Payload()
    payload: PaginationInterface & FindOptionsInterface<BooksStockDocument>,
  ): Promise<PaginationResponseInterface<BooksStock>> {
    const { filter, page, perPage, sort } = payload

    try {
      const [records, count] = await this.booksStockService.getPagination(
        filter,
        { page, perPage },
        sort,
      )

      return {
        page,
        perPage,
        count,
        records,
      }
    } catch (e) {
      this.logger.error(
        `catch on getPagination: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @MessagePattern({
    cmd: BOOKS_STOCK,
    method: 'addBookStock',
  })
  async addBookStock(
    @Payload() payload: { bookId: string; title: string; quantity: number },
  ): Promise<void> {
    const { quantity } = payload
    try {
      await this.booksStockService
        .getModel()
        .create({ ...payload, totalQuantity: quantity })
    } catch (e) {
      this.logger.error(
        `catch on addBookStock: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @MessagePattern({
    cmd: BOOKS_STOCK,
    method: 'addQuantity',
  })
  async addQuantity(
    @Payload() payload: { stock: BooksStock; quantity: number },
  ): Promise<void> {
    const { stock, quantity } = payload
    try {
      await this.booksStockService.getModel().updateOne(
        { objectId: stock.objectId },
        {
          quantity: stock.quantity + quantity,
          totalQuantity: stock.totalQuantity + quantity,
          quantityUpdateAt: new Date(),
        },
      )
    } catch (e) {
      this.logger.error(
        `catch on addQuantity: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @MessagePattern({
    cmd: BOOKS_STOCK,
    method: 'getRunningOut',
  })
  async getRunningOut(
    @Payload()
    payload: PaginationInterface & FindOptionsInterface<BooksStockDocument>,
  ): Promise<PaginationResponseInterface<BooksStock>> {
    const { filter, page, perPage, sort } = payload
    try {
      const [records, count] = await this.booksStockService.getRunningOut(
        filter,
        { page, perPage },
        sort,
      )

      return {
        page,
        perPage,
        count,
        records,
      }
    } catch (e) {
      this.logger.error(
        `catch on getRunningOut: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @MessagePattern({
    cmd: BOOKS_STOCK,
    method: 'update-stock',
  })
  async updateBooksStock(
    @Payload() payload: { objectId: string; body: PayloadUpdateStockInterface },
  ): Promise<void> {
    const { objectId, body } = payload
    try {
      await this.booksStockService.getModel().updateOne(
        { objectId },
        {
          quantity: body.quantity,
          quantityBought: body.quantityBought,
          totalOrder: body.totalOrder,
          lastOrderAt: new Date(),
        },
      )
    } catch (e) {
      this.logger.error(
        `catch on updateBooksStock: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }
}
