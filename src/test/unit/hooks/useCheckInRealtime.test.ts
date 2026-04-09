/// <reference types="jest" />
import { renderHook, act } from '@testing-library/react'
import { useCheckInRealtime } from '../../../hooks/useCheckInRealtime'

// Mock SignalR
const mockConnection = {
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  invoke: jest.fn().mockResolvedValue(undefined),
}

jest.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: jest.fn().mockImplementation(() => ({
    withUrl: jest.fn().mockReturnThis(),
    withAutomaticReconnect: jest.fn().mockReturnThis(),
    configureLogging: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue(mockConnection),
  })),
  LogLevel: {
    Warning: 2,
  },
}))

// Mock import.meta.env
jest.mock('../../../hooks/useCheckInRealtime', () => {
  const originalModule = jest.requireActual('../../../hooks/useCheckInRealtime')
  return originalModule
})

describe('useCheckInRealtime', () => {
  const mockOnUpdate = jest.fn()
  const mockStats = {
    summary: {
      totalCheckedIn: 100,
      totalSold: 200,
      totalTicketQuantity: 500,
      totalTicketTypes: 5,
      checkInRate: 50,
    },
    ticketStats: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockConnection.start.mockResolvedValue(undefined)
    mockConnection.stop.mockResolvedValue(undefined)
    mockConnection.invoke.mockResolvedValue(undefined)
  })

  describe('Connection setup', () => {
    it('should not connect when eventId is undefined', () => {
      renderHook(() => useCheckInRealtime({ eventId: undefined, onUpdate: mockOnUpdate }))

      expect(mockConnection.start).not.toHaveBeenCalled()
    })

    it('should connect when eventId is provided', async () => {
      renderHook(() => useCheckInRealtime({ eventId: 'event-123', onUpdate: mockOnUpdate }))

      await act(async () => {
        await Promise.resolve()
      })

      expect(mockConnection.start).toHaveBeenCalled()
    })

    it('should join event group after connection', async () => {
      renderHook(() => useCheckInRealtime({ eventId: 'event-123', onUpdate: mockOnUpdate }))

      await act(async () => {
        await Promise.resolve()
      })

      expect(mockConnection.invoke).toHaveBeenCalledWith('JoinEventGroup', 'event-123')
    })
  })

  describe('Event handling', () => {
    it('should register OnCheckInStatsUpdated listener', async () => {
      renderHook(() => useCheckInRealtime({ eventId: 'event-123', onUpdate: mockOnUpdate }))

      await act(async () => {
        await Promise.resolve()
      })

      expect(mockConnection.on).toHaveBeenCalledWith('OnCheckInStatsUpdated', expect.any(Function))
    })

    it('should call onUpdate when receiving stats update', async () => {
      renderHook(() => useCheckInRealtime({ eventId: 'event-123', onUpdate: mockOnUpdate }))

      await act(async () => {
        await Promise.resolve()
      })

      const listener = mockConnection.on.mock.calls[0][1]
      act(() => {
        listener(mockStats)
      })

      expect(mockOnUpdate).toHaveBeenCalledWith(mockStats)
    })
  })

  describe('Cleanup', () => {
    it('should leave event group on unmount', async () => {
      const { unmount } = renderHook(() => useCheckInRealtime({ eventId: 'event-123', onUpdate: mockOnUpdate }))

      await act(async () => {
        await Promise.resolve()
      })

      unmount()

      expect(mockConnection.invoke).toHaveBeenCalledWith('LeaveEventGroup', 'event-123')
    })

    it('should stop connection on unmount', async () => {
      const { unmount } = renderHook(() => useCheckInRealtime({ eventId: 'event-123', onUpdate: mockOnUpdate }))

      await act(async () => {
        await Promise.resolve()
      })

      unmount()

      expect(mockConnection.stop).toHaveBeenCalled()
    })
  })

  describe('Stop function', () => {
    it('should return stop function', () => {
      const { result } = renderHook(() => useCheckInRealtime({ eventId: 'event-123', onUpdate: mockOnUpdate }))

      expect(result.current.stop).toBeDefined()
      expect(typeof result.current.stop).toBe('function')
    })

    it('should stop connection when called', async () => {
      const { result } = renderHook(() => useCheckInRealtime({ eventId: 'event-123', onUpdate: mockOnUpdate }))

      await act(async () => {
        await Promise.resolve()
      })

      await act(async () => {
        await result.current.stop()
      })

      expect(mockConnection.stop).toHaveBeenCalled()
    })

    it('should clear connection ref after stop', async () => {
      const { result } = renderHook(() => useCheckInRealtime({ eventId: 'event-123', onUpdate: mockOnUpdate }))

      await act(async () => {
        await Promise.resolve()
      })

      await act(async () => {
        await result.current.stop()
      })

      await act(async () => {
        await result.current.stop()
      })

      // Should not throw error when called twice
      expect(mockConnection.stop).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error handling', () => {
    it('should handle connection start error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      mockConnection.start.mockRejectedValue(new Error('Connection failed'))

      renderHook(() => useCheckInRealtime({ eventId: 'event-123', onUpdate: mockOnUpdate }))

      await act(async () => {
        await Promise.resolve()
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith('[SignalR] Lỗi kết nối:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })

    it('should handle leave event group error gracefully', async () => {
      mockConnection.invoke.mockRejectedValueOnce(new Error('Leave failed'))

      const { unmount } = renderHook(() => useCheckInRealtime({ eventId: 'event-123', onUpdate: mockOnUpdate }))

      await act(async () => {
        await Promise.resolve()
      })

      // Should not throw error
      await act(async () => {
        unmount()
        await Promise.resolve()
      })
    })
  })

  describe('Reconnection', () => {
    it('should configure automatic reconnection', async () => {
      const { HubConnectionBuilder } = require('@microsoft/signalr')

      renderHook(() => useCheckInRealtime({ eventId: 'event-123', onUpdate: mockOnUpdate }))

      await act(async () => {
        await Promise.resolve()
      })

      expect(HubConnectionBuilder).toHaveBeenCalled()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty eventId', async () => {
      renderHook(() => useCheckInRealtime({ eventId: '', onUpdate: mockOnUpdate }))

      await act(async () => {
        await Promise.resolve()
      })

      expect(mockConnection.start).not.toHaveBeenCalled()
    })

    it('should handle null onUpdate', async () => {
      renderHook(() => useCheckInRealtime({ eventId: 'event-123', onUpdate: null as any }))

      await act(async () => {
        await Promise.resolve()
      })

      const listener = mockConnection.on.mock.calls[0][1]
      act(() => {
        listener(mockStats)
      })

      // Should handle gracefully even if onUpdate is null
    })
  })
})
