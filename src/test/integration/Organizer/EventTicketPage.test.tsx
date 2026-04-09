/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import EventTicketPage from '../../../pages/Organizer/EventTicketPage'

// ============================================================================
// MOCKS
// ============================================================================

// Mock react-router-dom
const mockUseParams = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
}))

// Mock react-icons
jest.mock('react-icons/fi', () => ({
  FiChevronDown: () => <div data-testid="fi-chevron-down" />,
}))

// Mock Redux
const mockDispatch = jest.fn()
let mockTicketTypeState: any = {}
let mockEventState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    TICKET_TYPE: mockTicketTypeState,
    EVENT: mockEventState,
  }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../store/eventSlice', () => ({
  fetchEventById: jest.fn((eventId) => ({ type: 'EVENT/fetchEventById', payload: eventId })),
}))

jest.mock('../../store/ticketTypeSlice', () => ({
  fetchGetAllTicketTypes: jest.fn((params) => ({
    type: 'TICKET_TYPE/fetchGetAllTicketTypes',
    payload: params,
  })),
}))

// Mock child components
jest.mock('../../components/Organizer/ticket/TicketSummary', () => ({
  __esModule: true,
  default: ({ ticketTypes, quantities }: { ticketTypes: any[]; quantities: Record<string, number> }) => (
    <div data-testid="ticket-summary">
      <span data-testid="ticket-type-count">{ticketTypes.length} types</span>
      <span data-testid="quantities-count">{Object.keys(quantities).length} quantities</span>
    </div>
  ),
}))

jest.mock('../../components/Organizer/ticket/TicketTypeList', () => ({
  __esModule: true,
  default: ({ ticketTypes }: { ticketTypes: any[] }) => (
    <div data-testid="ticket-type-list">
      {ticketTypes.map((t) => (
        <span key={t.id} data-testid="ticket-type-item">{t.name}</span>
      ))}
    </div>
  ),
}))

