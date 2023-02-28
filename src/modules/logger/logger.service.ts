import { ConsoleLogger, Injectable } from '@nestjs/common'
import AWS from 'aws-sdk'
import winston from 'winston'
import WinstonCloudwatch from 'winston-cloudwatch'
import dayjs from 'dayjs'

const cloudWatchFormatter = (info) => {
  return `${dayjs(info.timestamp).format('YYYY/MM/DD - hh:mm:ss.SSS A')} [${
    info.level
  }] [${info.context}] ${info.message}`
}

const customFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.prettyPrint(),
  winston.format.printf((info) => cloudWatchFormatter(info)),
)

@Injectable()
export class LoggerService extends ConsoleLogger {
  private ctx: string
  private winstonLogger: winston.Logger

  constructor(ctx = 'Logger') {
    super(ctx)
    const isProduction = process.env.NODE_ENV === 'production'
    AWS.config.update({
      region: process.env.AWS_REGION,
    })
    this.setContext(ctx)
    this.winstonLogger = winston.createLogger({
      level: 'silly',
      format: customFormat,
      transports: [
        new winston.transports.Console({
          silent: isProduction,
        }),
      ],
    })
    if (isProduction) {
      this.winstonLogger.add(
        new WinstonCloudwatch({
          name: process.env.SERVICE_NAME,
          messageFormatter: cloudWatchFormatter,
          awsAccessKeyId: process.env.AWS_ACCESSK_KEY_ID || '',
          awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY || '',
          logGroupName: `${process.env.DOMAIN_NAME}/${process.env.SERVICE_NAME}`,
          logStreamName: this.ctx,
        }),
      )
    }
  }

  public setContext(context: string): this {
    this.ctx = context
    return this
  }

  public silly(message: string): void {
    this.winstonLog(message, 'silly')
  }

  public debug(message: string): void {
    this.winstonLog(message, 'debug')
  }

  public log(message: string): void {
    this.winstonLog(message, 'info')
  }

  public info(message: string): void {
    this.winstonLog(message, 'info')
  }

  public warn(message: string): void {
    this.winstonLog(message, 'warn')
  }

  public error(message: string, req = null): void {
    let msg = message
    if (req) {
      msg = `
        Method: ${req.method}
        Path: ${req.path}
        Headers: ${JSON.stringify(req.headers)}
        Query: ${JSON.stringify(req.query)}
        Param: ${JSON.stringify(req.param)}
        Body: ${JSON.stringify(req.body)}
        Message: ${message}
      `
    }
    this.winstonLog(msg, 'error')
  }

  private winstonLog(
    message: string,
    level: 'silly' | 'info' | 'debug' | 'warn' | 'error',
  ) {
    const entry = {
      level,
      message,
      context: this.ctx,
    }
    this.winstonLogger.log(entry)
  }
}
