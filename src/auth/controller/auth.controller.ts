import {
    Body,
    Controller,
    HttpCode,
    Post,
    Req,
    Res,
    UseGuards,
    UseInterceptors,
  } from '@nestjs/common'
  import { ApiTags } from '@nestjs/swagger'
  import { TransactionInterceptor } from '../../system/interceptor/transaction.interceptor'
  import { Response } from 'express'
  import { config } from '../../config'
  import { LoginPayload } from '../dto/login.payload'
  import { AUTH } from '../auth.constants'
  import { TokenPayload } from '../dto/token.payload'
  import { CommandBus } from '@nestjs/cqrs'
  import { CreateLoginTokenCommand } from '../commands/create-login-token.command'
  import { ValidateLoginTokenCommand } from '../commands/validate-login-token.command'
  import { OtpAuthGuard } from '../guards/otp-auth.guard'
  import { MeDto } from '../dto/me.dto'
  import { GoogleLoginGuard } from '../guards/google-login.guard'
  import { UserStatus } from 'src/user/enum/userStatus'
  import { GenerateAccessTokenCommand } from '../commands/generate-access-token.command'
  import { setCookie } from '../../system/helper/cookie.helper'
  import { GooglePayload } from '../dto/google.payload'
  import { User } from 'src/user/entity/user.entity'
  
  @Controller('auth')
  @ApiTags('Authentication')
  @UseInterceptors(TransactionInterceptor)
  export class AuthController {
    constructor(private readonly commandBus: CommandBus) {}
  
    @Post('login-token')
    @HttpCode(200)
    async create(@Body() payload: LoginPayload, @Res({ passthrough: true }) response: Response) {
      try {
        const { token, userStatus } = await this.commandBus.execute(
          new CreateLoginTokenCommand(payload.email, payload.fullName),
        )
        console.log('token', token)
        console.log('userStatus', userStatus)
        setCookie(response, AUTH.OTP_COOKIE_NAME, token, config.auth.jwtOtpShortExpiry)
        //FE is checking if status is present in the response, otherwise it consider that user does not exist
        return { status: userStatus }
      } catch (error) {
        return { message: error.message }
      }
    }
  
    @Post('login-token/confirm')
    @HttpCode(200)
    @UseGuards(OtpAuthGuard)
    async verify(@Body() payload: TokenPayload, @Res({ passthrough: true }) response: Response) {
      const { user, validToken } = await this.commandBus.execute(
        new ValidateLoginTokenCommand(payload.email, payload.token),
      )
  
      setCookie(response, AUTH.OTP_COOKIE_NAME, '', 0)
      setCookie(response, AUTH.AT_COOKIE_NAME, validToken, config.auth.jwtExpiry)
      return new MeDto(user)
    }
  
    @Post('continue-with-google')
    @HttpCode(200)
    @UseGuards(GoogleLoginGuard)
    async continueWithGoogle(
      @Body() payload: GooglePayload,
      @Res({ passthrough: true }) response: Response,
      @Req() req: any,
    ) {
      const pendingOrActiveUser: User = req.user
  
      //if the already ACTIVE, generate a new access token
      if (pendingOrActiveUser.status === UserStatus.active) {
        const accessToken = await this.commandBus.execute(
          new GenerateAccessTokenCommand(pendingOrActiveUser),
        )
        setCookie(response, AUTH.AT_COOKIE_NAME, accessToken, config.auth.jwtExpiry)
      } else {
        //otherwise it's PENDING, so let's create a new login token as a final confirmation step
        const { token, userStatus } = await this.commandBus.execute(
          new CreateLoginTokenCommand(pendingOrActiveUser.email),
        )
        setCookie(response, AUTH.OTP_COOKIE_NAME, token, config.auth.jwtOtpShortExpiry)
      }
      return new MeDto(pendingOrActiveUser)
    }
  
  }