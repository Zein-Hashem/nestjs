import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class TokenPayload {
  @ApiProperty({
    example: 'youssef.jradeh@gmail.com',
  })
  @IsNotEmpty({ message: 'Empty value is not allowed' })
  @IsEmail({}, { message: 'validation.INVALID_EMAIL' })
  readonly email: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Empty value is not allowed' })
  readonly token: string
}