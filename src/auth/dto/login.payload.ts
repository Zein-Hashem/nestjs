import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'

export class LoginPayload {
  @ApiProperty({
    example: 'youssef.jradeh@gmail.com',
  })
  @IsNotEmpty({ message: 'Empty value is not allowed' })
  @IsEmail({}, { message: 'Invalid email' })
  readonly email: string

  @ApiProperty({
    example: 'youssef.jradeh@gmail.com',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Full name must contain only alphabetic characters and spaces',
  })
  readonly fullName: string
}