import type { TelemetryAdapter, GlobalContext, SegmentConfig } from '../types'

const DEFAULT_API_HOST = 'analytics.marshmallow.co/v1'

export async function createSegmentAdapter(
  config: SegmentConfig,
): Promise<TelemetryAdapter> {
  const { AnalyticsBrowser } = await import('@segment/analytics-next')
  const analytics = new AnalyticsBrowser()

  return {
    async init() {
      analytics.load(
        { writeKey: config.key },
        {
          integrations: {
            'Segment.io': {
              apiHost: config.apiHost ?? DEFAULT_API_HOST,
            },
          },
        },
      )
    },

    track(event: string, context: GlobalContext) {
      analytics.track(event, context)
    },

    page(name: string, context: GlobalContext) {
      analytics.page(name, context)
    },

    identify(id: string, traits: GlobalContext) {
      analytics.identify(id, traits)
    },

    identifyAnonymous(traits?: GlobalContext) {
      if (traits) {
        analytics.identify(traits)
      } else {
        analytics.identify()
      }
    },

    reset() {
      analytics.reset()
    },
  }
}
