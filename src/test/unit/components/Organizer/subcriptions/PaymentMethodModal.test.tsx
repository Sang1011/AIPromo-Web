/// <reference types="jest" />
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PaymentMethodModal from '../../../../../components/Organizer/subcriptions/PaymentMethodModal'
import type { AIPackage } from '../../../../../types/aiPackage/aiPackage'

// Mock Redux
const mockDispatch = jest.fn()
let mockWalletState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    WALLET: mockWalletState,
  }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../../../../store/aiPackageSlice', () => ({
  createPaymentPackageThunk: jest.fn(({ packageId, method, description, returnUrl }) => ({
    type: 'PACKAGE/createPayment',
    payload: { packageId, method, description, returnUrl },
  })),
}))

// Mock react-router-dom
const mockUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUseNavigate(),
}))

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  loading: jest.fn(() => 'toast-id'),
  error: jest.fn(),
  dismiss: jest.fn(),
}))

describe('PaymentMethodModal', () => {
  const mockPlan: AIPackage = {
    id: 'plan-1',
    name: 'Pro',
    price: 399000,
    tokenQuota: 50000,
    description: 'Professional plan',
    type: 'Subscription',
    isActive: true,
  }

  const mockOnClose = jest.fn()
  const mockNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseNavigate.mockReturnValue(mockNavigate)
    mockWalletState = { currentWallet: { balance: 1500000 } }
    mockDispatch.mockResolvedValue({ paymentUrl: 'https://payment.example.com' })
  })

  describe('Render', () => {
    it('should render payment method selection header', () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      expect(screen.getByText('Chọn phương thức thanh toán')).toBeInTheDocument()
    })

    it('should render plan name', () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      expect(screen.getByText('Pro')).toBeInTheDocument()
    })

    it('should render formatted price', () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      expect(screen.getByText('399.000 ₫')).toBeInTheDocument()
    })

    it('should render VNPay option', () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      expect(screen.getByText('VNPay')).toBeInTheDocument()
      expect(screen.getByText('ATM, Visa, Mastercard, QR Code')).toBeInTheDocument()
    })

    it('should render wallet option', () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      expect(screen.getByText('Ví của tôi')).toBeInTheDocument()
    })

    it('should render wallet balance', () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      expect(screen.getByText('1.500.000 ₫')).toBeInTheDocument()
    })

    it('should render total payment amount', () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      expect(screen.getByText('Tổng thanh toán')).toBeInTheDocument()
      expect(screen.getByText('399.000 ₫')).toBeInTheDocument()
    })

    it('should render confirm button', () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      expect(screen.getByText('Thanh toán qua VNPay')).toBeInTheDocument()
    })
  })

  describe('VNPay Selection', () => {
    it('should select VNPay by default', () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const vnPayRadio = document.querySelector('.border-purple-500')
      expect(vnPayRadio).toBeInTheDocument()
    })

    it('should highlight VNPay when selected', async () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const vnPayButton = screen.getByText('VNPay').closest('button')
      await userEvent.click(vnPayButton!)
      expect(vnPayButton).toHaveClass('border-purple-500/50')
    })

    it('should show check icon when VNPay is selected', () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const checkIcon = document.querySelector('.text-purple-400')
      expect(checkIcon).toBeInTheDocument()
    })
  })

  describe('Wallet Selection', () => {
    it('should select wallet when clicking wallet option', async () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const walletButton = screen.getByText('Ví của tôi').closest('button')
      await userEvent.click(walletButton!)
      expect(walletButton).toHaveClass('border-emerald-500/40')
    })

    it('should show wallet balance with green color when sufficient', () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const balanceText = screen.getByText('1.500.000 ₫')
      expect(balanceText).toHaveClass('text-emerald-400')
    })

    it('should show warning when wallet balance is insufficient', () => {
      mockWalletState = { currentWallet: { balance: 200000 } }
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      expect(screen.getByText('Không đủ số dư')).toBeInTheDocument()
    })

    it('should show required additional amount when balance is insufficient', () => {
      mockWalletState = { currentWallet: { balance: 200000 } }
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      expect(screen.getByText('199.000 ₫')).toBeInTheDocument()
    })

    it('should disable wallet option when balance is insufficient', () => {
      mockWalletState = { currentWallet: { balance: 200000 } }
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const walletButton = screen.getByText('Ví của tôi').closest('button')
      expect(walletButton).toBeDisabled()
    })

    it('should show insufficient balance warning message', () => {
      mockWalletState = { currentWallet: { balance: 200000 } }
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      expect(screen.getByText(/Cần thêm/)).toBeInTheDocument()
    })

    it('should not select wallet when balance is insufficient', async () => {
      mockWalletState = { currentWallet: { balance: 200000 } }
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const walletButton = screen.getByText('Ví của tôi').closest('button')
      await userEvent.click(walletButton!)
      expect(walletButton).not.toHaveClass('border-emerald-500/40')
    })
  })

  describe('Confirm Button', () => {
    it('should show VNPay payment text when VNPay is selected', () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      expect(screen.getByText('Thanh toán qua VNPay')).toBeInTheDocument()
    })

    it('should show wallet payment text when wallet is selected', async () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const walletButton = screen.getByText('Ví của tôi').closest('button')
      await userEvent.click(walletButton!)
      expect(screen.getByText('Thanh toán từ ví')).toBeInTheDocument()
    })

    it('should disable confirm when wallet is selected but balance is insufficient', async () => {
      mockWalletState = { currentWallet: { balance: 200000 } }
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const confirmButton = screen.getByText('Thanh toán qua VNPay').closest('button')
      // Switch to wallet - should be disabled
      const walletButton = screen.getByText('Ví của tôi').closest('button')
      await userEvent.click(walletButton!)
      // Should stay on VNPay since wallet is disabled
      expect(confirmButton).toHaveTextContent('Thanh toán qua VNPay')
    })
  })

  describe('User Interactions', () => {
    it('should call onClose when clicking close button', async () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const closeButton = screen.getByRole('button', { name: '' })
      await userEvent.click(closeButton)
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onClose when clicking overlay', async () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const overlay = screen.getByText('Chọn phương thức thanh toán').closest('.fixed')
      if (overlay) {
        await userEvent.click(overlay)
        expect(mockOnClose).toHaveBeenCalled()
      }
    })

    it('should not close modal when loading', async () => {
      mockDispatch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ paymentUrl: 'https://payment.example.com' }), 100))
      )

      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const confirmButton = screen.getByText('Thanh toán qua VNPay').closest('button')
      await userEvent.click(confirmButton!)

      const overlay = screen.getByText('Chọn phương thức thanh toán').closest('.fixed')
      if (overlay) {
        await userEvent.click(overlay)
        expect(mockOnClose).not.toHaveBeenCalled()
      }
    })
  })

  describe('VNPay Payment Flow', () => {
    it('should redirect to VNPay payment URL', async () => {
      const originalHref = window.location.href
      const mockLocation = { href: '' }
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      })

      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const confirmButton = screen.getByText('Thanh toán qua VNPay').closest('button')
      await userEvent.click(confirmButton!)

      await waitFor(() => {
        expect(mockLocation.href).toBe('https://payment.example.com')
      })

      Object.defineProperty(window, 'location', {
        value: { href: originalHref },
        writable: true,
      })
    })

    it('should show error when VNPay returns no payment URL', async () => {
      const { error } = require('react-hot-toast')
      mockDispatch.mockResolvedValue({})

      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const confirmButton = screen.getByText('Thanh toán qua VNPay').closest('button')
      await userEvent.click(confirmButton!)

      await waitFor(() => {
        expect(error).toHaveBeenCalledWith('Không nhận được link thanh toán. Vui lòng thử lại.')
      })
    })
  })

  describe('Wallet Payment Flow', () => {
    it('should navigate to success page after wallet payment', async () => {
      mockDispatch.mockResolvedValue({ success: true })

      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const walletButton = screen.getByText('Ví của tôi').closest('button')
      await userEvent.click(walletButton!)

      const confirmButton = screen.getByText('Thanh toán từ ví').closest('button')
      await userEvent.click(confirmButton!)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/organizer/payment/packages/success', {
          replace: true,
          state: { transaction: { success: true } },
        })
      })
    })

    it('should navigate to failed page on wallet payment error', async () => {
      mockDispatch.mockRejectedValue(new Error('Payment failed'))

      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const walletButton = screen.getByText('Ví của tôi').closest('button')
      await userEvent.click(walletButton!)

      const confirmButton = screen.getByText('Thanh toán từ ví').closest('button')
      await userEvent.click(confirmButton!)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/organizer/payment/packages/failed', {
          replace: true,
          state: { message: 'Payment failed' },
        })
      })
    })
  })

  describe('Loading State', () => {
    it('should show spinner when processing payment', async () => {
      mockDispatch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ paymentUrl: 'https://payment.example.com' }), 100))
      )

      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const confirmButton = screen.getByText('Thanh toán qua VNPay').closest('button')
      await userEvent.click(confirmButton!)

      await waitFor(() => {
        expect(screen.getByText(/Đang xử lý/)).toBeInTheDocument()
      })
    })

    it('should disable buttons when processing', async () => {
      mockDispatch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ paymentUrl: 'https://payment.example.com' }), 100))
      )

      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const confirmButton = screen.getByText('Thanh toán qua VNPay').closest('button')
      await userEvent.click(confirmButton!)

      const closeButton = screen.getByRole('button', { name: '' })
      expect(closeButton).toBeDisabled()
    })
  })

  describe('Styling', () => {
    it('should render with dark background', () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const modal = screen.getByText('Chọn phương thức thanh toán').closest('.bg-\\[\\#18122B\\]')
      expect(modal).toHaveClass('bg-[#18122B]')
    })

    it('should render with rounded corners', () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const modal = screen.getByText('Chọn phương thức thanh toán').closest('.rounded-2xl')
      expect(modal).toHaveClass('rounded-2xl')
    })

    it('should render top gradient accent line', () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const gradientLine = document.querySelector('.bg-gradient-to-r')
      expect(gradientLine).toHaveClass('from-purple-600', 'via-purple-400')
    })

    it('should render VNPay option with blue icon', () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const vnPayIcon = document.querySelector('.text-blue-400')
      expect(vnPayIcon).toBeInTheDocument()
    })

    it('should render wallet option with emerald icon', () => {
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      const walletIcon = document.querySelector('.text-emerald-400')
      expect(walletIcon).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero wallet balance', () => {
      mockWalletState = { currentWallet: { balance: 0 } }
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      expect(screen.getByText('0 ₫')).toBeInTheDocument()
    })

    it('should handle null wallet', () => {
      mockWalletState = { currentWallet: null }
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      expect(screen.getByText('0 ₫')).toBeInTheDocument()
    })

    it('should handle very expensive plans', () => {
      const expensivePlan = { ...mockPlan, price: 100000000 }
      render(<PaymentMethodModal plan={expensivePlan} onClose={mockOnClose} />)
      expect(screen.getByText('100.000.000 ₫')).toBeInTheDocument()
    })

    it('should handle free plans', () => {
      const freePlan = { ...mockPlan, price: 0 }
      render(<PaymentMethodModal plan={freePlan} onClose={mockOnClose} />)
      expect(screen.getByText('0 ₫')).toBeInTheDocument()
    })

    it('should handle special characters in plan name', () => {
      const specialPlan = { ...mockPlan, name: 'Pro <Premium>' }
      render(<PaymentMethodModal plan={specialPlan} onClose={mockOnClose} />)
      expect(screen.getByText('Pro <Premium>')).toBeInTheDocument()
    })

    it('should handle exact balance match', () => {
      mockWalletState = { currentWallet: { balance: 399000 } }
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      expect(screen.getByText('399.000 ₫')).toHaveClass('text-emerald-400')
    })

    it('should handle large wallet balance', () => {
      mockWalletState = { currentWallet: { balance: 10000000000 } }
      render(<PaymentMethodModal plan={mockPlan} onClose={mockOnClose} />)
      expect(screen.getByText('10.000.000.000 ₫')).toBeInTheDocument()
    })
  })
})
