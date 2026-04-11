/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminFinanceTransactionsTable from '../../../../../components/Admin/finance/AdminFinanceTransactionsTable'

const mockDispatch = jest.fn()
let mockPaymentState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ PAYMENT: mockPaymentState }),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-icons/md', () => ({
  MdStore: () => <span data-testid="icon-store" />,
  MdVisibility: () => <span data-testid="icon-visibility" />,
  MdChevronLeft: () => <span data-testid="icon-left" />,
  MdChevronRight: () => <span data-testid="icon-right" />,
  MdRefresh: () => <span data-testid="icon-refresh" />,
}))

describe('AdminFinanceTransactionsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
    mockPaymentState = {
      adminTransactions: {
        items: [
          {
            id: 'tx1',
            username: 'user1',
            type: 'BatchDirectPay',
            amount: 1000000,
            internalStatus: 'Completed',
            completedAt: '2024-01-01T10:00:00Z',
          },
        ],
        totalCount: 1,
        totalPages: 1,
        currentStartIndex: 0,
        currentEndIndex: 0,
      },
      loading: { adminTransactions: false },
    }
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<AdminFinanceTransactionsTable />)
      })
      expect(screen.getByText('Lịch sử Giao dịch Chi tiết')).toBeInTheDocument()
    })

    it('should show loading state', async () => {
      mockPaymentState.loading = { adminTransactions: true }
      mockPaymentState.adminTransactions = { items: [] }
      await act(async () => {
        render(<AdminFinanceTransactionsTable />)
      })
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should show empty state when no transactions', async () => {
      mockPaymentState.adminTransactions = { items: [], totalCount: 0 }
      await act(async () => {
        render(<AdminFinanceTransactionsTable />)
      })
      expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument()
    })

    it('should render table headers', async () => {
      await act(async () => {
        render(<AdminFinanceTransactionsTable />)
      })
      expect(screen.getByText('Người dùng')).toBeInTheDocument()
      expect(screen.getByText('Loại')).toBeInTheDocument()
      expect(screen.getByText('Số tiền')).toBeInTheDocument()
    })
  })
})
