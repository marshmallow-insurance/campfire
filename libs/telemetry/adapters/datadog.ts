import type { TelemetryAdapter, GlobalContext, DatadogConfig } from '../types'

export async function createDatadogAdapter(
  config: DatadogConfig,
): Promise<TelemetryAdapter> {
  const { datadogRum } = await import('@datadog/browser-rum')
  const { datadogLogs } = await import('@datadog/browser-logs')

  return {
    async init() {
      datadogRum.init({
        applicationId: config.applicationId,
        clientToken: config.clientToken,
        service: config.service,
        env: config.env,
        site: config.site ?? 'datadoghq.eu',
        sessionSampleRate: config.sessionSampleRate ?? 100,
        sessionReplaySampleRate: 0,
        trackUserInteractions: config.trackUserInteractions ?? true,
        trackResources: true,
        trackLongTasks: true,
        defaultPrivacyLevel: 'allow',
        beforeSend: config.beforeSendRum as Parameters<
          typeof datadogRum.init
        >[0] extends { beforeSend?: infer B }
          ? B
          : never,
      })

      datadogLogs.init({
        clientToken: config.clientToken,
        service: config.service,
        env: config.env,
        site: config.site ?? 'datadoghq.eu',
        forwardErrorsToLogs: true,
        sessionSampleRate: 100,
        beforeSend: config.beforeSendLog as Parameters<
          typeof datadogLogs.init
        >[0] extends { beforeSend?: infer B }
          ? B
          : never,
      })
    },

    track(event: string, context: GlobalContext) {
      datadogRum.addAction(event, context)
    },

    page(name: string, context: GlobalContext) {
      datadogRum.addAction(`Viewed ${name} page`, context)
      datadogRum.setViewContext({ name, ...context })
    },

    identify(id: string, traits: GlobalContext) {
      const user = { id, ...traits }
      datadogRum.setUser(user)
      datadogLogs.setUser(user)
    },

    error(message: string, context: GlobalContext, error?: Error) {
      datadogRum.addError(error ?? new Error(message), {
        errorType: error?.name,
        message,
        ...context,
      })
      datadogLogs.logger.error(message, context, error)
    },

    warn(message: string, context: GlobalContext) {
      datadogLogs.logger.warn(message, context)
    },

    info(message: string, context: GlobalContext) {
      datadogRum.addAction(message, context)
      datadogLogs.logger.info(message, context)
    },

    setContext(context: GlobalContext) {
      datadogLogs.setGlobalContext(context)
      datadogRum.setGlobalContext(
        context as Parameters<typeof datadogRum.setGlobalContext>[0],
      )
    },

    reset() {
      datadogRum.clearUser()
      datadogLogs.clearUser()
    },
  }
}
