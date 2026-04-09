/// <reference types="jest" />

import {
  validateEventTime,
  validateSession,
  getInvalidSessions,
  errorsToFieldMap,
} from '../../../utils/eventValidation'
import type { EventTimeWindow, SessionWindow, FieldError } from '../../../utils/eventValidation'

describe('eventValidation', () => {
  describe('validateEventTime', () => {
    it('should return no errors for valid event times', () => {
      const event: EventTimeWindow = {
        ticketSaleStartAt: '2024-12-01T00:00:00Z',
        ticketSaleEndAt: '2024-12-01T10:00:00Z',
        eventStartAt: '2024-12-01T12:00:00Z',
        eventEndAt: '2024-12-01T18:00:00Z',
      }

      const result = validateEventTime(event)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should error when ticketSaleStartAt is missing', () => {
      const event: Partial<EventTimeWindow> = {
        ticketSaleEndAt: '2024-12-01T10:00:00Z',
        eventStartAt: '2024-12-01T12:00:00Z',
        eventEndAt: '2024-12-01T18:00:00Z',
      }

      const result = validateEventTime(event)

      expect(result.errors.some(e => e.field === 'ticketSaleStartAt')).toBe(true)
    })

    it('should error when ticketSaleEndAt is missing', () => {
      const event: Partial<EventTimeWindow> = {
        ticketSaleStartAt: '2024-12-01T00:00:00Z',
        eventStartAt: '2024-12-01T12:00:00Z',
        eventEndAt: '2024-12-01T18:00:00Z',
      }

      const result = validateEventTime(event)

      expect(result.errors.some(e => e.field === 'ticketSaleEndAt')).toBe(true)
    })

    it('should error when eventStartAt is missing', () => {
      const event: Partial<EventTimeWindow> = {
        ticketSaleStartAt: '2024-12-01T00:00:00Z',
        ticketSaleEndAt: '2024-12-01T10:00:00Z',
        eventEndAt: '2024-12-01T18:00:00Z',
      }

      const result = validateEventTime(event)

      expect(result.errors.some(e => e.field === 'eventStartAt')).toBe(true)
    })

    it('should error when eventEndAt is missing', () => {
      const event: Partial<EventTimeWindow> = {
        ticketSaleStartAt: '2024-12-01T00:00:00Z',
        ticketSaleEndAt: '2024-12-01T10:00:00Z',
        eventStartAt: '2024-12-01T12:00:00Z',
      }

      const result = validateEventTime(event)

      expect(result.errors.some(e => e.field === 'eventEndAt')).toBe(true)
    })

    it('should error when ticketSaleStartAt >= ticketSaleEndAt', () => {
      const event: EventTimeWindow = {
        ticketSaleStartAt: '2024-12-01T12:00:00Z',
        ticketSaleEndAt: '2024-12-01T10:00:00Z',
        eventStartAt: '2024-12-01T14:00:00Z',
        eventEndAt: '2024-12-01T18:00:00Z',
      }

      const result = validateEventTime(event)

      expect(result.errors.some(e => e.field === 'ticketSaleEndAt')).toBe(true)
    })

    it('should error when ticketSaleEndAt > eventStartAt', () => {
      const event: EventTimeWindow = {
        ticketSaleStartAt: '2024-12-01T00:00:00Z',
        ticketSaleEndAt: '2024-12-01T14:00:00Z',
        eventStartAt: '2024-12-01T12:00:00Z',
        eventEndAt: '2024-12-01T18:00:00Z',
      }

      const result = validateEventTime(event)

      expect(result.errors.some(e => e.field === 'ticketSaleEndAt')).toBe(true)
    })

    it('should error when eventStartAt >= eventEndAt', () => {
      const event: EventTimeWindow = {
        ticketSaleStartAt: '2024-12-01T00:00:00Z',
        ticketSaleEndAt: '2024-12-01T10:00:00Z',
        eventStartAt: '2024-12-01T14:00:00Z',
        eventEndAt: '2024-12-01T12:00:00Z',
      }

      const result = validateEventTime(event)

      expect(result.errors.some(e => e.field === 'eventEndAt')).toBe(true)
    })
  })

  describe('validateSession', () => {
    it('should return no errors for valid session times', () => {
      const session: SessionWindow = {
        id: 'session-1',
        title: 'Session 1',
        startTime: '2024-12-01T12:00:00Z',
        endTime: '2024-12-01T14:00:00Z',
      }
      const event = {
        eventStartAt: '2024-12-01T10:00:00Z',
        eventEndAt: '2024-12-01T18:00:00Z',
      }

      const result = validateSession(session, event)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should error when session title is empty', () => {
      const session: SessionWindow = {
        id: 'session-1',
        title: '',
        startTime: '2024-12-01T12:00:00Z',
        endTime: '2024-12-01T14:00:00Z',
      }

      const result = validateSession(session)

      expect(result.errors.some(e => e.field === 'title')).toBe(true)
    })

    it('should error when session startTime < event start', () => {
      const session: SessionWindow = {
        id: 'session-1',
        title: 'Session 1',
        startTime: '2024-12-01T08:00:00Z',
        endTime: '2024-12-01T10:00:00Z',
      }
      const event = {
        eventStartAt: '2024-12-01T10:00:00Z',
        eventEndAt: '2024-12-01T18:00:00Z',
      }

      const result = validateSession(session, event)

      expect(result.errors.some(e => e.field === 'startTime')).toBe(true)
    })

    it('should error when session endTime > event end', () => {
      const session: SessionWindow = {
        id: 'session-1',
        title: 'Session 1',
        startTime: '2024-12-01T16:00:00Z',
        endTime: '2024-12-01T20:00:00Z',
      }
      const event = {
        eventStartAt: '2024-12-01T10:00:00Z',
        eventEndAt: '2024-12-01T18:00:00Z',
      }

      const result = validateSession(session, event)

      expect(result.errors.some(e => e.field === 'endTime')).toBe(true)
    })

    it('should error when session endTime <= startTime', () => {
      const session: SessionWindow = {
        id: 'session-1',
        title: 'Session 1',
        startTime: '2024-12-01T14:00:00Z',
        endTime: '2024-12-01T12:00:00Z',
      }

      const result = validateSession(session)

      expect(result.errors.some(e => e.field === 'endTime')).toBe(true)
    })
  })

  describe('getInvalidSessions', () => {
    it('should return no conflicts for all valid sessions', () => {
      const sessions: SessionWindow[] = [
        { id: 's1', title: 'S1', startTime: '2024-12-01T12:00:00Z', endTime: '2024-12-01T14:00:00Z' },
        { id: 's2', title: 'S2', startTime: '2024-12-01T15:00:00Z', endTime: '2024-12-01T17:00:00Z' },
      ]
      const event = {
        eventStartAt: '2024-12-01T10:00:00Z',
        eventEndAt: '2024-12-01T18:00:00Z',
      }

      const result = getInvalidSessions(sessions, event)

      expect(result.hasConflicts).toBe(false)
      expect(result.conflicts).toHaveLength(0)
    })

    it('should identify invalid sessions', () => {
      const sessions: SessionWindow[] = [
        { id: 's1', title: 'S1', startTime: '2024-12-01T08:00:00Z', endTime: '2024-12-01T10:00:00Z' },
        { id: 's2', title: 'S2', startTime: '2024-12-01T12:00:00Z', endTime: '2024-12-01T14:00:00Z' },
      ]
      const event = {
        eventStartAt: '2024-12-01T10:00:00Z',
        eventEndAt: '2024-12-01T18:00:00Z',
      }

      const result = getInvalidSessions(sessions, event)

      expect(result.hasConflicts).toBe(true)
      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0].id).toBe('s1')
    })

    it('should handle empty sessions array', () => {
      const sessions: SessionWindow[] = []
      const event = {
        eventStartAt: '2024-12-01T10:00:00Z',
        eventEndAt: '2024-12-01T18:00:00Z',
      }

      const result = getInvalidSessions(sessions, event)

      expect(result.hasConflicts).toBe(false)
    })
  })

  describe('errorsToFieldMap', () => {
    it('should convert errors array to field map', () => {
      const errors: FieldError<'name' | 'email'>[] = [
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Email is invalid' },
      ]

      const result = errorsToFieldMap(errors)

      expect(result).toEqual({
        name: 'Name is required',
        email: 'Email is invalid',
      })
    })

    it('should handle empty errors array', () => {
      const errors: FieldError<'name'>[] = []
      const result = errorsToFieldMap(errors)
      expect(result).toEqual({})
    })

    it('should use last error when duplicate fields exist', () => {
      const errors: FieldError<'name'>[] = [
        { field: 'name', message: 'First error' },
        { field: 'name', message: 'Second error' },
      ]

      const result = errorsToFieldMap(errors)

      expect(result.name).toBe('Second error')
    })
  })
})
