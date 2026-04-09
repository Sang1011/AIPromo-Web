/// <reference types="jest" />

import { validateSeatMap } from '../../../utils/validateSeatMap'
import type { Area, Seat } from '../../../types/config/seatmap'

describe('validateSeatMap', () => {
  const createArea = (overrides: Partial<Area> = {}): Area => ({
    id: `area-${overrides.id || '1'}`,
    name: overrides.name || 'Test Area',
    type: 'rect',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    fill: '#cccccc',
    stroke: '#000000',
    isAreaType: true,
    ticketTypeId: overrides.ticketTypeId || 'ticket-1',
    price: 100000,
    draggable: false,
    ...overrides,
  })

  const createSeat = (overrides: Partial<Seat> = {}): Seat => ({
    id: `seat-${overrides.id || '1'}`,
    sectionId: overrides.sectionId || 'area-1',
    row: 'A',
    number: 1,
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    status: 'available',
    ...overrides,
  })

  describe('Rule 1: No duplicate ticketTypeId', () => {
    it('should pass when all areas have unique ticketTypeId', () => {
      const areas: Area[] = [
        createArea({ id: '1', ticketTypeId: 'ticket-1' }),
        createArea({ id: '2', ticketTypeId: 'ticket-2' }),
      ]
      const seats: Seat[] = []

      const result = validateSeatMap(areas, seats)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail when two areas have same ticketTypeId', () => {
      const areas: Area[] = [
        createArea({ id: '1', name: 'Area 1', ticketTypeId: 'ticket-1' }),
        createArea({ id: '2', name: 'Area 2', ticketTypeId: 'ticket-1' }),
      ]
      const seats: Seat[] = []

      const result = validateSeatMap(areas, seats)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('trùng lặp')
      expect(result.errors[0].areaIds).toContain('area-1')
      expect(result.errors[0].areaIds).toContain('area-2')
    })

    it('should skip areas without ticketTypeId', () => {
      const areas: Area[] = [
        createArea({ id: '1', ticketTypeId: '' }),
        createArea({ id: '2', ticketTypeId: '' }),
      ]
      const seats: Seat[] = []

      const result = validateSeatMap(areas, seats)

      expect(result.valid).toBe(true)
    })
  })

  describe('Rule 2: All or nothing seat requirement', () => {
    it('should pass when all areas have seats', () => {
      const areas: Area[] = [
        createArea({ id: 'area-1', ticketTypeId: 'ticket-1' }),
        createArea({ id: 'area-2', ticketTypeId: 'ticket-2' }),
      ]
      const seats: Seat[] = [
        createSeat({ id: '1', sectionId: 'area-1' }),
        createSeat({ id: '2', sectionId: 'area-2' }),
      ]

      const result = validateSeatMap(areas, seats)

      expect(result.valid).toBe(true)
    })

    it('should pass when no areas have seats', () => {
      const areas: Area[] = [
        createArea({ id: 'area-1', ticketTypeId: 'ticket-1' }),
        createArea({ id: 'area-2', ticketTypeId: 'ticket-2' }),
      ]
      const seats: Seat[] = []

      const result = validateSeatMap(areas, seats)

      expect(result.valid).toBe(true)
    })

    it('should fail when only some areas have seats', () => {
      const areas: Area[] = [
        createArea({ id: 'area-1', name: 'Area 1', ticketTypeId: 'ticket-1' }),
        createArea({ id: 'area-2', name: 'Area 2', ticketTypeId: 'ticket-2' }),
      ]
      const seats: Seat[] = [
        createSeat({ id: '1', sectionId: 'area-1' }),
      ]

      const result = validateSeatMap(areas, seats)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('chưa có ghế')
      expect(result.errors[0].areaIds).toContain('area-2')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty areas array', () => {
      const result = validateSeatMap([], [])
      expect(result.valid).toBe(true)
    })

    it('should ignore non-area-type sections', () => {
      const areas: Area[] = [
        createArea({ id: '1', ticketTypeId: 'ticket-1', isAreaType: true }),
        createArea({ id: '2', ticketTypeId: 'ticket-1', isAreaType: false }),
      ]
      const seats: Seat[] = []

      const result = validateSeatMap(areas, seats)

      expect(result.valid).toBe(true)
    })
  })
})
