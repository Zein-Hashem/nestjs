import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Observable } from 'rxjs'
import { I18nContext } from 'nestjs-i18n'
import { ContextHelper } from '../helper/context.helper'

@Injectable()
export class LanguageGuard implements CanActivate {
  constructor(private readonly contextHelper: ContextHelper) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const i18n = I18nContext.current()
    this.contextHelper.setLanguage(i18n?.lang ?? 'default-language')

    return true
  }
}