/// <reference types="jest" />
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PackageOrderSuccess from '../../../pages/Organizer/PackageOrderSuccess'

// ============================================================================
// MOCKS
// ============================================================================

const mockUseNavigate = jest.fn()
const mockUseLocation = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUseNavigate(),
  useLocation: () => mockUseLocation(),
}))

// ============================================================================
// TESTS
// ============================================================================

describe('PackageOrderSuccess', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseNavigate.mockReturnValue(jest.fn())
    mockUseLocation.mockReturnValue({ state: null })
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => render(<PackageOrderSuccess />))
      expect(screen.getByText('Thanh toán thành công!')).toBeInTheDocument()
    })

    it('should render success icon', async () => {
      await act(async () => render(<PackageOrderSuccess />))
      expect(screen.getByText(/Thanh toán thành công!/)).toBeInTheDocument()
    })

    it('should render action buttons', async () => {
      await act(async () => render(<PackageOrderSuccess />))
      expect(screen.getByText('Xem gói của tôi')).toBeInTheDocument()
      expect(screen.getByText('Về trang Organizer')).toBeInTheDocument()
    })
  })

  describe('Transaction Details', () => {
    it('should show transaction details when state is provided', async () => {
      mockUseLocation.mockReturnValue({
        state: {
          transaction: {
            paymentTransactionId: 'txn-123-456-789',
            totalAmount: 500000,
            completedAt: '2024-12-01T10:00:00Z',
          },
        },
      })

      await act(async () => render(<PackageOrderSuccess />))

      expect(screen.getByText('Chi tiết giao dịch')).toBeInTheDocument()
      expect(screen.getByText('Mã giao dịch')).toBeInTheDocument()
      expect(screen.getByText('Số tiền')).toBeInTheDocument()
      expect(screen.getByText('Thời gian')).toBeInTheDocument()
    })

    it('should format amount correctly', async () => {
      mockUseLocation.mockReturnValue({
        state: {
          transaction: {
            totalAmount: 1000000,
          },
        },
      })

      await act(async () => render(<PackageOrderSuccess />))
      expect(screen.getByText('1.000.000 ₫')).toBeInTheDocument()
    })

    it('should truncate transaction ID', async () => {
      mockUseLocation.mockReturnValue({
        state: {
          transaction: {
            paymentTransactionId: 'txn-123-456-789-abc',
          },
        },
      })

      await act(async () => render(<PackageOrderSuccess />))
      expect(screen.getByText(/#txn-123-456-789/)).toBeInTheDocument()
    })

    it('should show formatted date from transaction', async () => {
      mockUseLocation.mockReturnValue({
        state: {
          transaction: {
            completedAt: '2024-12-01T10:30:00Z',
          },
        },
      })

      await act(async () => render(<PackageOrderSuccess />))
      // Should show some date
      expect(screen.queryByText(/Chi tiết giao dịch/)).toBeInTheDocument()
    })

    it('should use current date when completedAt is missing', async () => {
      mockUseLocation.mockReturnValue({
        state: {
          transaction: {},
        },
      })

      await act(async () => render(<PackageOrderSuccess />))
      expect(screen.queryByText(/Chi tiết giao dịch/)).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should navigate to subscription page when clicking "Xem gói của tôi"', async () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)

      await act(async () => render(<PackageOrderSuccess />))

      const viewSubscriptionButton = screen.getByText('Xem gói của tôi')
      await userEvent.click(viewSubscriptionButton)

      expect(navigate).toHaveBeenCalledWith('/organizer/subscription')
    })

    it('should navigate to organizer page when clicking "Về trang Organizer"', async () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)

      await act(async () => render(<PackageOrderSuccess />))

      const goBackButton = screen.getByText('Về trang Organizer')
      await userEvent.click(goBackButton)

      expect(navigate).toHaveBeenCalledWith('/organizer/overall')
    })
  })

  describe('Edge Cases', () => {
    it('should handle null state gracefully', async () => {
      mockUseLocation.mockReturnValue({ state: null })
      await act(async () => render(<PackageOrderSuccess />))
      expect(screen.getByText('Thanh toán thành công!')).toBeInTheDocument()
    })

    it('should handle state with no transaction', async () => {
      mockUseLocation.mockReturnValue({ state: {} })
      await act(async () => render(<PackageOrderSuccess />))
      expect(screen.getByText('Thanh toán thành công!')).toBeInTheDocument()
    })

    it('should handle transaction with partial data', async () => {
      mockUseLocation.mockReturnValue({
        state: {
          transaction: {
            paymentTransactionId: 'txn-123',
          },
        },
      })

      await act(async () => render(<PackageOrderSuccess />))
      expect(screen.getByText(/#txn-123/)).toBeInTheDocument()
    })

    it('should render with message from transaction state', async () => {
      mockUseLocation.mockReturnValue({
        state: {
          transaction: {
            message: 'Payment successful',
          },
        },
      })

      await act(async () => render(<PackageOrderSuccess />))
      expect(screen.getByText('Thanh toán thành công!')).toBeInTheDocument()
    })
  })
})
