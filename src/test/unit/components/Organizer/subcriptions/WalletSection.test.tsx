/// <reference types="jest" />
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import WalletSection from '../../../../../components/Organizer/subcriptions/WalletSection'

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
jest.mock('../../../../../store/walletSlice', () => ({
  fetchToUpWallet: jest.fn(({ amount, description }) => ({
    type: 'WALLET/topUp',
    payload: { amount, description },
  })),
}))

describe('WalletSection', () => {
  const mockWallet = {
    balance: 1500000,
    status: 'ACTIVE',
    transactions: [
      {
        id: 'tx-1',
        amount: 500000,
        direction: 'IN',
        status: 'SUCCESS',
        note: 'Nạp tiền vào ví',
        createdAt: '2024-12-01T10:00:00Z',
      },
      {
        id: 'tx-2',
        amount: 200000,
        direction: 'OUT',
        status: 'COMPLETED',
        note: 'Thanh toán gói Pro',
        createdAt: '2024-11-15T14:00:00Z',
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockWalletState = { currentWallet: mockWallet }
    mockDispatch.mockResolvedValue({ data: { paymentUrl: 'https://payment.example.com' } })
  })

  describe('Render', () => {
    it('should render wallet section', () => {
      render(<WalletSection />)
      expect(screen.getByText('Ví của bạn')).toBeInTheDocument()
    })

    it('should render formatted balance', () => {
      render(<WalletSection />)
      expect(screen.getByText('1.500.000 ₫')).toBeInTheDocument()
    })

    it('should render active status', () => {
      render(<WalletSection />)
      expect(screen.getByText('Đang hoạt động')).toBeInTheDocument()
    })

    it('should render top-up button', () => {
      render(<WalletSection />)
      expect(screen.getByText('Nạp tiền')).toBeInTheDocument()
    })

    it('should render recent transactions header', () => {
      render(<WalletSection />)
      expect(screen.getByText('Giao dịch gần đây')).toBeInTheDocument()
    })

    it('should render transaction list', () => {
      render(<WalletSection />)
      expect(screen.getByText('Nạp tiền vào ví')).toBeInTheDocument()
      expect(screen.getByText('Thanh toán gói Pro')).toBeInTheDocument()
    })
  })

  describe('Transaction Display', () => {
    it('should render IN transactions with green color', () => {
      render(<WalletSection />)
      const inTransaction = screen.getByText('+500.000 ₫')
      expect(inTransaction).toHaveClass('text-emerald-400')
    })

    it('should render OUT transactions with red color', () => {
      render(<WalletSection />)
      const outTransaction = screen.getByText('-200.000 ₫')
      expect(outTransaction).toHaveClass('text-red-400')
    })

    it('should render transaction status icons', () => {
      render(<WalletSection />)
      const icons = document.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should render formatted transaction dates', () => {
      render(<WalletSection />)
      expect(screen.getByText('01/12/2024')).toBeInTheDocument()
    })

    it('should render success status for completed transactions', () => {
      render(<WalletSection />)
      expect(screen.getByText('Thành công')).toBeInTheDocument()
    })

    it('should render default note when transaction has no note', () => {
      const walletWithEmptyNote = {
        ...mockWallet,
        transactions: [
          { id: 'tx-3', amount: 100000, direction: 'IN', status: 'SUCCESS', note: '', createdAt: '2024-12-01T10:00:00Z' },
        ],
      }
      mockWalletState = { currentWallet: walletWithEmptyNote }
      render(<WalletSection />)
      expect(screen.getByText('Giao dịch')).toBeInTheDocument()
    })
  })

  describe('Top-Up Modal', () => {
    it('should open modal when clicking top-up button', async () => {
      render(<WalletSection />)
      await userEvent.click(screen.getByText('Nạp tiền'))
      expect(screen.getByText('Nạp tiền vào ví')).toBeInTheDocument()
    })

    it('should close modal when clicking close button', async () => {
      render(<WalletSection />)
      await userEvent.click(screen.getByText('Nạp tiền'))
      const closeButton = screen.getByRole('button', { name: '' })
      await userEvent.click(closeButton)
      await waitFor(() => {
        expect(screen.queryByText('Nạp tiền vào ví')).not.toBeInTheDocument()
      })
    })

    it('should show quick amount buttons', async () => {
      render(<WalletSection />)
      await userEvent.click(screen.getByText('Nạp tiền'))
      expect(screen.getByText('50k')).toBeInTheDocument()
      expect(screen.getByText('100k')).toBeInTheDocument()
      expect(screen.getByText('500k')).toBeInTheDocument()
    })

    it('should select quick amount when clicking quick button', async () => {
      render(<WalletSection />)
      await userEvent.click(screen.getByText('Nạp tiền'))
      await userEvent.click(screen.getByText('500k'))
      expect(screen.getByDisplayValue('500.000')).toBeInTheDocument()
    })

    it('should validate minimum amount', async () => {
      render(<WalletSection />)
      await userEvent.click(screen.getByText('Nạp tiền'))

      const submitButton = screen.getByText(/Nạp/)
      // Button should be disabled for amounts below 10,000
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit for valid amounts', async () => {
      render(<WalletSection />)
      await userEvent.click(screen.getByText('Nạp tiền'))

      await userEvent.click(screen.getByText('500k'))
      const submitButton = screen.getByText('Nạp 500.000 ₫')
      expect(submitButton).not.toBeDisabled()
    })

    it('should format input amount with thousand separators', async () => {
      render(<WalletSection />)
      await userEvent.click(screen.getByText('Nạp tiền'))

      const input = screen.getByPlaceholderText('Nhập số tiền...')
      await userEvent.type(input, '1000000')
      expect(input).toHaveValue('1.000.000')
    })

    it('should reject non-numeric input', async () => {
      render(<WalletSection />)
      await userEvent.click(screen.getByText('Nạp tiền'))

      const input = screen.getByPlaceholderText('Nhập số tiền...')
      await userEvent.type(input, 'abc')
      expect(input).toHaveValue('')
    })

    it('should show error message on failed top-up', async () => {
      mockDispatch.mockResolvedValue({})

      render(<WalletSection />)
      await userEvent.click(screen.getByText('Nạp tiền'))
      await userEvent.click(screen.getByText('500k'))

      const submitButton = screen.getByText('Nạp 500.000 ₫')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Không nhận được link thanh toán. Vui lòng thử lại.')).toBeInTheDocument()
      })
    })

    it('should redirect to payment URL on successful top-up', async () => {
      const originalHref = window.location.href
      const mockLocation = { href: '' }
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      })

      render(<WalletSection />)
      await userEvent.click(screen.getByText('Nạp tiền'))
      await userEvent.click(screen.getByText('500k'))

      const submitButton = screen.getByText('Nạp 500.000 ₫')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockLocation.href).toBe('https://payment.example.com')
      })

      // Restore
      Object.defineProperty(window, 'location', {
        value: { href: originalHref },
        writable: true,
      })
    })

    it('should show loading state during top-up', async () => {
      mockDispatch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: { paymentUrl: 'https://payment.example.com' } }), 100))
      )

      render(<WalletSection />)
      await userEvent.click(screen.getByText('Nạp tiền'))
      await userEvent.click(screen.getByText('500k'))

      const submitButton = screen.getByText(/Đang xử lý/)
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Empty States', () => {
    it('should show empty message when no transactions', () => {
      const emptyWallet = { ...mockWallet, transactions: [] }
      mockWalletState = { currentWallet: emptyWallet }
      render(<WalletSection />)
      expect(screen.getByText('Chưa có giao dịch nào')).toBeInTheDocument()
    })

    it('should render without transactions section', () => {
      const emptyWallet = { ...mockWallet, transactions: [] }
      mockWalletState = { currentWallet: emptyWallet }
      render(<WalletSection />)
      expect(screen.queryByText('Giao dịch gần đây')).not.toBeInTheDocument()
    })
  })

  describe('Null State', () => {
    it('should return null when wallet is not loaded', () => {
      mockWalletState = { currentWallet: null }
      const { container } = render(<WalletSection />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Status Display', () => {
    it('should render green dot for active wallet', () => {
      render(<WalletSection />)
      const greenDot = document.querySelector('.bg-emerald-400')
      expect(greenDot).toBeInTheDocument()
    })

    it('should render gray dot for inactive wallet', () => {
      const inactiveWallet = { ...mockWallet, status: 'INACTIVE' }
      mockWalletState = { currentWallet: inactiveWallet }
      render(<WalletSection />)
      expect(screen.getByText('INACTIVE')).toBeInTheDocument()
      const grayDot = document.querySelector('.bg-slate-500')
      expect(grayDot).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero balance', () => {
      const zeroWallet = { ...mockWallet, balance: 0 }
      mockWalletState = { currentWallet: zeroWallet }
      render(<WalletSection />)
      expect(screen.getByText('0 ₫')).toBeInTheDocument()
    })

    it('should handle very large balance', () => {
      const largeWallet = { ...mockWallet, balance: 10000000000 }
      mockWalletState = { currentWallet: largeWallet }
      render(<WalletSection />)
      expect(screen.getByText('10.000.000.000 ₫')).toBeInTheDocument()
    })

    it('should handle many transactions', () => {
      const manyTxWallet = {
        ...mockWallet,
        transactions: Array.from({ length: 20 }, (_, i) => ({
          id: `tx-${i}`,
          amount: 100000,
          direction: i % 2 === 0 ? 'IN' : 'OUT',
          status: 'SUCCESS',
          note: `Transaction ${i}`,
          createdAt: '2024-12-01T10:00:00Z',
        })),
      }
      mockWalletState = { currentWallet: manyTxWallet }
      render(<WalletSection />)
      expect(screen.getByText('Transaction 0')).toBeInTheDocument()
    })

    it('should handle transactions with long notes', () => {
      const longNoteWallet = {
        ...mockWallet,
        transactions: [
          { id: 'tx-long', amount: 100000, direction: 'IN', status: 'SUCCESS', note: 'A'.repeat(200), createdAt: '2024-12-01T10:00:00Z' },
        ],
      }
      mockWalletState = { currentWallet: longNoteWallet }
      render(<WalletSection />)
      expect(screen.getByText('A'.repeat(200))).toBeInTheDocument()
    })
  })
})
