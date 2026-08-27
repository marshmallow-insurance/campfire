import { describe, it, expect, vi } from 'vitest'
import { TelemetryQueue } from './queue'

describe('TelemetryQueue', () => {
  it('buffers calls before flush', () => {
    const queue = new TelemetryQueue()

    queue.enqueue('track', ['event1', {}])
    queue.enqueue('page', ['home', {}])

    expect(queue.pending).toBe(2)
    expect(queue.isFlushed).toBe(false)
  })

  it('flushes buffered calls in order', () => {
    const queue = new TelemetryQueue()
    const handler = vi.fn()

    queue.enqueue('track', ['event1', { a: 1 }])
    queue.enqueue('page', ['home', { b: 2 }])
    queue.flush(handler)

    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenNthCalledWith(1, 'track', ['event1', { a: 1 }])
    expect(handler).toHaveBeenNthCalledWith(2, 'page', ['home', { b: 2 }])
    expect(queue.pending).toBe(0)
    expect(queue.isFlushed).toBe(true)
  })

  it('ignores enqueue after flush', () => {
    const queue = new TelemetryQueue()
    const handler = vi.fn()

    queue.flush(handler)
    queue.enqueue('track', ['late-event', {}])

    expect(queue.pending).toBe(0)
  })

  it('drops all pending calls', () => {
    const queue = new TelemetryQueue()

    queue.enqueue('track', ['event1', {}])
    queue.enqueue('track', ['event2', {}])
    queue.drop()

    expect(queue.pending).toBe(0)
    expect(queue.isFlushed).toBe(true)
  })
})
