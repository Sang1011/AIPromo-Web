/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import RefundStats from '../../../../../components/Admin/refund/RefundStats'

const mockDispatch = jest.fn()
let mockCancelledEventState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ CANCELLED_EVENT: mockCancelledEventState }),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-icons/md', () => ({
  MdReceiptLong: () => <span data-testid="icon-receipt" />,
  MdPendingActions: () => <span data-testid="icon-pending" />,
  MdPayments: () => <span data-testid="icon-payments" />,
  MdTaskAlt: () => <span data-testid="icon-check" />,
}))

describe('RefundStats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
    mockCancelledEventState = {
      cancelledEvents: {
        totalCount: 5,
        items: [
          { id: '1', title: 'Event 1', createdAt: new Date().toISOString() },
        ],
      },
      loading: false,
    }
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<RefundStats />)
      })
      expect(screen.getByText('Tổng yêu cầu hoàn tiền')).toBeInTheDocument()
    })

    it('should show loading state', async () => {
      mockCancelledEventState.loading = true
      await act(async () => {
        render(<RefundStats />)
      })
      expect(screen.getAllByText('Đang tải...').length).toBeGreaterThan(0)
    })

    it('should display refund statistics', async () => {
      await act(async () => {
        render(<RefundStats />)
      })
      expect(screen.getByText('Sự kiện đã hủy')).toBeInTheDocument()
      expect(screen.getByText('Tỷ lệ đã xử lý')).toBeInTheDocument()
    })
  })
})
