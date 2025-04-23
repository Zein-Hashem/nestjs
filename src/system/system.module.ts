import { Global, Logger, Module } from '@nestjs/common'
import { I18nHelper } from './helper/i18n.helper'
import { AppLogger } from './logger/app.logger'
import { CacheService } from './service/cache.service'
import { TransactionInterceptor } from './interceptor/transaction.interceptor'
import { ContextHelper } from './helper/context.helper'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'


@Global()
@Module({
  imports: [TypeOrmModule, CqrsModule],
  providers: [
    AppLogger,
    Logger,
    ContextHelper,
    I18nHelper,
    CacheService,
    TransactionInterceptor,
  ],
  exports: [
    AppLogger,
    ContextHelper,
    I18nHelper,
    CacheService,
  ],
  controllers: [],
})
export class SystemModule {}