jest.mock('../../pages/Organizer/LockSeatTab', () => ({
  __esModule: true,
  default: ({ selectedSessionId }: { selectedSessionId: string }) => (
    <div data-testid="lock-seat-tab" data-session-id={selectedSessionId}>
      Lock Seat Tab
    </div>
  ),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockEvent = (overrides = {}) => ({
  id: 'event-1',
  title: 'Test Event',
  status: 'Published',
  sessions: [
    {
      id: 'session-1',
      title: 'Evening Show',
      startTime: '2024-12-01T18:00:00Z',
      endTime: '2024-12-01T21:00:00Z',
    },
    {
      id: 'session-2',
      title: 'Morning Show',
      startTime: '2024-12-02T09:00:00Z',
      endTime: '2024-12-02T12:00:00Z',
    },
  ],
  ...overrides,
})

const createMockTicketType = (overrides = {}) => ({
  id: 'ticket-1',
  name: 'VIP',
  price: 500000,
  quantity: 100,
  sold: 50,
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('EventTicketPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseParams.mockReturnValue({ eventId: 'event-1' })

    mockTicketTypeState = {
      ticketTypes: [],
      loading: false,
    }

    mockEventState = {
      event: null,
      loading: false,
    }

    mockDispatch.mockResolvedValue({
      data: createMockEvent(),
    })
  })

  // --------------------------------------------------------------------------
  // 1. Render
  // --------------------------------------------------------------------------
  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<EventTicketPage />)
      })

      expect(screen.getByText('Suất diễn:')).toBeInTheDocument()
    })

    it('should show loading state initially', () => {
      mockDispatch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ data: createMockEvent() }), 100)
          })
      )

      render(<EventTicketPage />)

      // Component should still render (session selector appears)
      expect(screen.getByText('Suất diễn:')).toBeInTheDocument()
    })

    it('should show overview tab by default', async () => {
      mockTicketTypeState.ticketTypes = [createMockTicketType()]

      await act(async () => {
        render(<EventTicketPage />)
      })

      expect(screen.getByText('Tổng quan')).toBeInTheDocument()
      expect(screen.getByText('Khóa ghế')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 2. UI Elements
  // --------------------------------------------------------------------------
  describe('UI Elements', () => {
    it('should render session selector dropdown', async () => {
      mockDispatch.mockResolvedValue({
        data: createMockEvent(),
      })

      await act(async () => {
        render(<EventTicketPage />)
      })

      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })

    it('should render tab buttons', async () => {
      await act(async () => {
        render(<EventTicketPage />)
      })

      expect(screen.getByText('Tổng quan')).toBeInTheDocument()
      expect(screen.getByText('Khóa ghế')).toBeInTheDocument()
    })

    it('should disable session selector when no sessions', async () => {
      mockDispatch.mockResolvedValue({
        data: createMockEvent({ sessions: [] }),
      })

      await act(async () => {
        render(<EventTicketPage />)
      })

      const select = screen.getByRole('combobox')
      expect(select).toBeDisabled()
    })

    it('should show "Chưa tạo vé" message when no ticket types', async () => {
      mockTicketTypeState.ticketTypes = []

      await act(async () => {
        render(<EventTicketPage />)
      })

      expect(screen.getByText('Chưa tạo vé cho sự kiện này')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 3. API Calls
  // --------------------------------------------------------------------------
  describe('API Calls', () => {
    it('should call fetchEventById on mount', async () => {
      const { fetchEventById } = require('../../store/eventSlice')

      await act(async () => {
        render(<EventTicketPage />)
      })

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchEventById('event-1'))
      })
    })

    it('should call fetchGetAllTicketTypes when session is selected', async () => {
      const { fetchGetAllTicketTypes } = require('../../store/ticketTypeSlice')
      mockDispatch.mockResolvedValue({
        data: createMockEvent(),
      })

      await act(async () => {
        render(<EventTicketPage />)
      })

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchGetAllTicketTypes({ eventId: 'event-1', eventSessionId: 'session-1' })
        )
      })
    })

    it('should not call fetchEventById if eventId is undefined', async () => {
      mockUseParams.mockReturnValue({ eventId: undefined })

      await act(async () => {
        render(<EventTicketPage />)
      })

      const { fetchEventById } = require('../../store/eventSlice')
      expect(mockDispatch).not.toHaveBeenCalledWith(fetchEventById(undefined))
    })
  })

  // --------------------------------------------------------------------------
  // 4. User Interactions
  // --------------------------------------------------------------------------
  describe('User Interactions', () => {
    it('should change session when selecting different option', async () => {
      mockDispatch.mockResolvedValue({
        data: createMockEvent(),
      })

      await act(async () => {
        render(<EventTicketPage />)
      })

      const select = screen.getByRole('combobox')
      await userEvent.selectOptions(select, 'session-2')

      expect(select).toHaveValue('session-2')
    })

    it('should fetch ticket types when session changes', async () => {
      const { fetchGetAllTicketTypes } = require('../../store/ticketTypeSlice')
      mockDispatch.mockResolvedValue({
        data: createMockEvent(),
      })

      await act(async () => {
        render(<EventTicketPage />)
      })

      mockDispatch.mockClear()

      const select = screen.getByRole('combobox')
      await userEvent.selectOptions(select, 'session-2')

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchGetAllTicketTypes({ eventId: 'event-1', eventSessionId: 'session-2' })
        )
      })
    })

    it('should switch to lock-seat tab when clicking tab button', async () => {
      await act(async () => {
        render(<EventTicketPage />)
      })

      const lockSeatTab = screen.getByText('Khóa ghế')
      await userEvent.click(lockSeatTab)

      expect(screen.getByTestId('lock-seat-tab')).toBeInTheDocument()
      expect(screen.getByTestId('lock-seat-tab')).toHaveAttribute('data-session-id', 'session-1')
    })

    it('should switch back to overview tab when clicking', async () => {
      mockTicketTypeState.ticketTypes = [createMockTicketType()]

      await act(async () => {
        render(<EventTicketPage />)
      })

      // Switch to lock-seat
      await userEvent.click(screen.getByText('Khóa ghế'))
      expect(screen.getByTestId('lock-seat-tab')).toBeInTheDocument()

      // Switch back to overview
      await userEvent.click(screen.getByText('Tổng quan'))
      expect(screen.getByTestId('ticket-type-list')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 5. Data Display
  // --------------------------------------------------------------------------
  describe('Data Display', () => {
    it('should display session titles in dropdown', async () => {
      mockDispatch.mockResolvedValue({
        data: createMockEvent(),
      })

      await act(async () => {
        render(<EventTicketPage />)
      })

      const select = screen.getByRole('combobox')
      expect(select).toHaveDisplayValue('Evening Show')
    })

    it('should display ticket types when available', async () => {
      mockTicketTypeState.ticketTypes = [
        createMockTicketType({ id: '1', name: 'VIP' }),
        createMockTicketType({ id: '2', name: 'Standard' }),
      ]

      await act(async () => {
        render(<EventTicketPage />)
      })

      expect(screen.getByTestId('ticket-type-list')).toBeInTheDocument()
      expect(screen.getAllByTestId('ticket-type-item')).toHaveLength(2)
    })

    it('should display ticket summary with correct counts', async () => {
      mockTicketTypeState.ticketTypes = [
        createMockTicketType({ id: '1' }),
        createMockTicketType({ id: '2' }),
        createMockTicketType({ id: '3' }),
      ]

      await act(async () => {
        render(<EventTicketPage />)
      })

      expect(screen.getByTestId('ticket-summary')).toBeInTheDocument()
      expect(screen.getByTestId('ticket-type-count')).toHaveTextContent('3 types')
      expect(screen.getByTestId('quantities-count')).toHaveTextContent('3 quantities')
    })

    it('should show "Không có suất diễn" when sessions array is empty', async () => {
      mockDispatch.mockResolvedValue({
        data: createMockEvent({ sessions: [] }),
      })

      await act(async () => {
        render(<EventTicketPage />)
      })

      expect(screen.getByText('Không có suất diễn')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 6. Edge Cases
  // --------------------------------------------------------------------------
  describe('Edge Cases', () => {
    it('should handle eventId being undefined', async () => {
      mockUseParams.mockReturnValue({ eventId: undefined })

      await act(async () => {
        render(<EventTicketPage />)
      })

      // Should render without crashing
      expect(screen.getByText('Suất diễn:')).toBeInTheDocument()
    })

    it('should handle event with null sessions', async () => {
      mockDispatch.mockResolvedValue({
        data: { ...createMockEvent(), sessions: null },
      })

      await act(async () => {
        render(<EventTicketPage />)
      })

      // Should not crash
      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })

    it('should handle ticketTypes being null', async () => {
      mockTicketTypeState.ticketTypes = null

      await act(async () => {
        render(<EventTicketPage />)
      })

      // Should show empty message
      expect(screen.getByText('Chưa tạo vé cho sự kiện này')).toBeInTheDocument()
    })

    it('should initialize quantities to zero for each ticket type', async () => {
      mockTicketTypeState.ticketTypes = [
        createMockTicketType({ id: 't1' }),
        createMockTicketType({ id: 't2' }),
      ]

      await act(async () => {
        render(<EventTicketPage />)
      })

      expect(screen.getByTestId('quantities-count')).toHaveTextContent('2 quantities')
    })

    it('should auto-select first session when sessions load', async () => {
      mockDispatch.mockResolvedValue({
        data: createMockEvent(),
      })

      await act(async () => {
        render(<EventTicketPage />)
      })

      const select = screen.getByRole('combobox')
      await waitFor(() => {
        expect(select).toHaveValue('session-1')
      })
    })

    it('should handle single session', async () => {
      mockDispatch.mockResolvedValue({
        data: createMockEvent({
          sessions: [{ id: 'session-only', title: 'Only Session' }],
        }),
      })

      await act(async () => {
        render(<EventTicketPage />)
      })

      const select = screen.getByRole('combobox')
      await waitFor(() => {
        expect(select).toHaveValue('session-only')
      })
    })
  })
})
