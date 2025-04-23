import { Injectable } from '@nestjs/common'
import { ContextHelper } from '../../system/helper/context.helper'
import { Repository } from 'typeorm/repository/Repository'
import { BaseRepository } from '../../system/repository/base.repository'
import { UserLoginToken } from '../entity/user-login-token.entity'

@Injectable()
export class UserLoginTokenRepository extends BaseRepository<UserLoginToken> {
  constructor(private readonly contextHelper: ContextHelper) {
    super()
  }

  get(): Repository<UserLoginToken> {
    return this.contextHelper.getTrx().getRepository(UserLoginToken)
  }
}