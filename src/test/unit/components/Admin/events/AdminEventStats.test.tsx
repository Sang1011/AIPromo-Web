/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminEventStats from '../../../../../components/Admin/events/AdminEventStats'

const mockDispatch = jest.fn()
let mockAdminEventState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ ADMIN_EVENT: mockAdminEventState }),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-icons/md', () => ({
  MdCalendarMonth: () => <span data-testid="icon-calendar" />,
  MdPendingActions: () => <span data-testid="icon-pending" />,
  MdStadium: () => <span data-testid="icon-stadium" />,
  MdPayments: () => <span data-testid="icon-payments" />,
}))

describe('AdminEventStats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
    mockAdminEventState = {
      allEvents: [
        { id: '1', status: 'PendingReview', eventStartAt: '2024-01-01', eventEndAt: '2024-12-31' },
        { id: '2', status: 'Published', eventStartAt: '2024-01-01', eventEndAt: '2024-12-31' },
      ],
      pagination: { totalCount: 10 },
      loading: false,
    }
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<AdminEventStats />)
      })
      expect(screen.getByText('Tổng Sự kiện')).toBeInTheDocument()
    })

    it('should display loading placeholder when loading', async () => {
      mockAdminEventState.loading = true
      await act(async () => {
        render(<AdminEventStats />)
      })
      expect(screen.getAllByText('...').length).toBeGreaterThan(0)
    })

    it('should display event statistics', async () => {
      await act(async () => {
        render(<AdminEventStats />)
      })
      expect(screen.getByText('Chờ Phê duyệt')).toBeInTheDocument()
      expect(screen.getByText('Sự kiện Đang diễn ra')).toBeInTheDocument()
    })
  })
})
