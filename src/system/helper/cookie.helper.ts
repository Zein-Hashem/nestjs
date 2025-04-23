import { config } from '../../config'
import { EnvHelper } from '../../system/helper/env.helper'

export function setCookie(response, name: string, value: string, maxAge: number) {
  response.cookie(name, value, {
    httpOnly: !EnvHelper.isLocal(),
    secure: !EnvHelper.isLocal(),
    maxAge,
    sameSite: !EnvHelper.isLocal() ? 'none' : 'lax',
    path: '/',
    domain: config.auth.cookieDomain,
  })
}