import { User } from 'src/user/entity/user.entity'

export class GenerateAccessTokenCommand {
  constructor(public readonly user: User) {}
}