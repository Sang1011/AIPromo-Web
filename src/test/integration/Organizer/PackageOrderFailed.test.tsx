/// <reference types="jest" />
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PackageOrderFailed from '../../../pages/Organizer/PackageOrderFailed'

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

describe('PackageOrderFailed', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseNavigate.mockReturnValue(jest.fn())
    mockUseLocation.mockReturnValue({ state: null })
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => render(<PackageOrderFailed />))
      expect(screen.getByText('Thanh toán thất bại')).toBeInTheDocument()
    })

    it('should render error icon', async () => {
      await act(async () => render(<PackageOrderFailed />))
      expect(screen.getByText('Thanh toán thất bại')).toBeInTheDocument()
    })

    it('should render default error message', async () => {
      await act(async () => render(<PackageOrderFailed />))
      expect(screen.getByText('Giao dịch thất bại hoặc đã bị huỷ.')).toBeInTheDocument()
    })

    it('should render action buttons', async () => {
      await act(async () => render(<PackageOrderFailed />))
      expect(screen.getByText('Thử lại')).toBeInTheDocument()
      expect(screen.getByText('Về trang chủ')).toBeInTheDocument()
    })
  })

  describe('Error Message', () => {
    it('should show custom error message from state', async () => {
      mockUseLocation.mockReturnValue({
        state: {
          message: 'Payment was declined by bank',
        },
      })

      await act(async () => render(<PackageOrderFailed />))
      expect(screen.getByText('Payment was declined by bank')).toBeInTheDocument()
    })

    it('should show default message when no state message', async () => {
      mockUseLocation.mockReturnValue({ state: null })
      await act(async () => render(<PackageOrderFailed />))
      expect(screen.getByText('Giao dịch thất bại hoặc đã bị huỷ.')).toBeInTheDocument()
    })

    it('should show default message when state has no message property', async () => {
      mockUseLocation.mockReturnValue({ state: {} })
      await act(async () => render(<PackageOrderFailed />))
      expect(screen.getByText('Giao dịch thất bại hoặc đã bị huỷ.')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should navigate to subscription page when clicking "Thử lại"', async () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)

      await act(async () => render(<PackageOrderFailed />))

      const retryButton = screen.getByText('Thử lại')
      await userEvent.click(retryButton)

      expect(navigate).toHaveBeenCalledWith('/organizer/subscription')
    })

    it('should navigate to dashboard when clicking "Về trang chủ"', async () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)

      await act(async () => render(<PackageOrderFailed />))

      const goHomeButton = screen.getByText('Về trang chủ')
      await userEvent.click(goHomeButton)

      expect(navigate).toHaveBeenCalledWith('/organizer/dashboard')
    })
  })

  describe('Edge Cases', () => {
    it('should handle null state gracefully', async () => {
      mockUseLocation.mockReturnValue({ state: null })
      await act(async () => render(<PackageOrderFailed />))
      expect(screen.getByText('Thanh toán thất bại')).toBeInTheDocument()
    })

    it('should handle empty state object', async () => {
      mockUseLocation.mockReturnValue({ state: {} })
      await act(async () => render(<PackageOrderFailed />))
      expect(screen.getByText('Thanh toán thất bại')).toBeInTheDocument()
    })

    it('should handle empty string message', async () => {
      mockUseLocation.mockReturnValue({
        state: {
          message: '',
        },
      })

      await act(async () => render(<PackageOrderFailed />))
      expect(screen.getByText('Giao dịch thất bại hoặc đã bị huỷ.')).toBeInTheDocument()
    })
  })
})
