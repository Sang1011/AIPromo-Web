/// <reference types="jest" />

import { formatDateTime } from '../../../utils/formatDateTime'

describe('formatDateTime', () => {
  describe('Basic formatting', () => {
    it('should format a valid date string correctly', () => {
      const result = formatDateTime('2024-12-01T10:30:00Z')
      // Format: "HH:MM --- Thứ X, DD/MM/YYYY"
      expect(result).toMatch(/\d{2}:\d{2} --- Thứ \d, \d{2}\/\d{2}\/\d{4}/)
    })

    it('should format a Date object', () => {
      const date = new Date('2024-12-01T10:30:00Z')
      const result = formatDateTime(date)
      expect(result).toMatch(/\d{2}:\d{2} --- Thứ \d, \d{2}\/\d{2}\/\d{4}/)
    })
  })

  describe('Edge cases', () => {
    it('should return "---" for null input', () => {
      expect(formatDateTime(null)).toBe('---')
    })

    it('should return "---" for undefined input', () => {
      expect(formatDateTime(undefined as any)).toBe('---')
    })

    it('should return "---" for empty string', () => {
      expect(formatDateTime('')).toBe('---')
    })

    it('should handle invalid date strings', () => {
      const result = formatDateTime('invalid-date')
      // Should still produce output but with NaN
      expect(result).toContain('---')
    })

    it('should handle different times of day', () => {
      const morning = formatDateTime('2024-12-01T08:00:00Z')
      const noon = formatDateTime('2024-12-01T12:00:00Z')
      const evening = formatDateTime('2024-12-01T20:00:00Z')

      expect(morning).toMatch(/08:00/)
      expect(noon).toMatch(/12:00/)
      expect(evening).toMatch(/20:00/)
    })

    it('should handle midnight', () => {
      const result = formatDateTime('2024-12-01T00:00:00Z')
      expect(result).toMatch(/00:00/)
    })
  })

  describe('Vietnamese day names', () => {
    it('should include Vietnamese day name (Thứ)', () => {
      const result = formatDateTime('2024-12-01T10:00:00Z')
      expect(result).toContain('Thứ')
    })
  })
})
