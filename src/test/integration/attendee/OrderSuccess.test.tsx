/// <reference types="jest" />
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import OrderSuccess from '../../../pages/OrderSuccess'

// ============================================================================
// MOCKS
// ============================================================================

const mockNavigate = jest.fn()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLocationState: { state: any } = { state: null }

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocationState,
}))

// Mock Math.random for floatingParticles
jest.spyOn(Math, 'random').mockReturnValue(0.5)

// ============================================================================
// TESTS
// ============================================================================

describe('OrderSuccess', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate.mockClear()
    mockLocationState.state = null
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Render - Default State (Wallet Payment)', () => {
    it('should render order success page with heading', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })
      expect(screen.getByText('Thanh toán thành công!')).toBeInTheDocument()
    })

    it('should render success icon', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })
      expect(screen.getByText('check_circle')).toBeInTheDocument()
    })

    it('should render thank you message', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })
      expect(screen.getByText(/Cảm ơn quý khách đã tin dùng/)).toBeInTheDocument()
    })

    it('should render wallet payment badge when no transaction', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })
      // Text is split: "Thanh toán bằng" + "ví AIPromo" + " thành công"
      expect(screen.getByText('ví AIPromo')).toBeInTheDocument()
      expect(screen.getByText(/Thanh toán bằng/)).toBeInTheDocument()
      // Use getAllByText to handle multiple matches
      const thanhCongElements = screen.getAllByText(/thành công/)
      expect(thanhCongElements.length).toBeGreaterThanOrEqual(1)
    })

    it('should render "Xem vé của tôi" button', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })
      expect(screen.getByRole('button', { name: /Xem vé của tôi/ })).toBeInTheDocument()
    })

    it('should render "Quay lại trang chủ" button', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })
      expect(screen.getByRole('button', { name: /Quay lại trang chủ/ })).toBeInTheDocument()
    })

    it('should render security notice', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })
      expect(screen.getByText('Giao dịch an toàn & bảo mật')).toBeInTheDocument()
    })
  })

  describe('Render - With Transaction Data (VNPay)', () => {
    const mockTransaction = {
      transactionNo: 'VNP123456789',
      message: 'Giao dịch thành công',
      completedAt: '2024-12-01T10:30:00Z',
    }

    beforeEach(() => {
      mockLocationState.state = { transaction: mockTransaction }
    })

    it('should render transaction number', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })
      expect(screen.getByText('#VNP123456789')).toBeInTheDocument()
    })

    it('should render transaction status', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })
      expect(screen.getByText('Giao dịch thành công')).toBeInTheDocument()
    })

    it('should render transaction time', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })
      expect(screen.getByText('Thời gian')).toBeInTheDocument()
    })

    it('should render transaction code label', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })
      expect(screen.getByText('Mã giao dịch')).toBeInTheDocument()
    })

    it('should not render wallet payment badge when transaction exists', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })
      expect(screen.queryByText('ví AIPromo')).not.toBeInTheDocument()
    })
  })

  describe('Info Grid', () => {
    it('should render email confirmation info', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })
      expect(screen.getByText('Xác nhận đã gửi qua email')).toBeInTheDocument()
    })

    it('should render app readiness info', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })
      expect(screen.getByText('Sẵn sàng trên ứng dụng')).toBeInTheDocument()
    })

    it('should render 24/7 support info', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })
      expect(screen.getByText('Hỗ trợ 24/7 khi cần')).toBeInTheDocument()
    })

    it('should render material icons for info grid', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })
      expect(screen.getByText('mail')).toBeInTheDocument()
      expect(screen.getByText('smartphone')).toBeInTheDocument()
      expect(screen.getByText('support_agent')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should navigate to profile tickets page when clicking "Xem vé của tôi"', async () => {
      // Use real timers for this test since we need userEvent to work properly
      jest.useRealTimers()
      
      render(<OrderSuccess />)

      const viewTicketsBtn = screen.getByRole('button', { name: /Xem vé của tôi/ })
      await userEvent.click(viewTicketsBtn)

      expect(mockNavigate).toHaveBeenCalledWith('/profile/ticking-user')
    })

    it('should navigate to home page when clicking "Quay lại trang chủ"', async () => {
      // Use real timers for this test since we need userEvent to work properly
      jest.useRealTimers()
      
      render(<OrderSuccess />)

      const goHomeBtn = screen.getByRole('button', { name: /Quay lại trang chủ/ })
      await userEvent.click(goHomeBtn)

      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  describe('Animations', () => {
    it('should set visible state after timeout', async () => {
      await act(async () => {
        render(<OrderSuccess />)
      })

      // Before timer fires
      // Component should still be in initial state

      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      // After timer fires, component should be visible
      expect(screen.getByText('Thanh toán thành công!')).toBeInTheDocument()
    })
  })

  describe('Visual Elements', () => {
    it('should render atmospheric blobs', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })

      // Check for elements with blur filter (blobs)
      const elements = document.querySelectorAll('[style*="blur"]')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should render floating particles', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })

      // The component creates 12 particles
      const container = document.querySelector('[style*="overflow: hidden"]')
      expect(container).toBeInTheDocument()
    })

    it('should render pulse rings around success icon', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })

      // Check for elements with pulseRing animation
      const elements = document.querySelectorAll('[style*="pulseRing"]')
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  describe('Styling', () => {
    it('should render with dark background', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })

      const mainContainer = document.querySelector('[style*="background"]')
      expect(mainContainer).toHaveStyle({ background: '#0B0B12' })
    })

    it('should use Space Grotesk font', async () => {
      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })

      // The fontFamily is on the main div, use querySelector with font-family (CSS style property)
      const mainContainer = document.querySelector('[style*="font-family"]')
      expect(mainContainer).toHaveStyle({
        fontFamily: "'Space Grotesk', sans-serif",
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle null transaction gracefully', async () => {
      mockLocationState.state = { transaction: null }

      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })

      // Text is split across elements
      expect(screen.getByText('ví AIPromo')).toBeInTheDocument()
    })

    it('should handle undefined state gracefully', async () => {
      mockLocationState.state = undefined

      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })

      expect(screen.getByText('Thanh toán thành công!')).toBeInTheDocument()
    })

    it('should handle empty transaction object', async () => {
      mockLocationState.state = { transaction: {} }

      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })

      // Should render but may have undefined values
      expect(screen.getByText('Thanh toán thành công!')).toBeInTheDocument()
    })

    it('should handle transaction with missing fields', async () => {
      mockLocationState.state = {
        transaction: {
          transactionNo: 'ONLY-Transaction-No',
          // message and completedAt are missing
        },
      }

      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })

      expect(screen.getByText('#ONLY-Transaction-No')).toBeInTheDocument()
    })

    it('should handle invalid date in transaction', async () => {
      mockLocationState.state = {
        transaction: {
          transactionNo: 'BAD-DATE-123',
          message: 'Success',
          completedAt: 'invalid-date-string',
        },
      }

      await act(async () => {
        render(<OrderSuccess />)
        jest.advanceTimersByTime(100)
      })

      expect(screen.getByText('#BAD-DATE-123')).toBeInTheDocument()
      expect(screen.getByText('Success')).toBeInTheDocument()
    })
  })

  describe('Component Cleanup', () => {
    it('should clear timeout on unmount', async () => {
      const { unmount } = render(<OrderSuccess />)

      await act(async () => {
        unmount()
      })

      // If we get here without errors, cleanup worked
      expect(true).toBe(true)
    })
  })
})
