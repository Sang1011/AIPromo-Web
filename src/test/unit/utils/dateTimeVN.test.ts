/// <reference types="jest" />

import {
  isoToLocal,
  localToIso,
  formatVN,
  formatShortVN,
  toISOLocal,
} from '../../../utils/dateTimeVN'

describe('dateTimeVN', () => {
  describe('isoToLocal', () => {
    it('should convert UTC ISO to VN local time', () => {
      const result = isoToLocal('2024-12-01T10:00:00Z')
      // VN is UTC+7, so 10:00 UTC = 17:00 VN
      expect(result).toBe('2024-12-01T17:00')
    })

    it('should handle midnight UTC', () => {
      const result = isoToLocal('2024-12-01T00:00:00Z')
      expect(result).toBe('2024-12-01T07:00')
    })

    it('should handle date change across timezone', () => {
      const result = isoToLocal('2024-12-01T20:00:00Z')
      expect(result).toBe('2024-12-02T03:00')
    })

    it('should return empty string for invalid input', () => {
      expect(isoToLocal('')).toBe('')
      expect(isoToLocal(null as any)).toBe('')
    })
  })

  describe('localToIso', () => {
    it('should convert VN local time to UTC ISO', () => {
      const result = localToIso('2024-12-01T17:00')
      // 17:00 VN = 10:00 UTC
      expect(result).toBe('2024-12-01T10:00:00.000Z')
    })

    it('should handle midnight VN time', () => {
      const result = localToIso('2024-12-01T07:00')
      expect(result).toBe('2024-12-01T00:00:00.000Z')
    })

    it('should handle date change across timezone', () => {
      const result = localToIso('2024-12-02T03:00')
      expect(result).toBe('2024-12-01T20:00:00.000Z')
    })
  })

  describe('formatVN', () => {
    it('should format UTC ISO to Vietnamese locale string', () => {
      const result = formatVN('2024-12-01T10:00:00Z')
      expect(result).toContain('2024')
      expect(result).toContain('12')
    })

    it('should return "—" for invalid input', () => {
      expect(formatVN('')).toBe('—')
      expect(formatVN(null as any)).toBe('—')
    })

    it('should include time in formatted string', () => {
      const result = formatVN('2024-12-01T10:30:00Z')
      expect(result).toMatch(/\d{2}:\d{2}/)
    })
  })

  describe('formatShortVN', () => {
    it('should format to short VN format', () => {
      const result = formatShortVN('2024-12-01T10:00:00Z')
      // Should be HH:mm DD-MM in VN time (17:00 01-12)
      expect(result).toMatch(/\d{2}:\d{2} \d{2}-\d{2}/)
    })

    it('should return "—" for invalid input', () => {
      expect(formatShortVN('')).toBe('—')
    })

    it('should handle date change', () => {
      const result = formatShortVN('2024-12-01T20:00:00Z')
      // 20:00 UTC = 03:00 next day VN
      expect(result).toMatch(/03:00 02-12/)
    })
  })

  describe('toISOLocal', () => {
    it('should format Date to local ISO string', () => {
      const date = new Date('2024-12-01T10:00:00Z')
      const result = toISOLocal(date)
      // Format: YYYY-MM-DDTHH:mm (local time)
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
    })

    it('should not include seconds', () => {
      const date = new Date('2024-12-01T10:30:45Z')
      const result = toISOLocal(date)
      // Format is YYYY-MM-DDTHH:mm, no seconds part
      expect(result.split(':').length).toBe(2)
    })
  })
})
