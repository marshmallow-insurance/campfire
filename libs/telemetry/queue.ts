type QueuedCall = {
  method: string
  args: unknown[]
}

export class TelemetryQueue {
  private queue: QueuedCall[] = []
  private flushed = false

  enqueue(method: string, args: unknown[]) {
    if (this.flushed) return
    this.queue.push({ method, args })
  }

  flush(handler: (method: string, args: unknown[]) => void) {
    this.flushed = true
    for (const call of this.queue) {
      handler(call.method, call.args)
    }
    this.queue = []
  }

  drop() {
    this.flushed = true
    this.queue = []
  }

  get pending() {
    return this.queue.length
  }

  get isFlushed() {
    return this.flushed
  }
}
