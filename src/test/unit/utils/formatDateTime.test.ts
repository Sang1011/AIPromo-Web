/// <reference types="jest" />

import { formatDateTime } from '../../../utils/formatDateTime'

describe('formatDateTime', () => {
  describe('Basic formatting', () => {
    it('should format a valid date string correctly', () => {
      const result = formatDateTime('2024-12-01T10:30:00Z')
      // Format: "HH:MM — Thứ X, DD/MM/YYYY" (local timezone)
      expect(result).toMatch(/\d{2}:\d{2} — .+, \d{2}\/\d{2}\/\d{4}/)
    })

    it('should format a Date object', () => {
      const date = new Date('2024-12-01T10:30:00Z')
      const result = formatDateTime(date)
      expect(result).toMatch(/\d{2}:\d{2} — .+, \d{2}\/\d{2}\/\d{4}/)
    })
  })

  describe('Edge cases', () => {
    it('should return "—" for null input', () => {
      expect(formatDateTime(null)).toBe('—')
    })

    it('should return "—" for undefined input', () => {
      expect(formatDateTime(undefined as any)).toBe('—')
    })

    it('should return "—" for empty string', () => {
      expect(formatDateTime('')).toBe('—')
    })

    it('should handle invalid date strings', () => {
      const result = formatDateTime('invalid-date')
      // Should still produce output but with NaN
      expect(result).toMatch(/NaN/)
    })

    it('should handle different times of day', () => {
      const morning = formatDateTime('2024-12-01T01:00:00Z')
      const noon = formatDateTime('2024-12-01T05:00:00Z')
      const evening = formatDateTime('2024-12-01T13:00:00Z')

      expect(morning).toMatch(/08:00/)
      expect(noon).toMatch(/12:00/)
      expect(evening).toMatch(/20:00/)
    })

    it('should handle midnight', () => {
      const result = formatDateTime('2024-12-01T07:00:00Z')
      expect(result).toMatch(/14:00/)
    })
  })

  describe('Vietnamese day names', () => {
    it('should include Vietnamese day name', () => {
      const result = formatDateTime('2024-12-01T10:00:00Z')
      expect(result).toMatch(/Chủ nhật|Thứ/)
    })
  })
})
