/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminDashboardStats from '../../../../../components/Admin/dashboard/AdminDashboardStats'

const mockDispatch = jest.fn()
let mockReportsState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ ADMIN_REPORTS: mockReportsState }),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-icons/md', () => ({
  MdTrendingUp: () => <span data-testid="icon-trending" />,
  MdGroup: () => <span data-testid="icon-group" />,
  MdCalendarToday: () => <span data-testid="icon-calendar" />,
  MdConfirmationNumber: () => <span data-testid="icon-ticket" />,
}))

describe('AdminDashboardStats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
    mockReportsState = {
      data: {
        kpis: {
          totalRevenue: { value: 100000000, monthlyGrowthRate: 5, isPositiveGrowth: true },
          activeUsers: { total: 500 },
          events: { total: 50, liveNow: 3 },
          ticketsSold: { total: 1200 },
        },
        userDistribution: {
          organizers: { percentage: 30, count: 150 },
          attendees: { percentage: 70, count: 350 },
        },
      },
      loading: false,
    }
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<AdminDashboardStats />)
      })
      expect(screen.getByText('Tổng Doanh Thu')).toBeInTheDocument()
    })

    it('should show loading skeleton when loading', async () => {
      mockReportsState.loading = true
      mockReportsState.data = null
      await act(async () => {
        render(<AdminDashboardStats />)
      })
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('should render revenue data correctly', async () => {
      await act(async () => {
        render(<AdminDashboardStats />)
      })
      expect(screen.getByText('Tổng Doanh Thu')).toBeInTheDocument()
    })

    it('should render user stats card', async () => {
      await act(async () => {
        render(<AdminDashboardStats />)
      })
      expect(screen.getByText('Người dùng Hoạt động')).toBeInTheDocument()
    })

    it('should render event stats card', async () => {
      await act(async () => {
        render(<AdminDashboardStats />)
      })
      expect(screen.getByText('Tổng Sự kiện')).toBeInTheDocument()
    })

    it('should render ticket stats card', async () => {
      await act(async () => {
        render(<AdminDashboardStats />)
      })
      expect(screen.getByText('Bán Vé')).toBeInTheDocument()
    })
  })
})
