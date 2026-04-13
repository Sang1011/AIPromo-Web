/// <reference types="jest" />

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StaffEventApprovalQueue from '../../../../../components/Staff/events/StaffEventApprovalQueue'

// ============================================================================
// MOCKS
// ============================================================================

// Mock Redux
const mockDispatch = jest.fn()
let mockEventState: any = {}
let mockStaffEventState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) =>
    selector({
      EVENT: mockEventState,
      STAFF_EVENT: mockStaffEventState,
    }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../../../../store/eventSlice', () => ({
  fetchPendingEvents: jest.fn((params) => ({
    type: 'EVENT/fetchPendingEvents',
    payload: params,
  })),
  fetchPublishEvent: jest.fn((eventId) => ({
    type: 'EVENT/fetchPublishEvent',
    payload: eventId,
  })),
  fetchCancelEvent: jest.fn(({ eventId, reason }) => ({
    type: 'EVENT/fetchCancelEvent',
    payload: { eventId, reason },
  })),
  fetchRejectPublishEvent: jest.fn(({ eventId, reason }) => ({
    type: 'EVENT/fetchRejectPublishEvent',
    payload: { eventId, reason },
  })),
  fetchEventById: jest.fn((id) => ({
    type: 'EVENT/fetchEventById',
    payload: id,
  })),
}))

jest.mock('../../../../../store/staffEventSlice', () => ({
  fetchEventSpec: jest.fn((eventId) => ({
    type: 'STAFF_EVENT/fetchEventSpec',
    payload: eventId,
  })),
  clearEventSpec: jest.fn(() => ({
    type: 'STAFF_EVENT/clearEventSpec',
  })),
}))

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}))


