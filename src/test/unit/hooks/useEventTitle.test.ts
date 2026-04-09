/// <reference types="jest" />
import { renderHook } from '@testing-library/react'
import { useEventTitle } from '../../../hooks/useEventTitle'

// Mock Redux
let mockEventState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    EVENT: mockEventState,
  }),
}))

describe('useEventTitle', () => {
  beforeEach(() => {
    mockEventState = { currentEvent: null }
  })

  describe('Return value', () => {
    it('should return event title when event exists', () => {
      mockEventState.currentEvent = { id: 'event-1', title: 'Test Event' }

      const { result } = renderHook(() => useEventTitle())

      expect(result.current).toBe('Test Event')
    })

    it('should return null when no event exists', () => {
      mockEventState.currentEvent = null

      const { result } = renderHook(() => useEventTitle())

      expect(result.current).toBeNull()
    })

    it('should return null when currentEvent is undefined', () => {
      mockEventState.currentEvent = undefined

      const { result } = renderHook(() => useEventTitle())

      expect(result.current).toBeNull()
    })

    it('should return null when event has no title', () => {
      mockEventState.currentEvent = { id: 'event-1' }

      const { result } = renderHook(() => useEventTitle())

      expect(result.current).toBeNull()
    })

    it('should return empty string when title is empty', () => {
      mockEventState.currentEvent = { id: 'event-1', title: '' }

      const { result } = renderHook(() => useEventTitle())

      expect(result.current).toBe('')
    })
  })
})
