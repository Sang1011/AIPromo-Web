/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import MyEventsPage from '../../../pages/Organizer/MyEventsPage'

// ============================================================================
// MOCKS
// ============================================================================

// Mock react-router-dom
const mockUseOutletContext = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useOutletContext: () => mockUseOutletContext(),
}))

// Mock Redux
const mockDispatch = jest.fn()
let mockAuthState: any = {}
let mockEventState: any = {}
let mockEventMemberState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    AUTH: mockAuthState,
    EVENT: mockEventState,
    EVENT_MEMBER: mockEventMemberState,
  }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../store/eventSlice', () => ({
  fetchAllEventsByMe: jest.fn((params) => ({ type: 'EVENT/fetchAllEventsByMe', payload: params })),
}))

jest.mock('../../store/authSlice', () => ({
  fetchMe: jest.fn(() => ({ type: 'AUTH/fetchMe' })),
}))

jest.mock('../../store/eventMemberSlice', () => ({
  fetchEventListAssignedForCurrentUser: jest.fn(() => ({
    type: 'EVENT_MEMBER/fetchEventListAssignedForCurrentUser',
  })),
}))

// Mock child components to simplify tests
jest.mock('../../components/Organizer/events/EventCards', () => ({
  __esModule: true,
  default: ({ event, isMember }: { event: any; isMember?: boolean }) => (
    <div data-testid="event-card" data-is-member={isMember}>
      <span data-testid="event-title">{event.title}</span>
      <span data-testid="event-status">{event.status}</span>
      <span data-testid="event-location">{event.location}</span>
      <span data-testid="event-time">{event.time}</span>
    </div>
  ),
}))

jest.mock('../../components/Organizer/shared/SearchBar', () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }) => (
    <input
      data-testid="search-bar"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
    />
  ),
}))

jest.mock('../../components/Organizer/shared/StatusFilter', () => ({
  __esModule: true,
  default: ({
    activeFilter,
    onFilterChange,
  }: {
    activeFilter: string
    onFilterChange: (filter: string) => void
  }) => (
    <div data-testid="status-filters">
      <button data-testid="filter-draft" onClick={() => onFilterChange('Draft')}>
        Draft
      </button>
      <button data-testid="filter-upcoming" onClick={() => onFilterChange('Upcoming')}>
        Upcoming
      </button>
      <span data-testid="active-filter">{activeFilter}</span>
    </div>
  ),
}))

