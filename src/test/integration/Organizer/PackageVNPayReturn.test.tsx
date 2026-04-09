/// <reference types="jest" />
import { render, screen, waitFor } from '@testing-library/react'

import PackageVNPayReturn from '../../../pages/Organizer/PackageVNPayReturn'

// ============================================================================
// MOCKS
// ============================================================================

const mockUseNavigate = jest.fn()
const mockUseSearchParams = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUseNavigate(),
  useSearchParams: () => mockUseSearchParams(),
}))

// Mock fetch
global.fetch = jest.fn()

// Mock import.meta.env using jest.mock
jest.mock('../../../pages/Organizer/PackageVNPayReturn', () => {
  const originalModule = jest.requireActual('../../../pages/Organizer/PackageVNPayReturn')
  return {
    ...originalModule,
  }
})

// Mock window.location.origin
const originalLocation = window.location
Object.defineProperty(window, 'location', {
  value: {
    ...originalLocation,
    origin: 'https://example.com',
  },
  writable: true,
})

// ============================================================================
// TESTS
// ============================================================================

describe('PackageVNPayReturn', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseNavigate.mockReturnValue(jest.fn())
    mockUseSearchParams.mockReturnValue({
      toString: () => 'vnp_ResponseCode=00&vnp_TransactionNo=123',
    })
      ; (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('api.example.com')) {
          return Promise.resolve({
            json: () => Promise.resolve({
              isSuccess: true,
              data: { isSuccess: true },
            }),
          })
        }
        if (url.includes('localhost:7000')) {
          return Promise.resolve({
            json: () => Promise.resolve({
              isSuccess: true,
              data: { isSuccess: true },
            }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })
  })

  describe('Render', () => {
    it('should render loading state', async () => {
      render(<PackageVNPayReturn />)
      expect(screen.getByText(/Đang xác nhận thanh toán gói/)).toBeInTheDocument()
    })

    it('should render spinner', async () => {
      render(<PackageVNPayReturn />)
      const spinner = document.querySelector('[style*="animation: spin"]')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('API Calls', () => {
    it('should call VNPay callback URL on mount', async () => {
      render(<PackageVNPayReturn />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(callArgs).toContain('payments/vnpay/return')
    })
  })

  describe('Navigation', () => {
    it('should navigate to success page on successful payment', async () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)

        ; (global.fetch as jest.Mock).mockResolvedValue({
          json: () =>
            Promise.resolve({
              isSuccess: true,
              data: {
                isSuccess: true,
                paymentTransactionId: 'txn-123',
                totalAmount: 500000,
                completedAt: '2024-12-01T10:00:00Z',
              },
            }),
        })

      render(<PackageVNPayReturn />)

      await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('/organizer/payment/packages/success', {
          replace: true,
          state: {
            transaction: {
              isSuccess: true,
              paymentTransactionId: 'txn-123',
              totalAmount: 500000,
              completedAt: '2024-12-01T10:00:00Z',
            },
          },
        })
      })
    })

    it('should navigate to failed page on payment failure', async () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)

        ; (global.fetch as jest.Mock).mockResolvedValue({
          json: () =>
            Promise.resolve({
              isSuccess: false,
              data: { message: 'Payment declined' },
            }),
        })

      render(<PackageVNPayReturn />)

      await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('/organizer/payment/packages/failed', {
          replace: true,
          state: { message: 'Payment declined' },
        })
      })
    })

    it('should navigate to failed page with default message if no message provided', async () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)

        ; (global.fetch as jest.Mock).mockResolvedValue({
          json: () => Promise.resolve({ isSuccess: false, data: {} }),
        })

      render(<PackageVNPayReturn />)

      await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('/organizer/payment/packages/failed', {
          replace: true,
          state: { message: 'Giao dịch thất bại.' },
        })
      })
    })

    it('should navigate to failed page on fetch error', async () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)

        ; (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<PackageVNPayReturn />)

      await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('/organizer/payment/packages/failed', {
          replace: true,
        })
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty search params', async () => {
      mockUseSearchParams.mockReturnValue({
        toString: () => '',
      })

        ; (global.fetch as jest.Mock).mockResolvedValue({
          json: () => Promise.resolve({ isSuccess: true, data: { isSuccess: true } }),
        })

      render(<PackageVNPayReturn />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(callArgs).toContain('payments/vnpay/return?')
    })

    it('should handle malformed response', async () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)

        ; (global.fetch as jest.Mock).mockResolvedValue({
          json: () => Promise.resolve(null),
        })

      render(<PackageVNPayReturn />)

      await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('/organizer/payment/packages/failed', {
          replace: true,
        })
      })
    })
  })
})
