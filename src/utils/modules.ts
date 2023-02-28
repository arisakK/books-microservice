import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

import configuration from '../config/configuration'
import { models } from '../mongoose.providers'

let mongodb: MongoMemoryServer

export const CommonModules = [
  ConfigModule.forRoot({
    load: [configuration],
    isGlobal: true,
  }),
  MongooseModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      let mongoUri
      /* istanbul ignore next */
      if (['testing', 'test'].includes(process.env.NODE_ENV)) {
        mongodb = await MongoMemoryServer.create()
        mongoUri = await mongodb.getUri()
      } else {
        /* istanbul ignore next */
        mongoUri = configService.get<string>('database.host')
      }
      return {
        uri: mongoUri,
        ...configService.get<any>('database.options'),
      }
    },
  }),
  MongooseModule.forFeature(models),
]

/* istanbul ignore next */
export const closeConnection = async (): Promise<void> => {
  if (mongodb) await mongodb.stop()
}
