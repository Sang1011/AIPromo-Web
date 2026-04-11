/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import RefundTable from '../../../../../components/Admin/refund/RefundTable'

const mockDispatch = jest.fn()
let mockCancelledEventState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ CANCELLED_EVENT: mockCancelledEventState }),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-icons/md', () => ({
  MdChevronLeft: () => <span data-testid="icon-left" />,
  MdChevronRight: () => <span data-testid="icon-right" />,
  MdListAlt: () => <span data-testid="icon-list" />,
  MdCalendarToday: () => <span data-testid="icon-calendar" />,
  MdLocationOn: () => <span data-testid="icon-location" />,
  MdMonetizationOn: () => <span data-testid="icon-money" />,
}))

jest.mock('../../../../../components/Admin/refund/ConfirmModal', () => ({
  __esModule: true,
  default: ({ isOpen, title }: any) => isOpen ? <div data-testid="confirm-modal">{title}</div> : null,
}))

jest.mock('../../../../../components/Admin/refund/RefundResultModal', () => ({
  __esModule: true,
  default: ({ isOpen }: any) => isOpen ? <div data-testid="result-modal" /> : null,
}))

describe('RefundTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
    mockCancelledEventState = {
      cancelledEvents: {
        totalCount: 1,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
        items: [
          {
            id: '1',
            title: 'Cancelled Event',
            bannerUrl: 'https://example.com/banner.jpg',
            location: 'HCMC',
            eventStartAt: '2024-01-01T10:00:00Z',
            eventEndAt: '2024-01-01T18:00:00Z',
            createdAt: '2023-12-01T00:00:00Z',
          },
        ],
      },
      loading: false,
      refundLoading: false,
    }
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<RefundTable />)
      })
      expect(screen.getByText('Sự kiện đã hủy')).toBeInTheDocument()
    })

    it('should show loading state', async () => {
      mockCancelledEventState.loading = true
      mockCancelledEventState.cancelledEvents.items = []
      await act(async () => {
        render(<RefundTable />)
      })
      expect(screen.getByText('Đang tải dữ liệu...')).toBeInTheDocument()
    })

    it('should show empty state when no events', async () => {
      mockCancelledEventState.cancelledEvents.items = []
      await act(async () => {
        render(<RefundTable />)
      })
      expect(screen.getByText('Không có sự kiện nào bị hủy')).toBeInTheDocument()
    })

    it('should render table headers', async () => {
      await act(async () => {
        render(<RefundTable />)
      })
      expect(screen.getByText('Sự kiện')).toBeInTheDocument()
      expect(screen.getByText('Địa điểm')).toBeInTheDocument()
      expect(screen.getByText('Trạng thái')).toBeInTheDocument()
    })

    it('should display event data', async () => {
      await act(async () => {
        render(<RefundTable />)
      })
      expect(screen.getByText('Cancelled Event')).toBeInTheDocument()
      expect(screen.getByText('Đã hủy')).toBeInTheDocument()
    })
  })
})
