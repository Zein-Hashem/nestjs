import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { BadRequestException } from '@nestjs/common'
import { AUTH, AUTH_ERR } from '../../auth.constants'
import { CreateLoginTokenCommand } from '../create-login-token.command'
import { sign } from 'jsonwebtoken'
import { config } from '../../../config'
import { addMilliseconds, addSeconds } from 'date-fns'
import { UserLoginTokenRepository } from '../../../user/repository/user-login-token.repository'
import { UserRepository } from '../../../user/repository/user.repository'
import { UserLoginToken } from '../../../user/entity/user-login-token.entity'
import { v4 as uuidv4 } from 'uuid'
import { User } from '../../../user/entity/user.entity'
import { UserStatus } from '../../../user/enum/userStatus'
import { MoreThan } from 'typeorm'
import { AppLogger } from '../../../system/logger/app.logger'
import { Queue } from 'bullmq'
import { AUTH_QUEUE } from '../../../job/processor/auth.processor'
import { InjectQueue } from '@nestjs/bullmq'
import { AuthOtpVerificationPayload } from '../../../job/dto/auth-otp-verification.payload'

@CommandHandler(CreateLoginTokenCommand)
export class CreateLoginTokenHandler implements ICommandHandler<CreateLoginTokenCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userLoginTokenRepository: UserLoginTokenRepository,
    private readonly logger: AppLogger,
    @InjectQueue(AUTH_QUEUE.NAME) private readonly authQueue: Queue,
  ) {}

  async execute(command: CreateLoginTokenCommand) {
    let user = await this.userRepository.findOneBy({ email: command.email })

    //if user exists and is not active or pending, return error
    if (user && ![UserStatus.active, UserStatus.pending].includes(user.status)) {
      throw new BadRequestException(AUTH_ERR.INACTIVE_ACCOUNT)
    }

    // if user not found and fullname is not provided, throw an error
    if (!user && !command.fullName) {
      throw new BadRequestException('User not found')
    }

    // if user not found, create a new user
    if (!user) {
      user = new User()
      user.email = command.email ?? ''
      const nameParts = command.fullName?.trim().split(/\s+/) || []
      if (nameParts.length < 2) {
        throw new BadRequestException('Full name must include both first name and last name')
      }
      user.firstName = nameParts[0]
      user.lastName = nameParts.slice(1).join(' ')
      user.status = UserStatus.pending // set status to pending
      await this.userRepository.save(user)
    }

    // destroy the current active code for the user and create a new one
    await this.userLoginTokenRepository.softDelete({
      expiredAt: MoreThan(new Date()),
      user: { id: user.id },
    })
    const userLoginToken = await this.createOtpLoginToken(user)

    // sending the otp email to the respective user
    const payload: AuthOtpVerificationPayload = {
      id: user.id,
      firstName: user.firstName,
      email: user.email,
      token: userLoginToken.token,
      expiresIn: Number(config.auth.jwtOtpShortExpiry) / 60000,
    }
    await this.authQueue.add(AUTH_QUEUE.JOBS.OTP_VERIFICATION, payload)

    const jwtPayload = {
      email_for_otp: user.email,
      purpose: AUTH.JWT_OTP_PURPOSE,
    }
    return {
      token: sign(jwtPayload, config.auth.jwtPrivateKey || '', {
        expiresIn: `${config.auth.jwtOtpShortExpiry}s`,
      }),
      userStatus: user.status,
    }
  }

  async createOtpLoginToken(user: User): Promise<UserLoginToken> {
    const userLoginToken = new UserLoginToken()
    userLoginToken.user = user
    userLoginToken.token = uuidv4()
    userLoginToken.token = Array.from({ length: 6 }, () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      return chars.charAt(Math.floor(Math.random() * chars.length))
    }).join('')
    userLoginToken.expiredAt = addMilliseconds(new Date(), Number(config.auth.jwtOtpShortExpiry))
    return await this.userLoginTokenRepository.save(userLoginToken)
  }
}