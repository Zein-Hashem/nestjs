import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt'
import { config } from '../../config'
import { UserRepository } from '../../user/repository/user.repository'
import { AUTH, AUTH_ERR } from '../auth.constants'
import { AppLogger } from '../../system/logger/app.logger'
import { ContextHelper } from '../../system/helper/context.helper'
import { UserStatus } from '../../user/enum/userStatus'

/**
 * following interface is used for representing JSON payload
 */
export interface JwtPayload {
  subject: string
  iat?: Date
  email: string
  purpose: string
}

const cookieExtractor = (req) => {
  let token = null
  if (req && req.cookies) {
    token = req.cookies[AUTH.AT_COOKIE_NAME]
  }
  return token
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly contextHelper: ContextHelper,
    private readonly logger: AppLogger,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: config.auth.jwtPrivateKey,
      passReqToCallback: true,
    })
  }

  async validate(req: any, payload: JwtPayload, done: VerifiedCallback) {
    this.logger.debug('JWT_VALIDATION_STARTED', payload)

    if (payload.purpose !== AUTH.JWT_SESSION_PURPOSE)
      return done(new HttpException(AUTH_ERR.INVALID_SESSION, HttpStatus.UNAUTHORIZED), false)

    const user = await this.userRepository.findOne({
      where: { id: payload.subject },
    })

    if (!user) return done(new HttpException(AUTH_ERR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED), false)

    if (user.status !== UserStatus.active)
      return done(new HttpException(AUTH_ERR.INACTIVE_ACCOUNT, HttpStatus.UNAUTHORIZED), false)

    this.contextHelper.setUserId(user.id)
    this.contextHelper.setUser(user)

    this.logger.debug('JWT_VALIDATION_FINISHED', payload)

    return done(null, user, payload.iat)
  }
}