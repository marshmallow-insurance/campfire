import type {
  GlobalContext,
  Telemetry,
  TelemetryAdapter,
  TelemetryConfig,
} from './types'
import { TelemetryQueue } from './queue'
import { captureAttribution } from './enrichers/attribution'
import { readConsent, isVendorConsented } from './consent'

export type {
  GlobalContext,
  Telemetry,
  TelemetryAdapter,
  TelemetryConfig,
  SegmentConfig,
  BrazeConfig,
  DatadogConfig,
  IntercomConfig,
  SentryConfig,
  ConsentConfig,
  AttributionParam,
  Enricher,
  IdentifyConfig,
  ContextValue,
} from './types'

class TelemetryContextManager {
  private context: GlobalContext

  constructor(initial: GlobalContext) {
    this.context = { ...initial }
  }

  set(context: GlobalContext) {
    this.context = { ...this.context, ...context }
  }

  get(additional?: GlobalContext): GlobalContext {
    return { ...this.context, ...additional }
  }

  reset(initial: GlobalContext) {
    this.context = { ...initial }
  }
}

function logToConsole(level: string, message: string, context?: GlobalContext) {
  const method =
    level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'info'
  // eslint-disable-next-line no-console
  console[method](`[Telemetry:${level}] ${message}`, context ?? '')
}

