import type { TelemetryAdapter, GlobalContext, SentryConfig } from '../types'

export async function createSentryAdapter(
  config: SentryConfig,
): Promise<TelemetryAdapter> {
  const Sentry = await import('@sentry/react')

  return {
    async init() {
      Sentry.init({
        dsn: config.dsn,
        environment: config.environment,
        tracesSampleRate: config.tracesSampleRate ?? 1,
      })
    },

    track(_event: string, _context: GlobalContext) {
      // Sentry doesn't track custom events
    },

    page(_name: string, _context: GlobalContext) {
      // Sentry doesn't track page views
    },

    identify(id: string, traits: GlobalContext) {
      Sentry.setUser({ id, ...traits })
    },

    error(message: string, context: GlobalContext, error?: Error) {
      if (error) {
        Sentry.captureException(error, { extra: { message, ...context } })
      } else {
        Sentry.captureMessage(message, { extra: context })
      }
    },

    setContext(context: GlobalContext) {
      Sentry.setContext('telemetry', context)
    },

    reset() {
      Sentry.setUser(null)
    },
  }
}
