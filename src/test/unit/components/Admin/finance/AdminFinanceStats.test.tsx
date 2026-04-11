/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminFinanceStats from '../../../../../components/Admin/finance/AdminFinanceStats'

const mockDispatch = jest.fn()
let mockRevenueState: any = {}
let mockPaymentState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    REVENUE: mockRevenueState,
    PAYMENT: mockPaymentState,
  }),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-icons/md', () => ({
  MdTrendingUp: () => <span data-testid="icon-trending" />,
  MdAccountBalanceWallet: () => <span data-testid="icon-wallet" />,
  MdOutbound: () => <span data-testid="icon-outbound" />,
  MdReceiptLong: () => <span data-testid="icon-receipt" />,
}))

describe('AdminFinanceStats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
    mockRevenueState = {
      globalRevenue: { data: { grossRevenue: 100000000, netRevenue: 85000000, eventCount: 10 } },
      loading: false,
      error: null,
    }
    mockPaymentState = {
      adminTransactions: { totalCount: 50 },
      loading: { adminTransactions: false },
    }
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<AdminFinanceStats />)
      })
      expect(screen.getByText('Tổng Doanh Thu')).toBeInTheDocument()
    })

    it('should show loading state when loading', async () => {
      mockRevenueState.loading = true
      await act(async () => {
        render(<AdminFinanceStats />)
      })
      expect(screen.getAllByText('Đang tải...').length).toBeGreaterThan(0)
    })

    it('should display finance statistics', async () => {
      await act(async () => {
        render(<AdminFinanceStats />)
      })
      expect(screen.getByText('Phí nền tảng')).toBeInTheDocument()
      expect(screen.getByText('Tổng Thanh toán')).toBeInTheDocument()
      expect(screen.getByText('Giao dịch')).toBeInTheDocument()
    })
  })
})
