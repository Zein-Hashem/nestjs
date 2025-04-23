import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserRepository } from './repository/user.repository'
import { UserLoginTokenRepository } from './repository/user-login-token.repository'
import { CqrsModule } from '@nestjs/cqrs'
import { JobModule } from 'src/job/job.module'

@Module({
  imports: [TypeOrmModule, CqrsModule, JobModule],
  controllers: [],
  providers: [
    UserRepository,
    UserLoginTokenRepository,
  ],
  exports: [
    UserRepository,
    UserLoginTokenRepository,
  ],
})
export class UserModule {}