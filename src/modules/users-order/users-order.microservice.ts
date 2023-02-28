import { Controller, InternalServerErrorException } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'

import { PayloadUsersOrderInterface } from './interface/payload-users-order.interface'
import { UsersOrder, UsersOrderDocument } from './users-order.schema'
import { UsersOrderService } from './users-order.service'

import { LoggerService } from '../logger/logger.service'

import { FindOptionsInterface } from '../../interfaces/find-options.interface'
import {
  PaginationInterface,
  PaginationResponseInterface,
} from '../../interfaces/pagination.interface'
import { USERS_ORDER } from '../../microservice.constants'

@Controller()
export class UsersOrderMicroservice {
  private readonly logger: LoggerService = new LoggerService(
    UsersOrderMicroservice.name,
  )

  constructor(private readonly usersOrderService: UsersOrderService) {}

  @MessagePattern({
    cmd: USERS_ORDER,
    method: 'getPagination',
  })
  async getPagination(
    @Payload()
    payload: PaginationInterface & FindOptionsInterface<UsersOrderDocument>,
  ): Promise<PaginationResponseInterface<UsersOrder>> {
    const { filter, page, perPage, select, sort } = payload

    try {
      const [records, count] = await this.usersOrderService.getPagination(
        filter,
        {
          page,
          perPage,
        },
        sort,
        select,
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
    cmd: USERS_ORDER,
    method: 'create-order',
  })
  async createOrder(
    @Payload() payload: PayloadUsersOrderInterface,
  ): Promise<void> {
    try {
      await this.usersOrderService.getModel().create(payload)
    } catch (e) {
      this.logger.error(
        `catch on createOrder: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @MessagePattern({
    cmd: USERS_ORDER,
    method: 'topSeller',
  })
  async topSeller(): Promise<any> {
    try {
      return this.usersOrderService.topSeller()
    } catch (e) {
      this.logger.error(
        `catch on createOrder: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @MessagePattern({
    cmd: USERS_ORDER,
    method: 'topSellerByGenre',
  })
  async topSellerByGenre(): Promise<any> {
    try {
      return this.usersOrderService.topSellerByGenre()
    } catch (e) {
      this.logger.error(
        `catch on createOrder: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @MessagePattern({
    cmd: USERS_ORDER,
    method: 'getTopUserBought',
  })
  async getTopUserBought(
    @Payload()
    payload: PaginationInterface & FindOptionsInterface<UsersOrderDocument>,
  ): Promise<PaginationResponseInterface<any>> {
    const { page, perPage } = payload
    try {
      const [records, count] = await Promise.all([
        this.usersOrderService.getTopUserBought({
          page,
          perPage,
        }),
        this.usersOrderService.countGetTopUserBought({
          page,
          perPage,
        }),
      ])

      return {
        page,
        perPage,
        count,
        records,
      }
    } catch (e) {
      this.logger.error(
        `catch on getTopUserBought: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @MessagePattern({
    cmd: USERS_ORDER,
    method: 'getUsersOrder',
  })
  async getUsersOrder(
    @Payload()
    payload: PaginationInterface & FindOptionsInterface<UsersOrderDocument>,
  ): Promise<PaginationResponseInterface<any>> {
    const { page, perPage } = payload
    try {
      const [records, count] = await Promise.all([
        this.usersOrderService.getUserOrder({
          page,
          perPage,
        }),
        this.usersOrderService.countGetUserOrder({
          page,
          perPage,
        }),
      ])

      return {
        page,
        perPage,
        count,
        records,
      }
    } catch (e) {
      this.logger.error(
        `catch on getUserOrder: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @MessagePattern({
    cmd: USERS_ORDER,
    method: 'getHistoryByOrder',
  })
  async getHistoryByOrder(
    @Payload()
    payload: {
      objectId: string
      body: PaginationInterface & FindOptionsInterface<UsersOrderDocument>
    },
  ): Promise<PaginationResponseInterface<any>> {
    const { objectId, body } = payload
    const { page, perPage } = body

    try {
      const [records, count] = await Promise.all([
        this.usersOrderService.getHistoryByOrder(objectId, {
          page,
          perPage,
        }),
        this.usersOrderService.countHistoryByOrder(objectId, {
          page,
          perPage,
        }),
      ])

      return {
        page,
        perPage,
        count,
        records,
      }
    } catch (e) {
      this.logger.error(
        `catch on getHistoryByOrder: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @MessagePattern({
    cmd: USERS_ORDER,
    method: 'getOrderByGenre',
  })
  async getOrderByGenre(): Promise<any> {
    try {
      return this.usersOrderService.getOrderByGenre()
    } catch (e) {
      this.logger.error(
        `catch on getOrderByGenre: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }

  @MessagePattern({
    cmd: USERS_ORDER,
    method: 'getReportByWeek',
  })
  async getReportByWeek(): Promise<any> {
    try {
      return this.usersOrderService.getReportByWeek()
    } catch (e) {
      this.logger.error(
        `catch on getReportByWeek: ${e?.message ?? JSON.stringify(e)}`,
      )
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      })
    }
  }
}
