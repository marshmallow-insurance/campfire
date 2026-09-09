import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import type { GlobalContext, Telemetry } from './types'

type AnyTelemetry = Telemetry<string, string>

const TelemetryContext = createContext<AnyTelemetry | null>(null)

export function TelemetryProvider({
  telemetry,
  children,
}: {
  telemetry: AnyTelemetry
  children: ReactNode
}) {
  return createElement(
    TelemetryContext.Provider,
    { value: telemetry },
    children,
  )
}

export function useTelemetry(): AnyTelemetry {
  const ctx = useContext(TelemetryContext)
  if (!ctx) {
    throw new Error('useTelemetry must be used within a TelemetryProvider')
  }
  return ctx
}

export function usePageViewTracking(
  pageName: string,
  context?: GlobalContext & { proposalId?: string },
) {
  const telemetry = useTelemetry()
  const hasBeenSentRef = useRef(false)

  useEffect(() => {
    telemetry.setGlobalContext({ page: pageName })

    return () => {
      telemetry.setGlobalContext({ page: null })
      telemetry.setGlobalContext({ modal: null })
    }
  }, [pageName, telemetry])

  useEffect(() => {
    if (hasBeenSentRef.current) return
    hasBeenSentRef.current = true
    telemetry.page(pageName, {
      page: pageName,
      ...context,
    })
  }, [])
}

export function useEventTracking() {
  const telemetry = useTelemetry()

  return (event: string, context?: GlobalContext) => {
    telemetry.track(event, context)
  }
}
