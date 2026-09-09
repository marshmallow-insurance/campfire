import type { TelemetryAdapter, GlobalContext, IntercomConfig } from '../types'

declare global {
  interface Window {
    Intercom?: (...args: unknown[]) => void
  }
}

export async function createIntercomAdapter(
  config: IntercomConfig,
): Promise<TelemetryAdapter> {
  const intercom = (...args: unknown[]) => {
    if (typeof window !== 'undefined' && window.Intercom) {
      window.Intercom(...args)
    }
  }

  return {
    async init() {
      intercom('boot', {
        app_id: config.appId,
        hide_default_launcher: config.hideDefaultLauncher ?? false,
      })
    },

    track(event: string, context: GlobalContext) {
      intercom('trackEvent', event, context)
    },

    page(_name: string, _context: GlobalContext) {
      intercom('update')
    },

    identify(id: string, traits: GlobalContext) {
      intercom('update', { user_id: id, ...traits })
    },

    reset() {
      intercom('shutdown')
    },
  }
}
