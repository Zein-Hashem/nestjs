import { BadRequestException } from '@nestjs/common'

export class OTPException extends BadRequestException {
  constructor(message: string) {
    super(message || 'INVALID_OTP')
  }
}