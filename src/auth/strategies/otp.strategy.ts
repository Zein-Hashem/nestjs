import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt'
import { config } from '../../config'
import { AUTH, AUTH_ERR } from '../auth.constants'
import { AppLogger } from '../../system/logger/app.logger'

/**
 * following interface is used for representing JSON payload for OTP session
 */
export interface JwtPayload {
  subject: string
  iat?: Date
  email_for_otp: string
  purpose: string
}

const cookieExtractor = (req) => {
  let token = null
  if (req && req.cookies) {
    token = req.cookies[AUTH.OTP_COOKIE_NAME]
  }
  return token
}

@Injectable()
export class OtpStrategy extends PassportStrategy(Strategy, 'otp') {
  constructor(private readonly logger: AppLogger) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: config.auth.jwtPrivateKey,
      passReqToCallback: true,
    })
  }

  async validate(req: any, payload: JwtPayload, done: VerifiedCallback) {
    this.logger.debug('OTP_JWT_VALIDATION_STARTED', payload)

    if (payload.purpose !== AUTH.JWT_OTP_PURPOSE)
      return done(new HttpException(AUTH_ERR.INVALID_OTP, HttpStatus.BAD_REQUEST), false)

    //get the email from the request post body
    if (payload.email_for_otp !== req.body.email)
      return done(new HttpException(AUTH_ERR.INVALID_OTP, HttpStatus.BAD_REQUEST), false)

    this.logger.debug('OTP_JWT_VALIDATION_FINISHED', payload)

    return done(null, { email: payload.email_for_otp }, payload.iat)
  }
}