export function createTelemetry<TTrack extends string, TPage extends string>(
  config: TelemetryConfig<TTrack, TPage>,
): Telemetry<TTrack, TPage> {
  const enabled = config.enabled ?? true
  const defaultContext = config.globalContext ?? {}
  const contextManager = new TelemetryContextManager(defaultContext)
  const queue = new TelemetryQueue()
  const adapters: TelemetryAdapter[] = []
  let initialized = false
  let attributionContext: GlobalContext = {}

  const dispatch = (method: string, args: unknown[]) => {
    for (const adapter of adapters) {
      const fn = adapter[method as keyof TelemetryAdapter]
      if (typeof fn === 'function') {
        try {
          ;(fn as (...a: unknown[]) => void).apply(adapter, args)
        } catch {
          // Adapter errors should not break the app
        }
      }
    }
  }

  const callOrQueue = (method: string, args: unknown[]) => {
    if (initialized) {
      dispatch(method, args)
    } else {
      queue.enqueue(method, args)
    }
  }

  const enrichContext = (context?: GlobalContext): GlobalContext => {
    let enriched = contextManager.get({
      ...attributionContext,
      ...context,
    })

    if (config.enrichers) {
      for (const enricher of config.enrichers) {
        enriched = enricher('', enriched)
      }
    }

    return enriched
  }

  return {
    async init() {
      if (!enabled) return

      contextManager.reset(defaultContext)

      if (config.attribution) {
        attributionContext = captureAttribution(config.attribution)
      }

      const consentPurposes = config.consent
        ? readConsent(config.consent)
        : null

      const adapterPromises: Promise<void>[] = []

      if (config.segment) {
        const shouldLoad = isVendorConsented(
          consentPurposes,
          config.consent?.vendorMapping ?? {},
          'segment',
        )
        if (shouldLoad) {
          adapterPromises.push(
            import('./adapters/segment')
              .then((m) => m.createSegmentAdapter(config.segment!))
              .then((adapter) => {
                adapters.push(adapter)
              }),
          )
        }
      }

      if (config.braze) {
        const shouldLoad = isVendorConsented(
          consentPurposes,
          config.consent?.vendorMapping ?? {},
          'braze',
        )
        if (shouldLoad) {
          adapterPromises.push(
            import('./adapters/braze')
              .then((m) => m.createBrazeAdapter(config.braze!))
              .then((adapter) => {
                adapters.push(adapter)
              }),
          )
        }
      }

      if (config.datadog) {
        const shouldLoad = isVendorConsented(
          consentPurposes,
          config.consent?.vendorMapping ?? {},
          'datadog',
        )
        if (shouldLoad) {
          adapterPromises.push(
            import('./adapters/datadog')
              .then((m) => m.createDatadogAdapter(config.datadog!))
              .then((adapter) => {
                adapters.push(adapter)
              }),
          )
        }
      }

      if (config.intercom) {
        const shouldLoad = isVendorConsented(
          consentPurposes,
          config.consent?.vendorMapping ?? {},
          'intercom',
        )
        if (shouldLoad) {
          adapterPromises.push(
            import('./adapters/intercom')
              .then((m) => m.createIntercomAdapter(config.intercom!))
              .then((adapter) => {
                adapters.push(adapter)
              }),
          )
        }
      }

      if (config.sentry) {
        const shouldLoad = isVendorConsented(
          consentPurposes,
          config.consent?.vendorMapping ?? {},
          'sentry',
        )
        if (shouldLoad) {
          adapterPromises.push(
            import('./adapters/sentry')
              .then((m) => m.createSentryAdapter(config.sentry!))
              .then((adapter) => {
                adapters.push(adapter)
              }),
          )
        }
      }

      await Promise.all(adapterPromises)
      await Promise.all(adapters.map((a) => a.init()))

      initialized = true

      queue.flush((method, args) => dispatch(method, args))
    },

    track(event: TTrack, context?: GlobalContext) {
      const enriched = enrichContext(context)

      if (!enabled) {
        logToConsole('track', event, enriched)
        return
      }

      callOrQueue('track', [event, enriched])
    },

    page(page: TPage, context?: GlobalContext) {
      const enriched = enrichContext(context)
      contextManager.set({ page })

      if (!enabled) {
        logToConsole('page', page, enriched)
        return
      }

      callOrQueue('page', [page, enriched])
    },

    identify(id: string, traits?: GlobalContext) {
      const enriched = enrichContext(traits)

      if (config.identify?.promoteToGlobalContext) {
        const promoted: GlobalContext = {}
        for (const key of config.identify.promoteToGlobalContext) {
          if (enriched[key] !== undefined) {
            promoted[key] = enriched[key]
          }
        }
        contextManager.set(promoted)

        if (enabled) {
          callOrQueue('setContext', [contextManager.get()])
        }
      }

      if (!enabled) {
        logToConsole('identify', id, enriched)
        return
      }

      callOrQueue('identify', [id, enriched])
    },

    identifyAnonymous(traits?: GlobalContext) {
      const enriched = traits ? enrichContext(traits) : undefined

      if (!enabled) {
        logToConsole('identifyAnonymous', '', enriched)
        return
      }

      callOrQueue('identifyAnonymous', [enriched])
    },

    error(message: string, context?: GlobalContext, error?: unknown) {
      const enriched = enrichContext(context)
      const actualError =
        error instanceof Error
          ? error
          : context &&
              typeof context === 'object' &&
              'error' in context &&
              context.error instanceof Error
            ? context.error
            : error !== undefined
              ? new Error(typeof error === 'string' ? error : message)
              : new Error(message)

      if (!enabled) {
        logToConsole('error', message, { ...enriched, error: actualError })
        return
      }

      callOrQueue('error', [message, enriched, actualError])
    },

    warn(message: string, context?: GlobalContext) {
      const enriched = enrichContext(context)

      if (!enabled) {
        logToConsole('warn', message, enriched)
        return
      }

      callOrQueue('warn', [message, enriched])
    },

    info(message: string, context?: GlobalContext) {
      const enriched = enrichContext(context)

      if (!enabled) {
        logToConsole('info', message, enriched)
        return
      }

      callOrQueue('info', [message, enriched])
    },

    setGlobalContext(context: GlobalContext) {
      contextManager.set(context)

      if (!enabled) return

      callOrQueue('setContext', [contextManager.get()])
    },

    reset() {
      contextManager.reset(defaultContext)
      attributionContext = {}

      if (!enabled) return

      for (const adapter of adapters) {
        try {
          adapter.reset()
        } catch {
          // Adapter errors should not break the app
        }
      }
    },
  }
}
