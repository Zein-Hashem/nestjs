import {
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common'
  import { PassportStrategy } from '@nestjs/passport'
  import { Strategy } from 'passport-custom'
  import { config } from '../../config'
  import { UserStatus } from 'src/user/enum/userStatus'
  import { AUTH, AUTH_ERR } from '../auth.constants'
  import { ContextHelper } from 'src/system/helper/context.helper'
  import { AppLogger } from 'src/system/logger/app.logger'
  import { UserRepository } from 'src/user/repository/user.repository'
  import { OAuth2Client } from 'google-auth-library'
  import { User } from 'src/user/entity/user.entity'
  
  @Injectable()
  export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
      private readonly userRepository: UserRepository,
      private readonly contextHelper: ContextHelper,
      private readonly logger: AppLogger,
      @Inject('GOOGLE_OAUTH2_CLIENT') private readonly googleClient: OAuth2Client,
    ) {
      super()
    }
  
    async validate(req: any): Promise<any> {
      const accessToken = req.body.accessToken
  
      // Check if the Authorization header exists and follows Bearer token format
      if (!accessToken) {
        throw new UnauthorizedException('Authorization header is missing or invalid')
      }
  
      try {
        // Verify Google token
        const tokenInfo = await this.googleClient.getTokenInfo(accessToken)
        if (tokenInfo.aud !== config.auth.googleClientID) {
          throw new UnauthorizedException('Invalid token audience')
        }
  
        // Fetch user info using the People API
        const userInfo = await this.getUserInfo(accessToken)
  
        // Extract user details from the payload
        const { email, given_name, family_name } = userInfo
  
        let user = await this.userRepository.findOne({ where: { email } })
  
        //if user exists and is not active or pending, return error
        if (user && ![UserStatus.active, UserStatus.pending].includes(user.status)) {
          throw new HttpException(AUTH_ERR.INACTIVE_ACCOUNT, HttpStatus.UNAUTHORIZED)
        }
  
        //if user does not exist, create a new user, and set the status to pending
        if (!user) {
          user = new User()
          user.email = email
          user.firstName = given_name
          user.lastName = family_name
          user.status = UserStatus.pending // set status to pending
          await this.userRepository.save(user)
        }
  
        this.contextHelper.setUserId(user.id)
        this.contextHelper.setUser(user)
  
        this.logger.debug('GOOGLE_VALIDATION_FINISHED')
  
        return user
      } catch (error) {
        throw new UnauthorizedException('Google token verification failed')
      }
    }
  
    private async getUserInfo(accessToken: string) {
      // Make an API call to the Google People API to retrieve user details
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
  
      if (!response.ok) {
        throw new UnauthorizedException('Failed to fetch user info from Google')
      }
  
      return response.json() // Returns user details (email, name, picture, etc.)
    }
  }