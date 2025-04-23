import { NestFactory } from '@nestjs/core'
import * as bodyParser from 'body-parser'
import { useContainer } from 'class-validator'
import * as cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { WinstonModule } from 'nest-winston'
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n'
import * as requestIp from 'request-ip'
import { config } from './config'
import { AppModule } from './app.module'
import { setupSwagger } from './swagger'
import { HttpExceptionFilter } from './system/filter/http-exception.filter'
import { I18nHelper } from './system/helper/i18n.helper'
import { winstonInstance } from './system/logger/winston.logger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: winstonInstance,
    }),
  })

  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  app.enableCors({
    //todo change to config
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    credentials: true,
    allowedHeaders: ['content-type'],
  })

  //global configuration/interceptors/filters...
  app.useGlobalPipes(
    new I18nValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  app.useGlobalFilters(new HttpExceptionFilter(app.get(I18nHelper)))
  app.useGlobalFilters(new I18nValidationExceptionFilter())
  app.setGlobalPrefix('api/v1', { exclude: ['health', 'queues'] })

  app.use(bodyParser.json({ limit: config.bodyMaxSize }))
  app.use(bodyParser.urlencoded({ limit: config.bodyMaxSize, extended: true }))
  app.use(cookieParser())
  app.use(requestIp.mw())
  app.use(helmet())

  setupSwagger(app)
  await app.listen(config.port)
}

bootstrap()