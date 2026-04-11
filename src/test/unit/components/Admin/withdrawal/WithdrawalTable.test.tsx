/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import WithdrawalTable from '../../../../../components/Admin/withdrawal/WithdrawalTable'

const mockDispatch = jest.fn()
let mockWithdrawalState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ WITHDRAWAL: mockWithdrawalState }),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-icons/md', () => ({
  MdVisibility: () => <span data-testid="icon-visibility" />,
  MdFilterList: () => <span data-testid="icon-filter" />,
  MdChevronLeft: () => <span data-testid="icon-left" />,
  MdChevronRight: () => <span data-testid="icon-right" />,
  MdRefresh: () => <span data-testid="icon-refresh" />,
  MdPayments: () => <span data-testid="icon-payments" />,
}))

jest.mock('react-icons/fi', () => ({
  FiChevronDown: () => <span data-testid="icon-down" />,
}))

jest.mock('../../../../../components/Admin/withdrawal/WithdrawalDetailModal', () => ({
  __esModule: true,
  default: ({ isOpen }: any) => isOpen ? <div data-testid="detail-modal" /> : null,
}))

describe('WithdrawalTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
    mockWithdrawalState = {
      withdrawalList: {
        data: {
          items: [
            {
              id: '1',
              userName: 'User One',
              email: 'user1@example.com',
              amount: 5000000,
              bankName: 'Vietcombank',
              bankAccountNumber: '1234567890',
              status: 'Pending',
              createdAt: '2024-01-01T10:00:00Z',
              avatar: 'https://example.com/avatar.jpg',
            },
          ],
          totalPages: 1,
          totalCount: 1,
        },
      },
      loading: false,
      actionLoading: false,
    }
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<WithdrawalTable />)
      })
      expect(screen.getByText('Yêu cầu rút tiền')).toBeInTheDocument()
    })

    it('should show loading state', async () => {
      mockWithdrawalState.loading = true
      mockWithdrawalState.withdrawalList.data.items = []
      await act(async () => {
        render(<WithdrawalTable />)
      })
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should show empty state when no withdrawals', async () => {
      mockWithdrawalState.withdrawalList.data.items = []
      await act(async () => {
        render(<WithdrawalTable />)
      })
      expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument()
    })

    it('should render table headers', async () => {
      await act(async () => {
        render(<WithdrawalTable />)
      })
      expect(screen.getByText('Người dùng')).toBeInTheDocument()
      expect(screen.getByText('Số tiền')).toBeInTheDocument()
      expect(screen.getByText('Ngân hàng')).toBeInTheDocument()
    })

    it('should display withdrawal data', async () => {
      await act(async () => {
        render(<WithdrawalTable />)
      })
      expect(screen.getByText('User One')).toBeInTheDocument()
      expect(screen.getByText('5.000.000 ₫')).toBeInTheDocument()
    })

    it('should show filter and refresh buttons', async () => {
      await act(async () => {
        render(<WithdrawalTable />)
      })
      expect(screen.getByText('Lọc')).toBeInTheDocument()
      expect(screen.getByText('Làm mới')).toBeInTheDocument()
    })
  })
})
