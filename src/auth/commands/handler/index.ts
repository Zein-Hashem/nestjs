import { ValidateLoginTokenHandler } from './validate-login-token.handler'
import { CreateLoginTokenHandler } from './create-login-token.handler'
import { GenerateAccessTokenHandler } from './generate-access-token.handler'

export const AuthCommandHandlers = [
  CreateLoginTokenHandler,
  ValidateLoginTokenHandler,
  GenerateAccessTokenHandler,
]