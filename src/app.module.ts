import { UserModule } from './user/user.module'
import { Logger, MiddlewareConsumer, Module } from '@nestjs/common'
import { LogsMiddleware } from './system/logger/logs.middleware'
import { AuthModule } from './auth/auth.module'
import { ClsModule } from 'nestjs-cls'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { LanguageGuard } from './system/guards/language.guard'
import { SystemModule } from './system/system.module'
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n'
import { join } from 'path'
import { CacheModule } from '@nestjs/cache-manager'
import { DataSource, DataSourceOptions } from 'typeorm'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TypeOrmConfigService } from './database/typeorm-config.service'
import { JobModule } from './job/job.module'


@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize()
      },
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['accept-language']),
      ],
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    JobModule,
    AuthModule,
    UserModule,
    SystemModule,
  ],
  controllers: [],
  providers: [
    Logger,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: LanguageGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes('*')
  }
}