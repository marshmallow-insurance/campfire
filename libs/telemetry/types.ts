export type ContextValue = string | number | boolean | null | undefined | object

export type GlobalContext = Record<string, ContextValue>

export interface TelemetryAdapter {
  init(): Promise<void>
  track(event: string, context: GlobalContext): void
  page(name: string, context: GlobalContext): void
  identify(id: string, traits: GlobalContext): void
  identifyAnonymous?(traits?: GlobalContext): void
  error?(message: string, context: GlobalContext, error?: Error): void
  warn?(message: string, context: GlobalContext): void
  info?(message: string, context: GlobalContext): void
  setContext?(context: GlobalContext): void
  reset(): void
}

export interface ConsentConfig {
  storageKey: string
  vendorMapping: Partial<
    Record<'segment' | 'braze' | 'datadog' | 'intercom' | 'sentry', string>
  >
}

export interface AttributionParam {
  param: string
  as?: string
  persist?: 'local' | 'session' | 'cookie'
  maxAgeDays?: number
}

export type Enricher = (event: string, context: GlobalContext) => GlobalContext

export interface SegmentConfig {
  key: string
  apiHost?: string
}

export interface BrazeConfig {
  appId: string
  endpoint: string
  pagePrefix?: string
  enableLogging?: boolean
}

export interface DatadogConfig {
  applicationId: string
  clientToken: string
  service: string
  env: string
  site?: string
  sessionSampleRate?: number
  trackUserInteractions?: boolean
  beforeSendRum?: (event: unknown) => boolean | void
  beforeSendLog?: (event: unknown) => boolean | void
}

export interface IntercomConfig {
  appId: string
  hideDefaultLauncher?: boolean
}

export interface SentryConfig {
  dsn: string
  environment?: string
  tracesSampleRate?: number
}

export interface IdentifyConfig {
  promoteToGlobalContext?: string[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface TelemetryConfig<TTrack extends string, TPage extends string> {
  enabled?: boolean
  globalContext?: GlobalContext
  segment?: SegmentConfig
  braze?: BrazeConfig
  datadog?: DatadogConfig
  intercom?: IntercomConfig
  sentry?: SentryConfig
  attribution?: AttributionParam[]
  enrichers?: Enricher[]
  consent?: ConsentConfig
  identify?: IdentifyConfig
}

export interface Telemetry<TTrack extends string, TPage extends string> {
  init(): Promise<void>
  track(event: TTrack, context?: GlobalContext): void
  page(page: TPage, context?: GlobalContext): void
  identify(id: string, traits?: GlobalContext): void
  identifyAnonymous(traits?: GlobalContext): void
  error(message: string, context?: GlobalContext, error?: unknown): void
  warn(message: string, context?: GlobalContext): void
  info(message: string, context?: GlobalContext): void
  setGlobalContext(context: GlobalContext): void
  reset(): void
}
