import type { AttributionParam, GlobalContext } from '../types'

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(
    new RegExp(
      `(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`,
    ),
  )
  return match?.[1] ? decodeURIComponent(match[1]) : undefined
}

function setCookie(name: string, value: string, maxAgeDays: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeDays * 86400}; path=/; SameSite=Lax`
}

function getStorage(
  persist: 'local' | 'session',
  key: string,
): string | undefined {
  try {
    const storage = persist === 'local' ? localStorage : sessionStorage
    return storage.getItem(key) ?? undefined
  } catch {
    return undefined
  }
}

function setStorage(persist: 'local' | 'session', key: string, value: string) {
  try {
    const storage = persist === 'local' ? localStorage : sessionStorage
    storage.setItem(key, value)
  } catch {
    // Storage full or blocked — silently ignore
  }
}

function matchesWildcard(param: string, key: string): boolean {
  if (!param.endsWith('*')) return param === key
  return key.startsWith(param.slice(0, -1))
}

export function captureAttribution(params: AttributionParam[]): GlobalContext {
  if (typeof window === 'undefined') return {}

  const searchParams = new URLSearchParams(window.location.search)
  const captured: GlobalContext = {}

  for (const config of params) {
    const isWildcard = config.param.endsWith('*')

    if (isWildcard) {
      for (const [key, value] of searchParams.entries()) {
        if (matchesWildcard(config.param, key) && value) {
          captured[key] = value
        }
      }
      continue
    }

    const key = config.as ?? config.param
    const urlValue = searchParams.get(config.param) ?? undefined

    if (urlValue) {
      captured[key] = urlValue

      if (config.persist === 'cookie') {
        setCookie(key, urlValue, config.maxAgeDays ?? 30)
      } else if (config.persist) {
        setStorage(config.persist, key, urlValue)
      }
    } else if (config.persist === 'cookie') {
      const stored = getCookie(key)
      if (stored) captured[key] = stored
    } else if (config.persist) {
      const stored = getStorage(config.persist, key)
      if (stored) captured[key] = stored
    }
  }

  return captured
}
