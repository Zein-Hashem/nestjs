import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { AUTH, AUTH_ERR } from '../../auth.constants'
import { sign } from 'jsonwebtoken'
import { AppLogger } from '../../../system/logger/app.logger'
import { config } from '../../../config'
import { UserLoginTokenRepository } from '../../../user/repository/user-login-token.repository'
import { OTPException } from '../../exception/OTPException'
import { ValidateLoginTokenCommand } from '../validate-login-token.command'
import { isUUID } from 'class-validator'
import { In, MoreThan } from 'typeorm'
import { UserStatus } from '../../../user/enum/userStatus'
import { UserRepository } from 'src/user/repository/user.repository'

@CommandHandler(ValidateLoginTokenCommand)
export class ValidateLoginTokenHandler implements ICommandHandler<ValidateLoginTokenCommand> {
  constructor(
    private readonly userLoginTokenRepository: UserLoginTokenRepository,
    private readonly userRepository: UserRepository,
    private readonly logger: AppLogger,
  ) {}

  async execute(command: ValidateLoginTokenCommand) {
    // validate the token
    const tokenRegex = /^[0-9a-zA-Z]{6}$/
    if (!tokenRegex.test(command.token)) throw new OTPException(AUTH_ERR.INVALID_OTP)

    // find the user by email and otp
    const userLoginToken = await this.userLoginTokenRepository.findOne({
      relations: ['user'],
      where: {
        token: command.token,
        expiredAt: MoreThan(new Date()),
        user: { email: command.email, status: In([UserStatus.active, UserStatus.pending]) },
      },
    })
    if (!userLoginToken) throw new OTPException(AUTH_ERR.INVALID_OTP)

    // if otp is good , then mark it as validated
    userLoginToken.validatedAt = new Date()
    await this.userLoginTokenRepository.save(userLoginToken)

    // update the user status to active
    userLoginToken.user.status = UserStatus.active
    this.userRepository.save(userLoginToken.user)

    // generate a new jwt token for the user
    const jwtPayload = {
      email: userLoginToken.user.email,
      subject: userLoginToken.user.id,
      purpose: AUTH.JWT_SESSION_PURPOSE,
    }

    if (!config.auth.jwtPrivateKey) {
      throw new Error('JWT private key is not defined in the configuration.');
    }
    const token = sign(jwtPayload, config.auth.jwtPrivateKey, {
      expiresIn: `${config.auth.jwtExpiry}s`,
    })

    return { user: userLoginToken.user, validToken: token }
  }
}