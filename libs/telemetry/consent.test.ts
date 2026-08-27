import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readConsent, isVendorConsented } from './consent'

describe('readConsent', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
  })

  it('returns null when no consent stored', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)

    const result = readConsent({ storageKey: 'tcmConsent', vendorMapping: {} })

    expect(result).toBeNull()
  })

  it('parses stored consent purposes', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(
      JSON.stringify({
        purposes: { Analytics: true, Advertising: false, Functional: true },
        confirmed: true,
      }),
    )

    const result = readConsent({ storageKey: 'tcmConsent', vendorMapping: {} })

    expect(result).toEqual({
      Analytics: true,
      Advertising: false,
      Functional: true,
    })
  })

  it('returns null for invalid JSON', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('not json')

    const result = readConsent({ storageKey: 'tcmConsent', vendorMapping: {} })

    expect(result).toBeNull()
  })
})

describe('isVendorConsented', () => {
  it('returns true when no consent data exists', () => {
    expect(isVendorConsented(null, { segment: 'Analytics' }, 'segment')).toBe(
      true,
    )
  })

  it('returns true when vendor has no mapping', () => {
    const purposes = { Analytics: false }
    expect(isVendorConsented(purposes, {}, 'segment')).toBe(true)
  })

  it('returns true when purpose is consented', () => {
    const purposes = { Analytics: true }
    expect(
      isVendorConsented(purposes, { segment: 'Analytics' }, 'segment'),
    ).toBe(true)
  })

  it('returns false when purpose is not consented', () => {
    const purposes = { Advertising: false }
    expect(isVendorConsented(purposes, { braze: 'Advertising' }, 'braze')).toBe(
      false,
    )
  })
})
