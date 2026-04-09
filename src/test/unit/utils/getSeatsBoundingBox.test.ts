/// <reference types="jest" />

import { getSeatsBoundingBox } from '../../../utils/getSeatBoundingBox'
import type { Seat } from '../../../types/config/seatmap'

describe('getSeatsBoundingBox', () => {
  const createSeat = (overrides: Partial<Seat> = {}): Seat => ({
    id: `seat-${overrides.id || '1'}`,
    sectionId: overrides.sectionId || 'section-1',
    row: 'A',
    number: 1,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    width: overrides.width ?? 20,
    height: overrides.height ?? 20,
    rotation: 0,
    fill: '#000000',
    status: 'available',
    ...overrides,
  })

  describe('Basic functionality', () => {
    it('should calculate bounding box for single seat', () => {
      const seats: Seat[] = [
        createSeat({ id: '1', x: 10, y: 20, width: 30, height: 40, sectionId: 'section-1' }),
      ]

      const result = getSeatsBoundingBox(seats, 'section-1')

      expect(result).not.toBeNull()
      expect(result).toEqual({
        minX: 10,
        minY: 20,
        maxX: 40, // x + width
        maxY: 60, // y + height
      })
    })

    it('should calculate bounding box for multiple seats', () => {
      const seats: Seat[] = [
        createSeat({ id: '1', x: 10, y: 10, width: 20, height: 20, sectionId: 'section-1' }),
        createSeat({ id: '2', x: 50, y: 30, width: 20, height: 20, sectionId: 'section-1' }),
        createSeat({ id: '3', x: 30, y: 60, width: 20, height: 20, sectionId: 'section-1' }),
      ]

      const result = getSeatsBoundingBox(seats, 'section-1')

      expect(result).toEqual({
        minX: 10,
        minY: 10,
        maxX: 70, // 50 + 20
        maxY: 80, // 60 + 20
      })
    })

    it('should only consider seats matching sectionId', () => {
      const seats: Seat[] = [
        createSeat({ id: '1', x: 10, y: 10, width: 20, height: 20, sectionId: 'section-1' }),
        createSeat({ id: '2', x: 100, y: 100, width: 20, height: 20, sectionId: 'section-2' }),
      ]

      const result = getSeatsBoundingBox(seats, 'section-1')

      expect(result).toEqual({
        minX: 10,
        minY: 10,
        maxX: 30,
        maxY: 30,
      })
    })
  })

  describe('Edge cases', () => {
    it('should return null for empty seats array', () => {
      const result = getSeatsBoundingBox([], 'section-1')
      expect(result).toBeNull()
    })

    it('should return null when no seats match sectionId', () => {
      const seats: Seat[] = [
        createSeat({ id: '1', sectionId: 'section-2' }),
        createSeat({ id: '2', sectionId: 'section-3' }),
      ]

      const result = getSeatsBoundingBox(seats, 'section-1')

      expect(result).toBeNull()
    })

    it('should handle seats with zero dimensions', () => {
      const seats: Seat[] = [
        createSeat({ id: '1', x: 10, y: 20, width: 0, height: 0, sectionId: 'section-1' }),
      ]

      const result = getSeatsBoundingBox(seats, 'section-1')

      expect(result).toEqual({
        minX: 10,
        minY: 20,
        maxX: 10, // x + 0
        maxY: 20, // y + 0
      })
    })

    it('should handle negative coordinates', () => {
      const seats: Seat[] = [
        createSeat({ id: '1', x: -50, y: -30, width: 20, height: 20, sectionId: 'section-1' }),
        createSeat({ id: '2', x: -10, y: -10, width: 20, height: 20, sectionId: 'section-1' }),
      ]

      const result = getSeatsBoundingBox(seats, 'section-1')

      expect(result).toEqual({
        minX: -50,
        minY: -30,
        maxX: 10, // -10 + 20
        maxY: 10, // -10 + 20
      })
    })
  })
})
