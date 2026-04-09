/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CheckInPage from '../../../pages/Organizer/CheckInPage'

// ============================================================================
// MOCKS
// ============================================================================

// Mock react-router-dom
const mockUseParams = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
}))

// Mock Redux
const mockDispatch = jest.fn()
let mockEventState: any = {}
let mockTicketingState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    EVENT: mockEventState,
    TICKETING: mockTicketingState,
  }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../store/eventSlice', () => ({
  fetchSessions: jest.fn((eventId) => ({ type: 'EVENT/fetchSessions', payload: eventId })),
}))

jest.mock('../../store/ticketingSlice', () => ({
  fetchCheckInOrganizerStats: jest.fn((params) => ({
    type: 'TICKETING/fetchCheckInOrganizerStats',
    payload: params,
  })),
}))

// Mock hooks
jest.mock('../../hooks/useCheckInRealtime', () => ({
  useCheckInRealtime: jest.fn(),
}))

// Mock child components
jest.mock('../../components/Organizer/checkin/CheckinOverview', () => ({
  __esModule: true,
  default: ({ summary }: { summary: any }) => (
    <div data-testid="checkin-overview">
      <span data-testid="total-tickets">{summary?.totalTickets ?? 0}</span>
    </div>
  ),
}))

jest.mock('../../components/Organizer/ticket/TicketSummaryTable', () => ({
  __esModule: true,
  default: ({ ticketStats }: { ticketStats: any }) => (
    <div data-testid="ticket-summary-table">
      <span data-testid="ticket-types-count">{ticketStats?.length ?? 0}</span>
    </div>
  ),
}))

jest.mock('../../components/Organizer/overview/ticketTypeBarChart', () => ({
  __esModule: true,
  default: ({ breakdown }: { breakdown: any }) => (
    <div data-testid="ticket-type-chart">
      <span data-testid="breakdown-count">{breakdown?.length ?? 0}</span>
    </div>
  ),
}))

