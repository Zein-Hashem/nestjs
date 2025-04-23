import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { AUTH } from '../../auth.constants'
import { sign } from 'jsonwebtoken'
import { AppLogger } from '../../../system/logger/app.logger'
import { config } from '../../../config'
import { GenerateAccessTokenCommand } from '../generate-access-token.command'

@CommandHandler(GenerateAccessTokenCommand)
export class GenerateAccessTokenHandler implements ICommandHandler<GenerateAccessTokenCommand> {
  constructor(private readonly logger: AppLogger) {}

  async execute(command: GenerateAccessTokenCommand) {
    const jwtPayload = {
      email: command.user.email,
      subject: command.user.id,
      purpose: AUTH.JWT_SESSION_PURPOSE,
    }

    if (!config.auth.jwtPrivateKey) {
      throw new Error('JWT private key is not defined');
    }
    const token = sign(jwtPayload, config.auth.jwtPrivateKey, {
      expiresIn: `${config.auth.jwtExpiry}s`,
    })

    return token
  }
}