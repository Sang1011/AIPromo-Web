/// <reference types="jest" />

import { fmtMoneyVND } from '../../../utils/fmtMoneyVND'

describe('fmtMoneyVND', () => {
  describe('Basic formatting', () => {
    it('should format zero correctly', () => {
      expect(fmtMoneyVND(0)).toBe('0')
    })

    it('should format numbers less than 1000', () => {
      expect(fmtMoneyVND(500)).toBe('500 đồng')
      expect(fmtMoneyVND(999)).toBe('999 đồng')
    })

    it('should format thousands correctly', () => {
      expect(fmtMoneyVND(1000)).toBe('1.0 nghìn')
      expect(fmtMoneyVND(5000)).toBe('5.0 nghìn')
      expect(fmtMoneyVND(999999)).toBe('1000.0 nghìn')
    })

    it('should format millions correctly', () => {
      expect(fmtMoneyVND(1000000)).toBe('1.0 triệu')
      expect(fmtMoneyVND(5500000)).toBe('5.5 triệu')
      expect(fmtMoneyVND(999999999)).toBe('1000.0 triệu')
    })

    it('should format billions correctly', () => {
      expect(fmtMoneyVND(1000000000)).toBe('1.0 tỷ')
      expect(fmtMoneyVND(1500000000)).toBe('1.5 tỷ')
      expect(fmtMoneyVND(2000000000)).toBe('2.0 tỷ')
    })
  })

  describe('Edge cases', () => {
    it('should handle negative numbers', () => {
      expect(fmtMoneyVND(-1000)).toBe('-1.0 nghìn')
      expect(fmtMoneyVND(-1000000)).toBe('-1.0 triệu')
      expect(fmtMoneyVND(-1000000000)).toBe('-1.0 tỷ')
    })

    it('should handle decimal numbers', () => {
      expect(fmtMoneyVND(1050000)).toBe('1.1 triệu')
      expect(fmtMoneyVND(1040000)).toBe('1.0 triệu')
    })

    it('should handle very large numbers', () => {
      expect(fmtMoneyVND(1000000000000)).toBe('1000.0 tỷ')
    })

    it('should round to 1 decimal place', () => {
      expect(fmtMoneyVND(1234567)).toBe('1.2 triệu')
      expect(fmtMoneyVND(1284567)).toBe('1.3 triệu')
    })
  })

  describe('Boundary values', () => {
    it('should handle boundary between đồng and nghìn', () => {
      expect(fmtMoneyVND(999)).toBe('999 đồng')
      expect(fmtMoneyVND(1000)).toBe('1.0 nghìn')
    })

    it('should handle boundary between nghìn and triệu', () => {
      expect(fmtMoneyVND(999999)).toBe('1000.0 nghìn')
      expect(fmtMoneyVND(1000000)).toBe('1.0 triệu')
    })

    it('should handle boundary between triệu and tỷ', () => {
      expect(fmtMoneyVND(999999999)).toBe('1000.0 triệu')
      expect(fmtMoneyVND(1000000000)).toBe('1.0 tỷ')
    })
  })
})
