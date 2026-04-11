/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminEventModerationTable from '../../../../../components/Admin/events/AdminEventModerationTable'

const mockDispatch = jest.fn()
let mockAdminEventState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ ADMIN_EVENT: mockAdminEventState }),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-icons/md', () => ({
  MdFilterList: () => <span data-testid="icon-filter" />,
  MdRefresh: () => <span data-testid="icon-refresh" />,
  MdSearch: () => <span data-testid="icon-search" />,
  MdCalendarToday: () => <span data-testid="icon-calendar" />,
  MdAccessTime: () => <span data-testid="icon-time" />,
}))

jest.mock('react-icons/fi', () => ({
  FiChevronLeft: () => <span data-testid="icon-left" />,
  FiChevronRight: () => <span data-testid="icon-right" />,
}))

describe('AdminEventModerationTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
    mockAdminEventState = {
      filteredEvents: [
        {
          id: '1',
          title: 'Test Event',
          bannerUrl: 'https://example.com/banner.jpg',
          location: 'HCMC',
          eventStartAt: '2024-01-01T10:00:00Z',
          eventEndAt: '2024-01-01T18:00:00Z',
          status: 'PendingReview',
          createdAt: '2023-12-01T00:00:00Z',
        },
      ],
      pagination: { pageNumber: 1, pageSize: 10, totalPages: 1, hasPrevious: false, hasNext: false },
      filters: { Title: '', Statuses: '' },
      loading: false,
    }
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<AdminEventModerationTable />)
      })
      expect(screen.getByText('Quản lý Sự kiện')).toBeInTheDocument()
    })

    it('should show loading state', async () => {
      mockAdminEventState.loading = true
      mockAdminEventState.filteredEvents = []
      await act(async () => {
        render(<AdminEventModerationTable />)
      })
      expect(screen.getByText('Đang tải dữ liệu...')).toBeInTheDocument()
    })

    it('should show empty state when no events', async () => {
      mockAdminEventState.filteredEvents = []
      await act(async () => {
        render(<AdminEventModerationTable />)
      })
      expect(screen.getByText('Không có sự kiện nào')).toBeInTheDocument()
    })

    it('should display filter and refresh buttons', async () => {
      await act(async () => {
        render(<AdminEventModerationTable />)
      })
      expect(screen.getByText('Lọc')).toBeInTheDocument()
      expect(screen.getByText('Làm mới')).toBeInTheDocument()
    })

    it('should render table headers', async () => {
      await act(async () => {
        render(<AdminEventModerationTable />)
      })
      expect(screen.getByText('TÊN SỰ KIỆN')).toBeInTheDocument()
      expect(screen.getByText('ĐỊA ĐIỂM')).toBeInTheDocument()
      expect(screen.getByText('TRẠNG THÁI')).toBeInTheDocument()
    })
  })
})
