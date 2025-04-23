import { Controller, Get, Res, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { TransactionInterceptor } from '../../system/interceptor/transaction.interceptor'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { MeDto } from '../dto/me.dto'
import { Response } from 'express'
import { AUTH } from '../auth.constants'
import { ContextHelper } from '../../system/helper/context.helper'
import { config } from '../../config'
import { EnvHelper } from '../../system/helper/env.helper'

@Controller('auth/me')
@ApiTags('Authentication')
@UseInterceptors(TransactionInterceptor)
@UseGuards(JwtAuthGuard)
export class MeController   {
  constructor(private readonly contextHelper: ContextHelper) {}

  @Get()
  async me(): Promise<MeDto> {
    return new MeDto(this.contextHelper.getUser())
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.cookie(AUTH.AT_COOKIE_NAME, '', {
      httpOnly: !EnvHelper.isLocal(),
      secure: !EnvHelper.isLocal(),
      maxAge: 1,
      sameSite: !EnvHelper.isLocal() ? 'none' : undefined,
      domain: config.auth.cookieDomain,
    })
  }
}