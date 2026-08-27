import type { Telemetry } from './types'

type MockFn = ReturnType<(typeof import('vitest'))['vi']['fn']>

export type TelemetryMock = {
  [K in keyof Telemetry<string, string>]: MockFn
}

export function createTelemetryMock(vi: { fn: () => MockFn }): TelemetryMock {
  return {
    init: vi.fn(),
    track: vi.fn(),
    page: vi.fn(),
    identify: vi.fn(),
    identifyAnonymous: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    setGlobalContext: vi.fn(),
    reset: vi.fn(),
  }
}
