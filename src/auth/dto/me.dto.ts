import { ApiProperty } from '@nestjs/swagger'
import { User } from '../../user/entity/user.entity'

export class MeDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  readonly firstName: string

  @ApiProperty()
  readonly lastName: string

  @ApiProperty()
  readonly email: string

  @ApiProperty()
  readonly status: string


  constructor(user: User) {
    this.id = user.id
    this.firstName = user.firstName
    this.lastName = user.lastName
    this.email = user.email
    this.status = user.status
  }
}