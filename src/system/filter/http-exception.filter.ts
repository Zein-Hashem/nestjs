import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { I18nHelper } from '../../system/helper/i18n.helper'
import { APP_ERR } from '../../app.constants'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private i18nHelper: I18nHelper) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const message = exception.getResponse() as any
    const status = exception.getStatus()

    // Check if the status code is 401 (Unauthorized)
    const unauthorized = status === HttpStatus.UNAUTHORIZED

    // Define custom messages based on status codes
    let customMessage = message?.message ?? message
    if (unauthorized) customMessage = APP_ERR.UNAUTHORIZED
    if (status === HttpStatus.TOO_MANY_REQUESTS) customMessage = APP_ERR.TOO_MANY_ATTEMPTS
    if (status === HttpStatus.UNAUTHORIZED) customMessage = APP_ERR.UNAUTHORIZED

    let finalMessage = customMessage
    if (typeof customMessage === 'object') {
      finalMessage = customMessage.key
    }

    response.status(status).json({
      statusCode: status,
      message: finalMessage,
    })
  }
}