jest.mock('../../components/Organizer/checkin/CheckinPageSekeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="checkin-skeleton" className="animate-pulse">Loading...</div>,
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockSession = (overrides = {}) => ({
  id: 'session-1',
  title: 'Evening Show',
  startTime: '2024-12-01T18:00:00Z',
  endTime: '2024-12-01T21:00:00Z',
  ...overrides,
})

const createMockCheckInStats = (overrides: { summary?: any; ticketStats?: any[] } = {}) => ({
  summary: {
    totalTickets: 500,
    checkedInTickets: 350,
    checkInRate: 70,
    ...overrides.summary,
  },
  ticketStats: [
    {
      ticketTypeId: 'vip',
      ticketTypeName: 'VIP',
      sold: 100,
      checkedIn: 80,
      ...overrides.ticketStats?.[0],
    },
    {
      ticketTypeId: 'standard',
      ticketTypeName: 'Standard',
      sold: 400,
      checkedIn: 270,
      ...overrides.ticketStats?.[1],
    },
  ],
})

// ============================================================================
// TESTS
// ============================================================================

describe('CheckInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseParams.mockReturnValue({ eventId: 'event-1' })

    mockEventState = {
      sessions: [],
    }

    mockTicketingState = {
      loading: false,
      checkInStats: null,
    }

    mockDispatch.mockResolvedValue({})

    const { useCheckInRealtime } = require('../../hooks/useCheckInRealtime')
    useCheckInRealtime.mockReturnValue(undefined)
  })

  // --------------------------------------------------------------------------
  // 1. Render
  // --------------------------------------------------------------------------
  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<CheckInPage />)
      })

      expect(screen.queryByTestId('checkin-skeleton')).not.toBeInTheDocument()
    })

    it('should show loading skeleton when loading', async () => {
      mockTicketingState.loading = true

      render(<CheckInPage />)

      expect(screen.getByTestId('checkin-skeleton')).toBeInTheDocument()
    })

    it('should show empty state when no stats available', async () => {
      mockEventState.sessions = [createMockSession()]
      mockTicketingState.checkInStats = null

      await act(async () => {
        render(<CheckInPage />)
      })

      expect(screen.getByText('Vui lòng chọn một buổi diễn.')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 2. UI Elements
  // --------------------------------------------------------------------------
  describe('UI Elements', () => {
    it('should render session selector when sessions exist', async () => {
      mockEventState.sessions = [
        createMockSession({ id: 'session-1', title: 'Evening Show' }),
        createMockSession({ id: 'session-2', title: 'Morning Show' }),
      ]

      await act(async () => {
        render(<CheckInPage />)
      })

      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })

    it('should show disabled option when no sessions', async () => {
      mockEventState.sessions = []

      await act(async () => {
        render(<CheckInPage />)
      })

      expect(screen.getByText('Không có buổi diễn')).toBeInTheDocument()
    })

    it('should render checkin overview when stats exist', async () => {
      mockEventState.sessions = [createMockSession()]
      mockTicketingState.checkInStats = createMockCheckInStats()

      await act(async () => {
        render(<CheckInPage />)
      })

      expect(screen.getByTestId('checkin-overview')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 3. API Calls
  // --------------------------------------------------------------------------
  describe('API Calls', () => {
    it('should call fetchSessions when eventId is provided', async () => {
      const { fetchSessions } = require('../../store/eventSlice')

      await act(async () => {
        render(<CheckInPage />)
      })

      expect(mockDispatch).toHaveBeenCalledWith(fetchSessions('event-1'))
    })

    it('should call fetchCheckInOrganizerStats when session is selected', async () => {
      const { fetchCheckInOrganizerStats } = require('../../store/ticketingSlice')
      mockEventState.sessions = [createMockSession()]

      await act(async () => {
        render(<CheckInPage />)
      })

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchCheckInOrganizerStats({
            eventId: 'event-1',
            sessionId: 'session-1',
          })
        )
      })
    })
  })

  // --------------------------------------------------------------------------
  // 4. User Interactions
  // --------------------------------------------------------------------------
  describe('User Interactions', () => {
    it('should change session when selecting different option', async () => {
      mockEventState.sessions = [
        createMockSession({ id: 'session-1', title: 'Evening Show' }),
        createMockSession({ id: 'session-2', title: 'Morning Show' }),
      ]
      mockTicketingState.checkInStats = createMockCheckInStats()

      await act(async () => {
        render(<CheckInPage />)
      })

      const select = screen.getByRole('combobox')
      await userEvent.selectOptions(select, 'session-2')

      expect(select).toHaveValue('session-2')
    })

    it('should reset stats when changing session', async () => {
      const { useCheckInRealtime } = require('../../hooks/useCheckInRealtime')
      useCheckInRealtime.mockImplementation(({ onUpdate }: { onUpdate: (stats: any) => void }) => {
        onUpdate(createMockCheckInStats())
      })

      mockEventState.sessions = [
        createMockSession({ id: 'session-1', title: 'Evening Show' }),
        createMockSession({ id: 'session-2', title: 'Morning Show' }),
      ]
      mockTicketingState.checkInStats = createMockCheckInStats()

      await act(async () => {
        render(<CheckInPage />)
      })

      const select = screen.getByRole('combobox')
      await userEvent.selectOptions(select, 'session-2')

      // Stats should be reset
      await waitFor(() => {
        expect(screen.queryByTestId('checkin-overview')).not.toBeInTheDocument()
      })
    })
  })

  // --------------------------------------------------------------------------
  // 5. Data Display
  // --------------------------------------------------------------------------
  describe('Data Display', () => {
    it('should display checkin stats correctly', async () => {
      mockEventState.sessions = [createMockSession()]
      mockTicketingState.checkInStats = createMockCheckInStats()

      await act(async () => {
        render(<CheckInPage />)
      })

      expect(screen.getByTestId('total-tickets')).toHaveTextContent('500')
      expect(screen.getByTestId('ticket-types-count')).toHaveTextContent('2')
      expect(screen.getByTestId('breakdown-count')).toHaveTextContent('2')
    })

    it('should display session titles in dropdown', async () => {
      mockEventState.sessions = [
        createMockSession({ id: 'session-1', title: 'Evening Show' }),
        createMockSession({ id: 'session-2', title: 'Morning Show' }),
      ]

      await act(async () => {
        render(<CheckInPage />)
      })

      const select = screen.getByRole('combobox')
      expect(select).toHaveDisplayValue('Evening Show')
    })

    it('should show no data message for selected session with no stats', async () => {
      mockEventState.sessions = [createMockSession()]
      mockTicketingState.checkInStats = null

      await act(async () => {
        render(<CheckInPage />)
      })

      expect(screen.getByText('Không có dữ liệu cho buổi diễn này.')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 6. Edge Cases
  // --------------------------------------------------------------------------
  describe('Edge Cases', () => {
    it('should handle missing eventId gracefully', async () => {
      mockUseParams.mockReturnValue({ eventId: undefined })

      await act(async () => {
        render(<CheckInPage />)
      })

      // Should not crash
      expect(screen.queryByTestId('checkin-skeleton')).not.toBeInTheDocument()
    })

    it('should handle sessions with empty array', async () => {
      mockEventState.sessions = []

      await act(async () => {
        render(<CheckInPage />)
      })

      expect(screen.getByText('Không có buổi diễn')).toBeInTheDocument()
    })

    it('should handle stats with null summary', async () => {
      mockEventState.sessions = [createMockSession()]
      mockTicketingState.checkInStats = {
        summary: null,
        ticketStats: [],
      }

      await act(async () => {
        render(<CheckInPage />)
      })

      // Should render without crashing
      expect(screen.queryByTestId('checkin-overview')).toBeInTheDocument()
    })

    it('should handle ticketStats with null value', async () => {
      mockEventState.sessions = [createMockSession()]
      mockTicketingState.checkInStats = {
        summary: { totalTickets: 100, checkedInTickets: 50, checkInRate: 50 },
        ticketStats: null,
      }

      await act(async () => {
        render(<CheckInPage />)
      })

      expect(screen.getByTestId('ticket-types-count')).toHaveTextContent('0')
    })

    it('should auto-select first session when sessions load', async () => {
      mockEventState.sessions = [
        createMockSession({ id: 'session-1', title: 'First Session' }),
        createMockSession({ id: 'session-2', title: 'Second Session' }),
      ]

      await act(async () => {
        render(<CheckInPage />)
      })

      const select = screen.getByRole('combobox')
      expect(select).toHaveValue('session-1')
    })

    it('should sync checkInStats from Redux to local state', async () => {
      const stats = createMockCheckInStats()
      mockEventState.sessions = [createMockSession()]
      mockTicketingState.checkInStats = null

      await act(async () => {
        render(<CheckInPage />)
      })

      // Update Redux state
      act(() => {
        mockTicketingState.checkInStats = stats
      })

      await waitFor(() => {
        expect(screen.getByTestId('total-tickets')).toHaveTextContent('500')
      })
    })
  })

  // --------------------------------------------------------------------------
  // 7. Realtime Updates
  // --------------------------------------------------------------------------
  describe('Realtime Updates', () => {
    it('should update stats when receiving realtime data', async () => {
      const { useCheckInRealtime } = require('../../hooks/useCheckInRealtime')
      const realtimeStats = createMockCheckInStats({
        summary: { totalTickets: 600, checkedInTickets: 400, checkInRate: 66.67 },
      })

      useCheckInRealtime.mockImplementation(({ onUpdate }: { onUpdate: (stats: any) => void }) => {
        setTimeout(() => onUpdate(realtimeStats), 100)
      })

      mockEventState.sessions = [createMockSession()]
      mockTicketingState.checkInStats = createMockCheckInStats()

      await act(async () => {
        render(<CheckInPage />)
      })

      await waitFor(
        () => {
          expect(screen.getByTestId('total-tickets')).toHaveTextContent('600')
        },
        { timeout: 500 }
      )
    })
  })
})
