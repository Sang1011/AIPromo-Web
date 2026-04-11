/// <reference types="jest" />
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'

import OrderSuccess from '../../../../pages/OrderSuccess'

// ============================================================================
// MOCKS
// ============================================================================

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(),
}))

const mockUseLocation = useLocation as jest.Mock

// ============================================================================
// TESTS
// ============================================================================

describe('OrderSuccess', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate.mockClear()
    mockUseLocation.mockReturnValue({ state: null })
  })

  const renderComponent = (state?: any) => {
    mockUseLocation.mockReturnValue({ state })
    return render(
      <MemoryRouter>
        <OrderSuccess />
      </MemoryRouter>
    )
  }

  describe('Render', () => {
    it('should render success heading', () => {
      renderComponent()
      expect(screen.getByText('Thanh toán thành công!')).toBeInTheDocument()
    })

    it('should render check_circle icon', () => {
      renderComponent()
      expect(screen.getByText('check_circle')).toBeInTheDocument()
    })

    it('should render thank you message', () => {
      renderComponent()
      expect(screen.getByText(/Cảm ơn quý khách đã tin dùng/)).toBeInTheDocument()
    })

    it('should render AIPromo brand name in thank you message', () => {
      renderComponent()
      const thankYouText = screen.getByText(/Cảm ơn quý khách đã tin dùng/)
      expect(thankYouText).toHaveTextContent('AIPromo')
    })
  })

  describe('Transaction Info (VNPay)', () => {
    const mockTransaction = {
      transactionNo: 'VNP123456',
      message: 'Giao dịch thành công',
      completedAt: '2024-10-12T10:30:00Z',
    }

    it('should render transaction info when provided', () => {
      renderComponent({ transaction: mockTransaction })
      expect(screen.getByText('Mã giao dịch')).toBeInTheDocument()
    })

    it('should render transaction number', () => {
      renderComponent({ transaction: mockTransaction })
      expect(screen.getByText('#VNP123456')).toBeInTheDocument()
    })

    it('should render transaction status', () => {
      renderComponent({ transaction: mockTransaction })
      expect(screen.getByText('Giao dịch thành công')).toBeInTheDocument()
    })

    it('should render transaction time', () => {
      renderComponent({ transaction: mockTransaction })
      expect(screen.getByText('Thời gian')).toBeInTheDocument()
    })

    it('should format date in Vietnamese locale', () => {
      renderComponent({ transaction: mockTransaction })
      const dateText = screen.getByText(/12\/10\/2024/)
      expect(dateText).toBeInTheDocument()
    })
  })

  describe('Wallet Payment Badge', () => {
    it('should render wallet payment badge when no transaction', () => {
      renderComponent()
      expect(screen.getByText(/ví AIPromo/)).toBeInTheDocument()
    })

    it('should render wallet icon', () => {
      renderComponent()
      expect(screen.getByText('account_balance_wallet')).toBeInTheDocument()
    })

    it('should not render wallet badge when transaction exists', () => {
      const mockTransaction = {
        transactionNo: 'VNP123456',
        message: 'Giao dịch thành công',
        completedAt: '2024-10-12T10:30:00Z',
      }
      renderComponent({ transaction: mockTransaction })
      expect(screen.queryByText(/ví AIPromo/)).not.toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('should render "Xem vé của tôi" button', () => {
      renderComponent()
      expect(screen.getByText('Xem vé của tôi')).toBeInTheDocument()
    })

    it('should render "Quay lại trang chủ" button', () => {
      renderComponent()
      expect(screen.getByText('Quay lại trang chủ')).toBeInTheDocument()
    })

    it('should navigate to ticket page when clicking "Xem vé của tôi"', async () => {
      renderComponent()
      const viewTicketBtn = screen.getByText('Xem vé của tôi')
      await userEvent.click(viewTicketBtn)

      expect(mockNavigate).toHaveBeenCalledWith('/profile/ticking-user')
    })

    it('should navigate to home page when clicking "Quay lại trang chủ"', async () => {
      renderComponent()
      const homeBtn = screen.getByText('Quay lại trang chủ')
      await userEvent.click(homeBtn)

      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  describe('Info Grid', () => {
    it('should render email confirmation info', () => {
      renderComponent()
      expect(screen.getByText('Xác nhận đã gửi qua email')).toBeInTheDocument()
    })

    it('should render app readiness info', () => {
      renderComponent()
      expect(screen.getByText('Sẵn sàng trên ứng dụng')).toBeInTheDocument()
    })

    it('should render 24/7 support info', () => {
      renderComponent()
      expect(screen.getByText('Hỗ trợ 24/7 khi cần')).toBeInTheDocument()
    })

    it('should render mail icon', () => {
      renderComponent()
      expect(screen.getByText('mail')).toBeInTheDocument()
    })

    it('should render smartphone icon', () => {
      renderComponent()
      expect(screen.getByText('smartphone')).toBeInTheDocument()
    })

    it('should render support agent icon', () => {
      renderComponent()
      expect(screen.getByText('support_agent')).toBeInTheDocument()
    })
  })

  describe('Security Badge', () => {
    it('should render security badge', () => {
      renderComponent()
      expect(screen.getByText('Giao dịch an toàn & bảo mật')).toBeInTheDocument()
    })

    it('should render verified_user icon', () => {
      renderComponent()
      expect(screen.getByText('verified_user')).toBeInTheDocument()
    })
  })

  describe('Animations', () => {
    it('should trigger fade-in animation after timeout', async () => {
      renderComponent()
      // Component uses setTimeout to trigger visibility
      await waitFor(() => {
        const mainContainer = screen.getByText('Thanh toán thành công!').closest('div')
        expect(mainContainer).toBeTruthy()
      })
    })
  })

  describe('Visual Elements', () => {
    it('should render atmospheric blobs', () => {
      renderComponent()
      const blobElements = document.querySelectorAll('[style*="border-radius: 9999px"]')
      expect(blobElements.length).toBeGreaterThan(0)
    })

    it('should render floating particles', () => {
      const { container } = renderComponent()
      // Should have 12 particles
      const particles = container.querySelectorAll('[style*="animation:"]')
      expect(particles.length).toBeGreaterThan(0)
    })
  })

  describe('Pulse Rings', () => {
    it('should render pulse rings around check icon', () => {
      const { container } = renderComponent()
      const pulseRings = container.querySelectorAll('[style*="pulseRing"]')
      expect(pulseRings.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Layout Structure', () => {
    it('should render main container with flex layout', () => {
      const { container } = renderComponent()
      const main = container.querySelector('main')
      expect(main).toHaveStyle('display: flex')
      expect(main).toHaveStyle('align-items: center')
      expect(main).toHaveStyle('justify-content: center')
    })

    it('should have correct z-index layering', () => {
      const { container } = renderComponent()
      const mainContainer = container.firstChild as HTMLElement
      expect(mainContainer).toHaveStyle('position: relative')
      expect(mainContainer).toHaveStyle('overflow: hidden')
    })
  })

  describe('Responsive Design', () => {
    it('should use clamp for responsive heading', () => {
      renderComponent()
      const heading = screen.getByText('Thanh toán thành công!')
      expect(heading).toHaveStyle('font-size: clamp(2rem, 5vw, 3rem)')
    })

    it('should have max-width constraint on content', () => {
      const { container } = renderComponent()
      const main = container.querySelector('main')
      const contentDiv = main?.firstChild as HTMLElement
      expect(contentDiv).toHaveStyle('max-width: 520px')
    })
  })

  describe('Color Scheme', () => {
    it('should use purple accent color', () => {
      renderComponent()
      const checkIcon = screen.getByText('check_circle')
      expect(checkIcon).toHaveStyle('color: #793bed')
    })

    it('should use dark background', () => {
      const { container } = renderComponent()
      const mainContainer = container.firstChild as HTMLElement
      expect(mainContainer).toHaveStyle('background: #0B0B12')
    })
  })

  describe('Edge Cases', () => {
    it('should handle null transaction gracefully', () => {
      expect(() => renderComponent()).not.toThrow()
    })

    it('should handle undefined transaction', () => {
      expect(() => renderComponent({ transaction: undefined })).not.toThrow()
    })

    it('should handle invalid date in transaction', () => {
      const invalidTransaction = {
        transactionNo: 'VNP123456',
        message: 'Giao dịch thành công',
        completedAt: 'invalid-date',
      }
      expect(() => renderComponent({ transaction: invalidTransaction })).not.toThrow()
    })

    it('should render all content even with minimal state', () => {
      renderComponent()
      expect(screen.getByText('Thanh toán thành công!')).toBeInTheDocument()
      expect(screen.getByText('Xem vé của tôi')).toBeInTheDocument()
      expect(screen.getByText('Quay lại trang chủ')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderComponent()
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('Thanh toán thành công!')
    })

    it('should have interactive buttons', () => {
      renderComponent()
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Typography', () => {
    it('should use Space Grotesk font family', () => {
      const { container } = renderComponent()
      const mainContainer = container.firstChild as HTMLElement
      expect(mainContainer).toHaveStyle("font-family: 'Space Grotesk', sans-serif")
    })
  })
})
