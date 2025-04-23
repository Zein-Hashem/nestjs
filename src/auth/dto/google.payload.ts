import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class GooglePayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Empty value is not allowed' })
  readonly accessToken: string
}