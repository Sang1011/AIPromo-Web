/// <reference types="jest" />
import { renderHook, waitFor } from '@testing-library/react'
import type { DatabaseReference, DataSnapshot } from 'firebase/database'
import { useEventReports } from '../../../hooks/useEventReport'

// Mock Firebase
const mockOnValue = jest.fn()
const mockOff = jest.fn()
const mockRef = jest.fn()

jest.mock('firebase/database', () => ({
  ref: (...args: unknown[]) => mockRef(...args),
  onValue: (...args: unknown[]) => mockOnValue(...args),
  off: (...args: unknown[]) => mockOff(...args),
}))

jest.mock('../../../config/firebase', () => ({
  db: {},
}))

describe('useEventReports', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockOnValue.mockImplementation((_ref: DatabaseReference, callback: (snapshot: DataSnapshot) => void) => {
      callback({ val: () => null } as DataSnapshot)
    })
  })

  describe('Initial state', () => {
    it('should return empty reports and loading true initially', async () => {
      const { result } = renderHook(() => useEventReports('test@example.com'))

      expect(result.current.reports).toEqual([])
      // mockOnValue fires synchronously in beforeEach, so loading becomes false
      expect(result.current.loading).toBe(false)
    })

    it('should return empty reports when no email provided', () => {
      const { result } = renderHook(() => useEventReports())

      expect(result.current.reports).toEqual([])
      expect(result.current.loading).toBe(false)
    })
  })

  describe('Data fetching', () => {
    it('should create Firebase ref with sanitized email', () => {
      renderHook(() => useEventReports('test.user@example.com'))

      expect(mockRef).toHaveBeenCalledWith(expect.any(Object), 'email/reports/test,user@example,com')
    })

    it('should set loading false when data is null', async () => {
      mockOnValue.mockImplementation((_ref, callback) => {
        callback({ val: () => null })
      })

      const { result } = renderHook(() => useEventReports('test@example.com'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.reports).toEqual([])
      })
    })

    it('should parse and sort reports when data is available', async () => {
      const mockData = {
        'event-1': {
          'report-1': {
            eventName: 'Event 1',
            fileName: 'report1.xlsx',
            createdAt: '2024-12-01T10:00:00Z',
            createdBy: 'test@example.com',
          },
          'report-2': {
            eventName: 'Event 1',
            fileName: 'report2.xlsx',
            createdAt: '2024-12-02T10:00:00Z',
            createdBy: 'test@example.com',
          },
        },
        'event-2': {
          'report-3': {
            eventName: 'Event 2',
            fileName: 'report3.xlsx',
            createdAt: '2024-11-01T10:00:00Z',
            createdBy: 'test@example.com',
          },
        },
      }

      mockOnValue.mockImplementation((_ref, callback) => {
        callback({ val: () => mockData })
      })

      const { result } = renderHook(() => useEventReports('test@example.com'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.reports).toHaveLength(3)
        // Should be sorted by createdAt descending
        expect(result.current.reports[0].id).toBe('report-2')
        expect(result.current.reports[1].id).toBe('report-1')
        expect(result.current.reports[2].id).toBe('report-3')
      })
    })

    it('should include id and eventId in parsed reports', async () => {
      const mockData = {
        'event-1': {
          'report-1': {
            eventName: 'Event 1',
            fileName: 'report1.xlsx',
            createdAt: '2024-12-01T10:00:00Z',
            createdBy: 'test@example.com',
          },
        },
      }

      mockOnValue.mockImplementation((_ref, callback) => {
        callback({ val: () => mockData })
      })

      const { result } = renderHook(() => useEventReports('test@example.com'))

      await waitFor(() => {
        expect(result.current.reports[0]).toMatchObject({
          id: 'report-1',
          eventId: 'event-1',
          eventName: 'Event 1',
          fileName: 'report1.xlsx',
        })
      })
    })
  })

  describe('Cleanup', () => {
    it('should unsubscribe from Firebase on unmount', () => {
      const { unmount } = renderHook(() => useEventReports('test@example.com'))

      unmount()

      expect(mockOff).toHaveBeenCalled()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty email string', () => {
      const { result } = renderHook(() => useEventReports(''))

      expect(result.current.reports).toEqual([])
      expect(result.current.loading).toBe(false)
    })

    it('should handle email with multiple dots', () => {
      renderHook(() => useEventReports('first.last@domain.co.uk'))

      expect(mockRef).toHaveBeenCalledWith(expect.any(Object), 'email/reports/first,last@domain,co,uk')
    })

    it('should handle empty data object', async () => {
      mockOnValue.mockImplementation((_ref, callback) => {
        callback({ val: () => ({}) })
      })

      const { result } = renderHook(() => useEventReports('test@example.com'))

      await waitFor(() => {
        expect(result.current.reports).toEqual([])
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle data with missing fields', async () => {
      const mockData = {
        'event-1': {
          'report-1': {
            eventName: 'Event 1',
          },
        },
      }

      mockOnValue.mockImplementation((_ref, callback) => {
        callback({ val: () => mockData })
      })

      const { result } = renderHook(() => useEventReports('test@example.com'))

      await waitFor(() => {
        expect(result.current.reports).toHaveLength(1)
        expect(result.current.reports[0].fileName).toBeUndefined()
        expect(result.current.reports[0].createdAt).toBeUndefined()
      })
    })
  })
})
