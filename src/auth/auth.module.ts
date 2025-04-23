import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { UserModule } from '../user/user.module'
import { config } from '../config'
import { AuthController } from './controller/auth.controller'
import { JwtStrategy } from './strategies/jwt.strategy'
import { OtpStrategy } from './strategies/otp.strategy'
import { MeController } from './controller/me.controller'
import { AuthCommandHandlers } from './commands/handler'
import { CqrsModule } from '@nestjs/cqrs'
import { JobModule } from '../job/job.module'
import { GoogleStrategy } from './strategies/google.strategy'
import { OAuth2Client } from 'google-auth-library'

@Module({
  imports: [
    JobModule,
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: config.auth.jwtPrivateKey,
    }),
    CqrsModule,
  ],
  controllers: [AuthController, MeController],
  providers: [
    {
      provide: 'GOOGLE_OAUTH2_CLIENT',
      useFactory: () => {
        return new OAuth2Client(config.auth.googleClientID)
      },
    },
    ...AuthCommandHandlers,
    JwtStrategy,
    OtpStrategy,
    GoogleStrategy,
  ],
  exports: [],
})
export class AuthModule {}