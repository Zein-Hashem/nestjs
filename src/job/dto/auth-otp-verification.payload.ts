import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class AuthOtpVerificationPayload {
  @ApiProperty({
    example: 'uuid',
  })
  @IsNotEmpty({ message: 'Empty value is not allowed' })
  readonly id: string

  @ApiProperty({
    example: 'Youssef',
  })
  @IsNotEmpty({ message: 'Empty value is not allowed' })
  readonly firstName: string

  @ApiProperty({
    example: 'youssef.jradeh@gmail.com',
  })
  @IsNotEmpty({ message: 'Empty value is not allowed' })
  @IsEmail({}, { message: 'Invalid Email' })
  readonly email: string

  @ApiProperty({
    example: 'some-jwt-token',
  })
  @IsNotEmpty({ message: 'Empty value is not allowed' })
  readonly token: string

  @ApiProperty({
    example: 15,
  })
  @IsNotEmpty({ message: 'Empty value is not allowed' })
  readonly expiresIn: number

  constructor(id: string, firstName: string, email: string, token: string, expiresIn: number) {
    this.id = id
    this.firstName = firstName
    this.email = email
    this.token = token
    this.expiresIn = expiresIn
  }
}