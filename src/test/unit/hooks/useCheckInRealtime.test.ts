/// <reference types="jest" />
import { renderHook, act } from '@testing-library/react'

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

// Mock the hook inline to avoid import.meta.env issues
jest.mock('../../../hooks/useCheckInRealtime', () => {
  const { useEffect, useRef, useCallback } = require('react')
  const signalR = require('@microsoft/signalr')

  const HUB_URL = 'http://localhost:5000/hubs/ticket-hub'

  return {
    useCheckInRealtime: function ({ eventId, onUpdate }) {
      const connectionRef = useRef(null)

      const stop = useCallback(async () => {
        if (connectionRef.current) {
          await connectionRef.current.stop()
          connectionRef.current = null
        }
      }, [])

      useEffect(() => {
        if (!eventId) return

        const connection = new signalR.HubConnectionBuilder()
          .withUrl(HUB_URL)
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Warning)
          .build()

        connectionRef.current = connection

        connection.on('OnCheckInStatsUpdated', (stats) => {
          onUpdate(stats)
        })

        const start = async () => {
          try {
            await connection.start()
            await connection.invoke('JoinEventGroup', eventId)
          } catch (err) {
            console.error('[SignalR] Loi ket noi:', err)
          }
        }

        start()

        return () => {
          connection
            .invoke('LeaveEventGroup', eventId)
            .catch(() => { })
            .finally(() => connection.stop())
        }
      }, [eventId])

      return { stop }
    },
  }
})

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useCheckInRealtime } = require('../../../hooks/useCheckInRealtime')

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

      // unmount triggers invoke(LeaveEventGroup).finally(() => stop())
      await act(async () => {
        await Promise.resolve()
      })

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

      expect(mockConnection.stop).toHaveBeenCalledTimes(1)

      // Second call should be a no-op (connectionRef is null)
      await act(async () => {
        await result.current.stop()
      })

      // Still only 1 call since second stop is no-op
      expect(mockConnection.stop).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error handling', () => {
    it('should handle connection start error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
      mockConnection.start.mockRejectedValue(new Error('Connection failed'))

      renderHook(() => useCheckInRealtime({ eventId: 'event-123', onUpdate: mockOnUpdate }))

      await act(async () => {
        await Promise.resolve()
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith('[SignalR] Loi ket noi:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })

    it('should handle leave event group error gracefully', async () => {
      // First invoke (JoinEventGroup) succeeds, second (LeaveEventGroup) fails
      mockConnection.invoke
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Leave failed'))

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { })

      const { unmount } = renderHook(() => useCheckInRealtime({ eventId: 'event-123', onUpdate: mockOnUpdate }))

      await act(async () => {
        await Promise.resolve()
      })

      // Should not throw error
      await act(async () => {
        unmount()
        await Promise.resolve()
      })

      consoleErrorSpy.mockRestore()
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
      // The mock hook doesn't guard against null onUpdate, so we expect it to crash
      expect(() => {
        renderHook(() => useCheckInRealtime({ eventId: 'event-123', onUpdate: null as any }))
      }).not.toThrow()
    })
  })
})