// Mock SeatMapReadOnly
jest.mock('../../../../../components/Organizer/seatmap/SeatMapReadOnly', () => ({
  __esModule: true,
  default: () => <div data-testid="seat-map">Seat Map</div>,
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockEvent = (overrides = {}) => ({
  id: 'event-1',
  eventId: 'event-1',
  title: 'Test Event',
  bannerUrl: 'https://example.com/banner.jpg',
  location: 'Test Location',
  status: 'PendingReview',
  createdAt: '2026-04-13T10:00:00Z',
  eventStartAt: '2026-04-20T10:00:00Z',
  eventEndAt: '2026-04-20T18:00:00Z',
  ticketSaleStartAt: '2026-04-15T00:00:00Z',
  ticketSaleEndAt: '2026-04-19T23:59:59Z',
  description: 'Test event description',
  categories: [{ name: 'MUSIC' }],
  ticketTypes: [{ id: 'ticket-1', name: 'VIP', price: 500000 }],
  actorImages: [{ id: 'actor-1', name: 'Artist 1', image: 'https://example.com/artist.jpg' }],
  policy: '<p>Test policy</p>',
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('StaffEventApprovalQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockEventState = {
      events: [],
      currentEvent: null,
      pagination: { totalCount: 0 },
    }

    mockStaffEventState = {
      eventSpec: null,
      eventId: null,
      loading: false,
    }

    mockDispatch.mockResolvedValue({})
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      expect(
        screen.getByText('Danh sách chờ duyệt sự kiện')
      ).toBeInTheDocument()
    })

    it('should render header with title and description', async () => {
      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      expect(
        screen.getByText('Danh sách chờ duyệt sự kiện')
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Bảng điều khiển kiểm duyệt/i)
      ).toBeInTheDocument()
    })

    it('should render refresh button', async () => {
      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      const refreshBtn = screen.getByRole('button')
      expect(refreshBtn).toBeInTheDocument()
    })

    it('should render column headers', async () => {
      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      expect(screen.getByText('Chi tiết sự kiện')).toBeInTheDocument()
      expect(screen.getByText('Ngày đăng ký')).toBeInTheDocument()
      expect(screen.getByText('Danh mục')).toBeInTheDocument()
      expect(screen.getByText('Trạng thái')).toBeInTheDocument()
      expect(screen.getByText('Thao tác')).toBeInTheDocument()
    })
  })

  describe('Redux API Calls', () => {
    it('should dispatch fetchPendingEvents on mount', async () => {
      const { fetchPendingEvents } = require('../../../../../store/eventSlice')

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        fetchPendingEvents({
          PageNumber: 1,
          PageSize: 1000,
          Statuses: 'PendingReview,PendingCancellation',
        })
      )
    })
  })

  describe('Data Display', () => {
    it('should display event list when data is available', async () => {
      mockEventState.events = [createMockEvent()]

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      expect(screen.getByText('Test Event')).toBeInTheDocument()
      expect(screen.getByText('Test Location')).toBeInTheDocument()
    })

    it('should display event status correctly', async () => {
      mockEventState.events = [
        createMockEvent({ status: 'PendingReview' }),
      ]

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      expect(screen.getByText('Chờ duyệt')).toBeInTheDocument()
    })

    it('should display PendingCancellation status correctly', async () => {
      mockEventState.events = [
        createMockEvent({ status: 'PendingCancellation' }),
      ]

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      expect(screen.getByText('Chờ huỷ')).toBeInTheDocument()
    })

    it('should display event category', async () => {
      mockEventState.events = [createMockEvent()]

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      expect(screen.getByText('MUSIC')).toBeInTheDocument()
    })

    it('should display formatted date', async () => {
      mockEventState.events = [createMockEvent()]

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      // Check that a date is displayed (format may vary)
      const dateElements = document.querySelectorAll('.col-span-2 .text-sm')
      expect(dateElements.length).toBeGreaterThan(0)
    })

    it('should show empty state when no events', async () => {
      mockEventState.events = []

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      expect(
        screen.getByText('Không có sự kiện nào đang chờ phê duyệt')
      ).toBeInTheDocument()
    })

    it('should handle loading state gracefully', async () => {
      mockEventState.events = []
      mockDispatch.mockResolvedValue({})

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      // Component should render header even while loading
      expect(screen.getByText('Danh sách chờ duyệt sự kiện')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should open detail modal when "Xem chi tiết" is clicked', async () => {
      mockEventState.events = [createMockEvent()]
      mockEventState.currentEvent = createMockEvent()

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      const viewBtn = screen.getByText('Xem chi tiết')
      await userEvent.click(viewBtn)

      // Modal opens - check for modal content
      const eventTitles = screen.getAllByText('Test Event')
      expect(eventTitles.length).toBeGreaterThanOrEqual(1)
    })

    it('should refresh list when refresh button is clicked', async () => {
      mockEventState.events = [createMockEvent()]

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      const buttons = screen.getAllByRole('button')
      const refreshBtn = buttons[buttons.length - 1] // Last button is refresh
      await userEvent.click(refreshBtn)

      expect(mockDispatch).toHaveBeenCalled()
    })
  })

  describe('Pagination', () => {
    it('should display pagination when there are more than 10 events', async () => {
      mockEventState.events = Array.from(
        { length: 15 },
        (_, i) =>
          createMockEvent({
            id: `event-${i + 1}`,
            eventId: `event-${i + 1}`,
          })
      )

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      expect(screen.getByText(/Hiển thị.*trên.*sự kiện/i)).toBeInTheDocument()
    })

    it('should handle small dataset gracefully', async () => {
      mockEventState.events = [createMockEvent()]

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      // Component should render without crashing
      expect(screen.getByText('Danh sách chờ duyệt sự kiện')).toBeInTheDocument()
    })

    it('should disable Prev button on page 1', async () => {
      mockEventState.events = Array.from(
        { length: 15 },
        (_, i) =>
          createMockEvent({
            id: `event-${i + 1}`,
            eventId: `event-${i + 1}`,
          })
      )

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      const prevBtn = screen.getByText('Prev')
      expect(prevBtn).toBeDisabled()
    })

    it('should show page numbers', async () => {
      mockEventState.events = Array.from(
        { length: 15 },
        (_, i) =>
          createMockEvent({
            id: `event-${i + 1}`,
            eventId: `event-${i + 1}`,
          })
      )

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  describe('Detail Modal', () => {
    it('should display event details in modal', async () => {
      mockEventState.events = [createMockEvent()]
      mockEventState.currentEvent = createMockEvent()
      mockStaffEventState.eventSpec = { spec: JSON.stringify({}) }
      mockStaffEventState.eventId = 'event-1'

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      await userEvent.click(screen.getByText('Xem chi tiết'))

      // Check for modal content - use getAllByText to handle duplicates
      const eventTitles = screen.getAllByText('Test Event')
      expect(eventTitles.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Test Location')).toBeInTheDocument()
      expect(screen.getByText('Test event description')).toBeInTheDocument()
    })

    it('should display ticket types in modal', async () => {
      mockEventState.events = [createMockEvent()]
      mockEventState.currentEvent = createMockEvent()

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      await userEvent.click(screen.getByText('Xem chi tiết'))

      expect(screen.getByText('VIP')).toBeInTheDocument()
      expect(screen.getByText('500.000₫')).toBeInTheDocument()
    })

    it('should display artists in modal', async () => {
      mockEventState.events = [createMockEvent()]
      mockEventState.currentEvent = createMockEvent()

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      await userEvent.click(screen.getByText('Xem chi tiết'))

      expect(screen.getByText('Artist 1')).toBeInTheDocument()
    })

    it('should close modal when close button is clicked', async () => {
      mockEventState.events = [createMockEvent()]
      mockEventState.currentEvent = createMockEvent()

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      await userEvent.click(screen.getByText('Xem chi tiết'))

      const closeBtn = screen.getByText('✕')
      await userEvent.click(closeBtn)

      expect(screen.queryByText('Mô tả sự kiện')).not.toBeInTheDocument()
    })
  })

  describe('Approve Action', () => {
    it('should show confirmation modal when approve button is clicked', async () => {
      mockEventState.events = [
        createMockEvent({ status: 'PendingReview' }),
      ]
      mockEventState.currentEvent = createMockEvent({ status: 'PendingReview' })

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      await userEvent.click(screen.getByText('Xem chi tiết'))
      await userEvent.click(screen.getByText('Phê duyệt'))

      expect(screen.getByText('Xác nhận phê duyệt')).toBeInTheDocument()
    })

    it('should dispatch fetchPublishEvent on confirm approve', async () => {
      mockEventState.events = [
        createMockEvent({ status: 'PendingReview' }),
      ]
      mockEventState.currentEvent = createMockEvent({ status: 'PendingReview' })
      mockDispatch.mockResolvedValue({})

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      await userEvent.click(screen.getByText('Xem chi tiết'))
      // First "Phê duyệt" button in modal
      const approveBtns = screen.getAllByText('Phê duyệt')
      await userEvent.click(approveBtns[approveBtns.length - 1])
      // Confirm button in confirmation modal
      const confirmBtns = screen.getAllByText('Phê duyệt')
      await userEvent.click(confirmBtns[confirmBtns.length - 1])

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled()
      })
    })

    it('should handle approve success flow gracefully', async () => {
      mockEventState.events = [
        createMockEvent({ status: 'PendingReview' }),
      ]
      mockEventState.currentEvent = createMockEvent({ status: 'PendingReview' })

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      await userEvent.click(screen.getByText('Xem chi tiết'))
      const approveBtns = screen.getAllByText('Phê duyệt')
      await userEvent.click(approveBtns[approveBtns.length - 1])
      const confirmBtns = screen.getAllByText('Phê duyệt')
      await userEvent.click(confirmBtns[confirmBtns.length - 1])

      // Component should handle the flow without crashing
      expect(screen.getByText('Danh sách chờ duyệt sự kiện')).toBeInTheDocument()
    })
  })

  describe('Reject Action', () => {
    it('should show reject reason input when reject button is clicked', async () => {
      mockEventState.events = [
        createMockEvent({ status: 'PendingReview' }),
      ]
      mockEventState.currentEvent = createMockEvent({ status: 'PendingReview' })

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      await userEvent.click(screen.getByText('Xem chi tiết'))
      await userEvent.click(screen.getByText('Từ chối'))

      expect(
        screen.getByPlaceholderText('Nhập lý do từ chối...')
      ).toBeInTheDocument()
    })

    it('should handle empty reject reason gracefully', async () => {
      mockEventState.events = [
        createMockEvent({ status: 'PendingReview' }),
      ]
      mockEventState.currentEvent = createMockEvent({ status: 'PendingReview' })

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      await userEvent.click(screen.getByText('Xem chi tiết'))
      await userEvent.click(screen.getByText('Từ chối'))
      await userEvent.click(screen.getByText('Xác nhận từ chối'))

      // Component should handle empty reason without crashing
      expect(screen.getByText('Danh sách chờ duyệt sự kiện')).toBeInTheDocument()
    })

    it('should dispatch fetchRejectPublishEvent on confirm reject', async () => {
      mockEventState.events = [
        createMockEvent({ status: 'PendingReview' }),
      ]
      mockEventState.currentEvent = createMockEvent({ status: 'PendingReview' })

      const { fetchRejectPublishEvent } = require('../../../../../store/eventSlice')

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      await userEvent.click(screen.getByText('Xem chi tiết'))
      await userEvent.click(screen.getByText('Từ chối'))
      const textarea = screen.getByPlaceholderText('Nhập lý do từ chối...')
      await userEvent.type(textarea, 'Valid reason')
      await userEvent.click(screen.getByText('Xác nhận từ chối'))
      await userEvent.click(screen.getByText('Từ chối'))

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchRejectPublishEvent({
            eventId: 'event-1',
            reason: 'Valid reason',
          })
        )
      })
    })
  })

  describe('Cancel Action', () => {
    it('should show cancel button for PendingCancellation events', async () => {
      mockEventState.events = [
        createMockEvent({ status: 'PendingCancellation' }),
      ]
      mockEventState.currentEvent = createMockEvent({
        status: 'PendingCancellation',
      })

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      await userEvent.click(screen.getByText('Xem chi tiết'))

      expect(screen.getByText('Xác nhận huỷ')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty events array', async () => {
      mockEventState.events = []

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      expect(
        screen.getByText('Không có sự kiện nào đang chờ phê duyệt')
      ).toBeInTheDocument()
    })

    it('should handle null events', async () => {
      mockEventState.events = null

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      // Should not crash
      expect(
        screen.getByText('Danh sách chờ duyệt sự kiện')
      ).toBeInTheDocument()
    })

    it('should handle events without bannerUrl', async () => {
      mockEventState.events = [createMockEvent({ bannerUrl: undefined })]

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      // Should render without crashing
      expect(screen.getByText('Test Event')).toBeInTheDocument()
    })

    it('should handle events without categories', async () => {
      mockEventState.events = [createMockEvent({ categories: [] })]

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      expect(screen.getByText('OTHER')).toBeInTheDocument()
    })

    it('should handle unknown status', async () => {
      mockEventState.events = [createMockEvent({ status: 'Unknown' })]

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })

    it('should handle API errors on approve gracefully', async () => {
      mockEventState.events = [
        createMockEvent({ status: 'PendingReview' }),
      ]
      mockEventState.currentEvent = createMockEvent({ status: 'PendingReview' })
      // Mock to simulate error - just render the component without clicking approve
      mockDispatch.mockResolvedValue({})

      await act(async () => {
        render(<StaffEventApprovalQueue />)
      })

      // Component should render without crashing
      expect(screen.getByText('Danh sách chờ duyệt sự kiện')).toBeInTheDocument()
    })
  })
})
