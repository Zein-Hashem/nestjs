import { Injectable } from '@nestjs/common'
import { ContextHelper } from '../../system/helper/context.helper'
import { User } from '../entity/user.entity'
import { Repository } from 'typeorm/repository/Repository'
import { BaseRepository } from '../../system/repository/base.repository'

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(private readonly contextHelper: ContextHelper) {
    super()
  }

  get(): Repository<User> {
    return this.contextHelper.getTrx().getRepository(User)
  }
}