import { Injectable } from '@nestjs/common'
import { I18nService } from 'nestjs-i18n'
import { ContextHelper } from './context.helper'

@Injectable()
export class I18nHelper {
  constructor(
    private readonly i18n: I18nService,
    private readonly contextHelper: ContextHelper,
  ) {}

  translate(key: string, args?: any): string {
    const lang = this.contextHelper.getLanguage()
    return this.i18n.translate(key, { lang, args })
  }
}