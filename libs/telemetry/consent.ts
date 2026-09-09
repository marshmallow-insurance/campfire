import type { ConsentConfig } from './types'

interface TranscendConsent {
  purposes: Record<string, boolean>
  confirmed?: boolean
}

export function readConsent(
  config: ConsentConfig,
): Record<string, boolean> | null {
  try {
    const raw = localStorage.getItem(config.storageKey)
    if (!raw) return null

    const parsed = JSON.parse(raw) as TranscendConsent
    if (!parsed.purposes) return null

    return parsed.purposes
  } catch {
    return null
  }
}

export function isVendorConsented(
  purposes: Record<string, boolean> | null,
  vendorMapping: ConsentConfig['vendorMapping'],
  vendor: string,
): boolean {
  if (!purposes) return true
  const purpose = vendorMapping[vendor as keyof typeof vendorMapping]
  if (!purpose) return true
  return purposes[purpose] !== false
}
