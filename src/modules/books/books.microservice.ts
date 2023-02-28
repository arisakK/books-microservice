import { Controller, InternalServerErrorException } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'

import { Books, BooksDocument } from './books.schema'
import { BooksService } from './books.service'
import { PayloadBooksAddInterface } from './interface/payload-books-add.interface'
import { PayloadBooksUpdateInterface } from './interface/payload-books-update.interface'
import { PayloadCreateInStockInterface } from './interface/payload-create-in-stock.interface'

import { BooksStockService } from '../books-stock/books-stock.service'
import { LoggerService } from '../logger/logger.service'

import { FindOptionsInterface } from '../../interfaces/find-options.interface'
import {
  PaginationInterface,
  PaginationResponseInterface,
} from '../../interfaces/pagination.interface'
import { BOOKS } from '../../microservice.constants'

@Controller()
export class BooksMicroservice {
  private readonly logger: LoggerService = new LoggerService(
    BooksMicroservice.name,
  )

  constructor(
    private readonly booksService: BooksService,
    private readonly booksStockService: BooksStockService,
  ) {}

  @MessagePattern({
    cmd: BOOKS,
    method: 'getByObjectId',
  })
  async getByObjectId(@Payload() objectId: string): Promise<Books> {
    try {
      return this.booksService.getByObjectId(objectId)
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
    cmd: BOOKS,
    method: 'getByTitle',
  })
  async getByTitle(@Payload() title: string): Promise<Books> {
    try {
      return this.booksService.getByTitle(title)
    } catch (e) {
      this.logger.error(
        `catch on getByTitle: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @MessagePattern({
    cmd: BOOKS,
    method: 'create',
  })
  async createBooks(
    @Payload() payload: PayloadBooksAddInterface,
  ): Promise<void> {
    try {
      await this.booksService.getModel().create(payload)
    } catch (e) {
      this.logger.error(`catch on create: ${e?.message ?? JSON.stringify(e)}`)
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @MessagePattern({
    cmd: BOOKS,
    method: 'create-in-stock',
  })
  async createInStock(
    @Payload() payload: PayloadCreateInStockInterface,
  ): Promise<void> {
    let book: Books
    try {
      book = await this.booksService.getModel().create(payload)
    } catch (e) {
      this.logger.error(
        `catch on create-in-stock: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }

    try {
      await this.booksStockService.getModel().create({
        ...payload,
        bookId: book.objectId,
        totalQuantity: payload.quantity,
      })
    } catch (e) {
      this.logger.error(
        `catch on create-in-stock: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @MessagePattern({
    cmd: BOOKS,
    method: 'getPagination',
  })
  async getPagination(
    @Payload()
    payload: PaginationInterface & FindOptionsInterface<BooksDocument>,
  ): Promise<PaginationResponseInterface<Books>> {
    const { filter, page, perPage, sort } = payload

    try {
      const [records, count] = await this.booksService.getPagination(
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
    cmd: BOOKS,
    method: 'update',
  })
  async updateBooks(
    @Payload() payload: { objectId: string; body: PayloadBooksUpdateInterface },
  ): Promise<void> {
    const { objectId, body } = payload
    try {
      await this.booksService.getModel().updateOne({ objectId }, body)
    } catch (e) {
      this.logger.error(`catch on update: ${e?.message ?? JSON.stringify(e)}`)
      throw new InternalServerErrorException({
        message: `${e?.message ?? e}`,
      })
    }
  }
}
