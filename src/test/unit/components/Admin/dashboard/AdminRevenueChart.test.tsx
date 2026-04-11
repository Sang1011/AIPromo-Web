/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminRevenueChart from '../../../../../components/Admin/dashboard/AdminRevenueChart'

const mockDispatch = jest.fn()
let mockReportsState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ ADMIN_REPORTS: mockReportsState }),
  useDispatch: () => mockDispatch,
}))

describe('AdminRevenueChart', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
    mockReportsState = {
      salesTrend: [
        { dateLabel: '2024-01-01', revenue: 1000000, transactions: 10 },
        { dateLabel: '2024-01-02', revenue: 2000000, transactions: 20 },
      ],
      loading: false,
    }
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<AdminRevenueChart />)
      })
      expect(screen.getByText('Xu hướng Doanh thu & Giao dịch')).toBeInTheDocument()
    })

    it('should show loading state when loading', async () => {
      mockReportsState.loading = true
      mockReportsState.salesTrend = []
      await act(async () => {
        render(<AdminRevenueChart />)
      })
      expect(screen.getByText('Đang tải dữ liệu...')).toBeInTheDocument()
    })

    it('should show empty state when no data', async () => {
      mockReportsState.salesTrend = []
      await act(async () => {
        render(<AdminRevenueChart />)
      })
      expect(screen.getByText('Không có dữ liệu')).toBeInTheDocument()
    })

    it('should render time range selector', async () => {
      await act(async () => {
        render(<AdminRevenueChart />)
      })
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })
})