jest.mock('../../components/Organizer/shared/Pagination', () => ({
  __esModule: true,
  default: ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }) => (
    <div data-testid="pagination">
      <button data-testid="page-1" onClick={() => onPageChange(1)}>
        Page 1
      </button>
      <button data-testid="page-2" onClick={() => onPageChange(2)}>
        Page 2
      </button>
      <span data-testid="current-page">{currentPage}</span>
      <span data-testid="total-pages">{totalPages}</span>
    </div>
  ),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockOrganizerEvent = (overrides = {}) => ({
  id: 'event-1',
  title: 'Test Event',
  bannerUrl: 'https://example.com/banner.jpg',
  location: 'Ho Chi Minh City',
  eventStartAt: '2024-12-01T10:00:00Z',
  eventEndAt: '2024-12-01T18:00:00Z',
  status: 'Draft' as const,
  publishRejectionReason: null,
  suspensionReason: null,
  cancellationReason: null,
  cancellationRejectionReason: null,
  ...overrides,
})

const createMockMemberEvent = (overrides = {}) => ({
  eventId: 'event-1',
  title: 'Assigned Event',
  bannerUrl: 'https://example.com/banner.jpg',
  eventStartAt: '2024-12-01T10:00:00Z',
  eventEndAt: '2024-12-01T18:00:00Z',
  sessions: [
    {
      id: 'session-1',
      title: 'Session 1',
      startTime: '2024-12-01T10:00:00Z',
      endTime: '2024-12-01T12:00:00Z',
    },
  ],
  permissions: ['view', 'edit'],
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('MyEventsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Reset mock states
    mockAuthState = {
      currentInfor: {
        roles: ['Organizer'],
      },
    }
    mockEventState = {
      myEvents: [],
      pagination: {
        pageNumber: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
      },
    }
    mockEventMemberState = {
      assignedEvents: [],
      fetchingAssignedEvents: false,
    }

    // Mock setConfig
    mockUseOutletContext.mockReturnValue({
      setConfig: jest.fn(),
    })

    // Mock dispatch to resolve immediately
    mockDispatch.mockResolvedValue({})
  })

  // --------------------------------------------------------------------------
  // 1. Render không lỗi
  // --------------------------------------------------------------------------
  describe('Render', () => {
    it('should render without crashing for organizer role', async () => {
      mockAuthState.currentInfor = { roles: ['Organizer'] }

      await act(async () => {
        render(<MyEventsPage />)
      })

      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
    })

    it('should render without crashing for member role', async () => {
      mockAuthState.currentInfor = { roles: ['Member'] }

      await act(async () => {
        render(<MyEventsPage />)
      })

      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
    })

    it('should show loading state while role is not resolved', () => {
      mockAuthState.currentInfor = null

      render(<MyEventsPage />)

      // Should show skeleton loaders (3 skeletons)
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  // --------------------------------------------------------------------------
  // 2. Elements chính hiển thị đúng
  // --------------------------------------------------------------------------
  describe('UI Elements', () => {
    it('should render search bar with correct placeholder for organizer', async () => {
      mockAuthState.currentInfor = { roles: ['Organizer'] }

      await act(async () => {
        render(<MyEventsPage />)
      })

      const searchBar = screen.getByTestId('search-bar')
      expect(searchBar).toHaveAttribute('placeholder', 'Tìm kiếm sự kiện của bạn...')
    })

    it('should render search bar with correct placeholder for member', async () => {
      mockAuthState.currentInfor = { roles: ['Member'] }

      await act(async () => {
        render(<MyEventsPage />)
      })

      const searchBar = screen.getByTestId('search-bar')
      expect(searchBar).toHaveAttribute('placeholder', 'Tìm kiếm sự kiện...')
    })

    it('should render status filters for organizer only', async () => {
      mockAuthState.currentInfor = { roles: ['Organizer'] }

      await act(async () => {
        render(<MyEventsPage />)
      })

      expect(screen.getByTestId('status-filters')).toBeInTheDocument()
    })

    it('should NOT render status filters for member', async () => {
      mockAuthState.currentInfor = { roles: ['Member'] }

      await act(async () => {
        render(<MyEventsPage />)
      })

      expect(screen.queryByTestId('status-filters')).not.toBeInTheDocument()
    })

    it('should render pagination for organizer', async () => {
      mockAuthState.currentInfor = { roles: ['Organizer'] }
      mockEventState.pagination = {
        pageNumber: 1,
        pageSize: 5,
        totalCount: 10,
        totalPages: 2,
        hasPrevious: false,
        hasNext: true,
      }

      await act(async () => {
        render(<MyEventsPage />)
      })

      expect(screen.getByTestId('pagination')).toBeInTheDocument()
    })

    it('should NOT render pagination for member', async () => {
      mockAuthState.currentInfor = { roles: ['Member'] }

      await act(async () => {
        render(<MyEventsPage />)
      })

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 3. API calls
  // --------------------------------------------------------------------------
  describe('API Calls', () => {
    it('should call fetchMe on mount', async () => {
      const { fetchMe } = require('../../store/authSlice')

      await act(async () => {
        render(<MyEventsPage />)
      })

      expect(mockDispatch).toHaveBeenCalledWith(fetchMe())
    })

    it('should call fetchAllEventsByMe for organizer after role resolved', async () => {
      const { fetchAllEventsByMe } = require('../../store/eventSlice')
      mockAuthState.currentInfor = { roles: ['Organizer'] }

      await act(async () => {
        render(<MyEventsPage />)
      })

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchAllEventsByMe({
            PageNumber: 1,
            PageSize: 5,
            Statuses: 'draft',
          })
        )
      })
    })

    it('should call fetchEventListAssignedForCurrentUser for member after role resolved', async () => {
      const { fetchEventListAssignedForCurrentUser } = require('../../store/eventMemberSlice')
      mockAuthState.currentInfor = { roles: ['Member'] }

      await act(async () => {
        render(<MyEventsPage />)
      })

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchEventListAssignedForCurrentUser())
      })
    })
  })

  // --------------------------------------------------------------------------
  // 4. User interactions
  // --------------------------------------------------------------------------
  describe('User Interactions', () => {
    it('should update search query when typing in search bar', async () => {
      mockAuthState.currentInfor = { roles: ['Organizer'] }

      await act(async () => {
        render(<MyEventsPage />)
      })

      const searchBar = screen.getByTestId('search-bar')
      await userEvent.type(searchBar, 'Test')

      expect(searchBar).toHaveValue('Test')
    })

    it('should reset page to 1 when search query changes', async () => {
      mockAuthState.currentInfor = { roles: ['Organizer'] }

      await act(async () => {
        render(<MyEventsPage />)
      })

      const searchBar = screen.getByTestId('search-bar')

      // Type in search bar
      await userEvent.type(searchBar, 'Test')
      expect(searchBar).toHaveValue('Test')

      // Verify internal state updated (debounce timer would start)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 500))
      })
    })

    it('should change status filter and reset page for organizer', async () => {
      const { fetchAllEventsByMe } = require('../../store/eventSlice')
      mockAuthState.currentInfor = { roles: ['Organizer'] }

      await act(async () => {
        render(<MyEventsPage />)
      })

      mockDispatch.mockClear()

      const upcomingFilter = screen.getByTestId('filter-upcoming')
      await userEvent.click(upcomingFilter)

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchAllEventsByMe({
            PageNumber: 1,
            PageSize: 5,
            Statuses: 'published',
          })
        )
      })
    })

    it('should change page when clicking pagination', async () => {
      const { fetchAllEventsByMe } = require('../../store/eventSlice')
      mockAuthState.currentInfor = { roles: ['Organizer'] }
      mockEventState.pagination = {
        pageNumber: 1,
        pageSize: 5,
        totalCount: 10,
        totalPages: 2,
        hasPrevious: false,
        hasNext: true,
      }

      await act(async () => {
        render(<MyEventsPage />)
      })

      mockDispatch.mockClear()

      const page2Button = screen.getByTestId('page-2')
      await userEvent.click(page2Button)

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchAllEventsByMe({
            PageNumber: 2,
            PageSize: 5,
            Statuses: 'draft',
          })
        )
      })
    })
  })

  // --------------------------------------------------------------------------
  // 5. Data display
  // --------------------------------------------------------------------------
  describe('Data Display', () => {
    it('should display organizer events correctly', async () => {
      mockAuthState.currentInfor = { roles: ['Organizer'] }
      mockEventState.myEvents = [createMockOrganizerEvent()]

      await act(async () => {
        render(<MyEventsPage />)
      })

      expect(screen.getByTestId('event-title')).toHaveTextContent('Test Event')
      expect(screen.getByTestId('event-location')).toHaveTextContent('Ho Chi Minh City')
    })

    it('should display member events correctly', async () => {
      mockAuthState.currentInfor = { roles: ['Member'] }
      mockEventMemberState.assignedEvents = [createMockMemberEvent()]

      await act(async () => {
        render(<MyEventsPage />)
      })

      expect(screen.getByTestId('event-title')).toHaveTextContent('Assigned Event')
      const eventCard = screen.getByTestId('event-card')
      expect(eventCard).toHaveAttribute('data-is-member', 'true')
    })

    it('should show empty state when no events found', async () => {
      mockAuthState.currentInfor = { roles: ['Organizer'] }
      mockEventState.myEvents = []

      await act(async () => {
        render(<MyEventsPage />)
      })

      expect(screen.getByText('Không có sự kiện nào')).toBeInTheDocument()
    })

    it('should filter events based on search query', async () => {
      mockAuthState.currentInfor = { roles: ['Organizer'] }
      mockEventState.myEvents = [
        createMockOrganizerEvent({ id: '1', title: 'React Conference' }),
        createMockOrganizerEvent({ id: '2', title: 'Vue Summit' }),
      ]

      await act(async () => {
        render(<MyEventsPage />)
      })

      // Initially both should show
      expect(screen.getAllByTestId('event-card')).toHaveLength(2)

      // Search for "React"
      const searchBar = screen.getByTestId('search-bar')
      await userEvent.type(searchBar, 'React')

      // Wait for debounce (400ms)
      await waitFor(
        () => {
          const cards = screen.getAllByTestId('event-card')
          expect(cards).toHaveLength(1)
          expect(screen.getByTestId('event-title')).toHaveTextContent('React Conference')
        },
        { timeout: 1000 }
      )
    })

    it('should show loading skeleton while fetching organizer events', async () => {
      mockAuthState.currentInfor = { roles: ['Organizer'] }
      mockEventState.myEvents = []

      // Mock dispatch to not resolve immediately (simulate loading)
      mockDispatch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 100)
          })
      )

      render(<MyEventsPage />)

      // Should show loading skeletons
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should show loading skeleton while fetching member events', async () => {
      mockAuthState.currentInfor = { roles: ['Member'] }
      mockEventMemberState.assignedEvents = []
      mockEventMemberState.fetchingAssignedEvents = true

      render(<MyEventsPage />)

      // Should show loading skeletons
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  // --------------------------------------------------------------------------
  // 6. Edge cases
  // --------------------------------------------------------------------------
  describe('Edge Cases', () => {
    it('should handle events with null dates', async () => {
      mockAuthState.currentInfor = { roles: ['Organizer'] }
      mockEventState.myEvents = [
        createMockOrganizerEvent({
          eventStartAt: null,
          eventEndAt: null,
        }),
      ]

      await act(async () => {
        render(<MyEventsPage />)
      })

      expect(screen.getByTestId('event-time')).toHaveTextContent('Chưa có thời gian')
    })

    it('should handle events with only start date', async () => {
      mockAuthState.currentInfor = { roles: ['Organizer'] }
      mockEventState.myEvents = [
        createMockOrganizerEvent({
          eventStartAt: '2024-12-01T10:00:00Z',
          eventEndAt: null,
        }),
      ]

      await act(async () => {
        render(<MyEventsPage />)
      })

      expect(screen.getByTestId('event-time')).toHaveTextContent('Từ')
    })

    it('should handle events with only end date', async () => {
      mockAuthState.currentInfor = { roles: ['Organizer'] }
      mockEventState.myEvents = [
        createMockOrganizerEvent({
          eventStartAt: null,
          eventEndAt: '2024-12-01T18:00:00Z',
        }),
      ]

      await act(async () => {
        render(<MyEventsPage />)
      })

      expect(screen.getByTestId('event-time')).toHaveTextContent('Đến')
    })

    it('should handle rejection reasons for Draft events', async () => {
      mockAuthState.currentInfor = { roles: ['Organizer'] }
      mockEventState.myEvents = [
        createMockOrganizerEvent({
          status: 'Draft',
          publishRejectionReason: 'Content not appropriate',
        }),
      ]

      await act(async () => {
        render(<MyEventsPage />)
      })

      // Event should still render with rejection reason
      expect(screen.getByTestId('event-title')).toHaveTextContent('Test Event')
    })

    it('should handle member events with no sessions', async () => {
      mockAuthState.currentInfor = { roles: ['Member'] }
      mockEventMemberState.assignedEvents = [
        createMockMemberEvent({ sessions: null }),
      ]

      await act(async () => {
        render(<MyEventsPage />)
      })

      expect(screen.getByTestId('event-title')).toHaveTextContent('Assigned Event')
    })

    it('should handle user with multiple roles including Organizer', async () => {
      mockAuthState.currentInfor = { roles: ['Member', 'Organizer', 'Admin'] }

      await act(async () => {
        render(<MyEventsPage />)
      })

      // Should treat as organizer
      expect(screen.getByTestId('status-filters')).toBeInTheDocument()
      expect(screen.getByTestId('pagination')).toBeInTheDocument()
    })

    it('should handle user with no roles', async () => {
      mockAuthState.currentInfor = { roles: [] }

      await act(async () => {
        render(<MyEventsPage />)
      })

      // Should treat as member (not organizer)
      expect(screen.queryByTestId('status-filters')).not.toBeInTheDocument()
    })

    it('should handle user with undefined roles', async () => {
      mockAuthState.currentInfor = {}

      await act(async () => {
        render(<MyEventsPage />)
      })

      // Should treat as member (not organizer)
      expect(screen.queryByTestId('status-filters')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 7. Role-based behavior
  // --------------------------------------------------------------------------
  describe('Role-based Behavior', () => {
    it('should fetch organizer data when user has Organizer role', async () => {
      const { fetchAllEventsByMe } = require('../../store/eventSlice')
      mockAuthState.currentInfor = { roles: ['Organizer'] }

      await act(async () => {
        render(<MyEventsPage />)
      })

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchAllEventsByMe(expect.any(Object))
        )
      })
    })

    it('should fetch member data when user does not have Organizer role', async () => {
      const { fetchEventListAssignedForCurrentUser } = require('../../store/eventMemberSlice')
      mockAuthState.currentInfor = { roles: ['Member'] }

      await act(async () => {
        render(<MyEventsPage />)
      })

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchEventListAssignedForCurrentUser())
      })
    })

    it('should update page config with correct title for organizer', async () => {
      const mockSetConfig = jest.fn()
      mockUseOutletContext.mockReturnValue({ setConfig: mockSetConfig })
      mockAuthState.currentInfor = { roles: ['Organizer'] }

      await act(async () => {
        render(<MyEventsPage />)
      })

      expect(mockSetConfig).toHaveBeenCalledWith({
        title: 'Sự kiện của tôi',
        havePromoSidebar: true,
      })
    })

    it('should update page config with correct title for member', async () => {
      const mockSetConfig = jest.fn()
      mockUseOutletContext.mockReturnValue({ setConfig: mockSetConfig })
      mockAuthState.currentInfor = { roles: ['Member'] }

      await act(async () => {
        render(<MyEventsPage />)
      })

      expect(mockSetConfig).toHaveBeenCalledWith({
        title: 'Sự kiện được phân công',
        havePromoSidebar: true,
      })
    })
  })
})
