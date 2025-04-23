import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as basicAuth from 'express-basic-auth'
import { config } from './config'

export function setupSwagger(app: INestApplication) {
  app.use(
    ['/documentation', '/documentation-json'],
    basicAuth({
      challenge: true,
      users: {
        swagger: `${config.swagger.password}`,
      },
    }),
  )
  const options = new DocumentBuilder()
    .setTitle('Project Onex')
    .setDescription('API documentation for Onex')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('documentation', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      staticCSP: false,
    },
  })
}