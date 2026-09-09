import type { TelemetryAdapter, GlobalContext, BrazeConfig } from '../types'

function flattenContext(
  context: GlobalContext,
): Record<string, string | number | boolean> {
  const flat: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(context)) {
    if (value === null || value === undefined) continue
    if (typeof value === 'object') {
      flat[key] = JSON.stringify(value)
    } else {
      flat[key] = value
    }
  }
  return flat
}

export async function createBrazeAdapter(
  config: BrazeConfig,
): Promise<TelemetryAdapter> {
  const braze = await import('@braze/web-sdk')

  return {
    async init() {
      braze.initialize(config.appId, {
        baseUrl: config.endpoint,
        enableLogging: config.enableLogging ?? false,
        allowUserSuppliedJavascript: false,
      })
    },

    track(event: string, context: GlobalContext) {
      braze.logCustomEvent(event, flattenContext(context))
    },

    page(name: string, context: GlobalContext) {
      const prefixed = config.pagePrefix ? `${config.pagePrefix}${name}` : name
      braze.logCustomEvent(prefixed, flattenContext(context))
    },

    identify(id: string, traits: GlobalContext) {
      braze.changeUser(id)
      const flat = flattenContext(traits)
      for (const [key, value] of Object.entries(flat)) {
        braze.getUser()?.setCustomUserAttribute(key, value)
      }
    },

    reset() {
      braze.wipeData()
    },
  }
}
