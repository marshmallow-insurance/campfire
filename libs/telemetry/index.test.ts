import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTelemetry } from './index'
import type { TelemetryAdapter, GlobalContext } from './types'

function createMockAdapter(
  overrides?: Partial<TelemetryAdapter>,
): TelemetryAdapter {
  return {
    init: vi.fn().mockResolvedValue(undefined),
    track: vi.fn(),
    page: vi.fn(),
    identify: vi.fn(),
    identifyAnonymous: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    setContext: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  }
}

vi.mock('./adapters/segment', () => ({
  createSegmentAdapter: vi.fn(),
}))

vi.mock('./adapters/datadog', () => ({
  createDatadogAdapter: vi.fn(),
}))

vi.mock('./adapters/braze', () => ({
  createBrazeAdapter: vi.fn(),
}))

vi.mock('./adapters/intercom', () => ({
  createIntercomAdapter: vi.fn(),
}))

vi.mock('./adapters/sentry', () => ({
  createSentryAdapter: vi.fn(),
}))

describe('createTelemetry', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('creates a telemetry instance with all facade methods', () => {
    const telemetry = createTelemetry({ enabled: false })

    expect(telemetry.init).toBeDefined()
    expect(telemetry.track).toBeDefined()
    expect(telemetry.page).toBeDefined()
    expect(telemetry.identify).toBeDefined()
    expect(telemetry.identifyAnonymous).toBeDefined()
    expect(telemetry.error).toBeDefined()
    expect(telemetry.warn).toBeDefined()
    expect(telemetry.info).toBeDefined()
    expect(telemetry.setGlobalContext).toBeDefined()
    expect(telemetry.reset).toBeDefined()
  })

  it('logs to console when disabled', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const telemetry = createTelemetry({ enabled: false })

    telemetry.track('testEvent' as string, { key: 'value' })

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Telemetry:track] testEvent',
      expect.objectContaining({ key: 'value' }),
    )

    consoleSpy.mockRestore()
  })

  it('logs errors to console.error when disabled', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const telemetry = createTelemetry({ enabled: false })

    telemetry.error('Something broke', { page: 'home' })

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Telemetry:error] Something broke',
      expect.objectContaining({ page: 'home' }),
    )

    consoleSpy.mockRestore()
  })

  it('queues calls before init and flushes after', async () => {
    const mockAdapter = createMockAdapter()

    const { createSegmentAdapter } = await import('./adapters/segment')
    vi.mocked(createSegmentAdapter).mockResolvedValue(mockAdapter)

    const telemetry = createTelemetry({
      segment: { key: 'test-key' },
    })

    telemetry.track('earlyEvent' as string, { queued: true })

    expect(mockAdapter.track).not.toHaveBeenCalled()

    await telemetry.init()

    expect(mockAdapter.track).toHaveBeenCalledWith(
      'earlyEvent',
      expect.objectContaining({ queued: true }),
    )
  })

  it('dispatches to all configured adapters after init', async () => {
    const segmentAdapter = createMockAdapter()
    const datadogAdapter = createMockAdapter()

    const { createSegmentAdapter } = await import('./adapters/segment')
    const { createDatadogAdapter } = await import('./adapters/datadog')
    vi.mocked(createSegmentAdapter).mockResolvedValue(segmentAdapter)
    vi.mocked(createDatadogAdapter).mockResolvedValue(datadogAdapter)

    const telemetry = createTelemetry({
      segment: { key: 'test-key' },
      datadog: {
        applicationId: 'app-id',
        clientToken: 'token',
        service: 'test',
        env: 'test',
      },
    })

    await telemetry.init()
    telemetry.track('clickButton' as string, { id: 'submit' })

    expect(segmentAdapter.track).toHaveBeenCalledWith(
      'clickButton',
      expect.objectContaining({ id: 'submit' }),
    )
    expect(datadogAdapter.track).toHaveBeenCalledWith(
      'clickButton',
      expect.objectContaining({ id: 'submit' }),
    )
  })

  it('includes global context in all events', async () => {
    const mockAdapter = createMockAdapter()

    const { createSegmentAdapter } = await import('./adapters/segment')
    vi.mocked(createSegmentAdapter).mockResolvedValue(mockAdapter)

    const telemetry = createTelemetry({
      segment: { key: 'test-key' },
      globalContext: { productName: 'CAR_FINANCE' },
    })

    await telemetry.init()
    telemetry.track('testEvent' as string, { extra: 'data' })

    expect(mockAdapter.track).toHaveBeenCalledWith(
      'testEvent',
      expect.objectContaining({ productName: 'CAR_FINANCE', extra: 'data' }),
    )
  })

  it('promotes identify traits to global context when configured', async () => {
    const mockAdapter = createMockAdapter()

    const { createSegmentAdapter } = await import('./adapters/segment')
    vi.mocked(createSegmentAdapter).mockResolvedValue(mockAdapter)

    const telemetry = createTelemetry({
      segment: { key: 'test-key' },
      identify: {
        promoteToGlobalContext: ['proposalId', 'customerId'],
      },
    })

    await telemetry.init()
    telemetry.identify('user-123', {
      proposalId: 'prop-456',
      customerId: 'cust-789',
      email: 'test@example.com',
    })

    telemetry.track('nextEvent' as string)

    expect(mockAdapter.track).toHaveBeenCalledWith(
      'nextEvent',
      expect.objectContaining({
        proposalId: 'prop-456',
        customerId: 'cust-789',
      }),
    )
  })

  it('resets context and calls adapter reset', async () => {
    const mockAdapter = createMockAdapter()

    const { createSegmentAdapter } = await import('./adapters/segment')
    vi.mocked(createSegmentAdapter).mockResolvedValue(mockAdapter)

    const telemetry = createTelemetry({
      segment: { key: 'test-key' },
      globalContext: { productName: 'CAR_FINANCE' },
    })

    await telemetry.init()
    telemetry.setGlobalContext({ proposalId: 'prop-123' })
    telemetry.reset()

    expect(mockAdapter.reset).toHaveBeenCalled()

    telemetry.track('afterReset' as string)

    expect(mockAdapter.track).toHaveBeenCalledWith(
      'afterReset',
      expect.objectContaining({ productName: 'CAR_FINANCE' }),
    )
    expect(mockAdapter.track).toHaveBeenCalledWith(
      'afterReset',
      expect.not.objectContaining({ proposalId: 'prop-123' }),
    )
  })

  it('runs enrichers on every event', async () => {
    const mockAdapter = createMockAdapter()

    const { createSegmentAdapter } = await import('./adapters/segment')
    vi.mocked(createSegmentAdapter).mockResolvedValue(mockAdapter)

    const enricher = (_event: string, ctx: GlobalContext): GlobalContext => ({
      ...ctx,
      enriched: true,
    })

    const telemetry = createTelemetry({
      segment: { key: 'test-key' },
      enrichers: [enricher],
    })

    await telemetry.init()
    telemetry.track('testEvent' as string)

    expect(mockAdapter.track).toHaveBeenCalledWith(
      'testEvent',
      expect.objectContaining({ enriched: true }),
    )
  })

  it('skips init when disabled', async () => {
    const { createSegmentAdapter } = await import('./adapters/segment')

    const telemetry = createTelemetry({
      enabled: false,
      segment: { key: 'test-key' },
    })

    await telemetry.init()

    expect(createSegmentAdapter).not.toHaveBeenCalled()
  })
})
