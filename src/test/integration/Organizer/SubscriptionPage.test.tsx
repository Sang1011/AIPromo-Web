/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SubscriptionPage from '../../../pages/Organizer/SubscriptionPage'

// ============================================================================
// MOCKS
// ============================================================================

// Mock react-router-dom
const mockUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUseNavigate,
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Coins: () => <div data-testid="icon-coins" />,
  Crown: () => <div data-testid="icon-crown" />,
  Zap: () => <div data-testid="icon-zap" />,
}))

// Mock react-icons
jest.mock('react-icons/fi', () => ({
  FiArrowLeft: () => <div data-testid="fi-arrow-left" />,
}))

// Mock Redux
const mockDispatch = jest.fn()
let mockPackageState: any = {}
let mockWalletState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    PACKAGE: mockPackageState,
    WALLET: mockWalletState,
  }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../store/aiPackageSlice', () => ({
  fetchAIPackages: jest.fn(() => ({ type: 'PACKAGE/fetchAIPackages' })),
  fetchMyQuota: jest.fn(() => ({ type: 'PACKAGE/fetchMyQuota' })),
  fetchPurchasedPackages: jest.fn(() => ({ type: 'PACKAGE/fetchPurchasedPackages' })),
}))

jest.mock('../../store/walletSlice', () => ({
  fetchWalletUser: jest.fn((userId) => ({ type: 'WALLET/fetchWalletUser', payload: userId })),
}))

// Mock child components
jest.mock('../../components/Organizer/subcriptions/ActiveSubscriptionBanner', () => ({
  __esModule: true,
  default: ({ pkg, onUpgrade }: { pkg: any; onUpgrade: () => void }) => (
    <div data-testid="active-subscription-banner">
      <span data-testid="active-pkg-name">{pkg.name}</span>
      <button data-testid="upgrade-btn" onClick={onUpgrade}>Upgrade</button>
    </div>
  ),
  getSubscriptionStatus: (date: string) => {
    const purchaseDate = new Date(date)
    const now = new Date()
    const daysDiff = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 30 ? 'active' : 'expired'
  },
}))

jest.mock('../../components/Organizer/subcriptions/PaymentMethodModal', () => ({
  __esModule: true,
  default: ({ plan, onClose }: { plan: any; onClose: () => void }) => (
    <div data-testid="payment-modal" data-plan-id={plan.id}>
      <span data-testid="modal-plan-name">{plan.name}</span>
      <button data-testid="close-modal" onClick={onClose}>Close</button>
    </div>
  ),
}))

jest.mock('../../components/Organizer/subcriptions/PlanCard', () => ({
  __esModule: true,
  default: ({ plan, isCurrentPlan, onSelect }: { plan: any; isCurrentPlan: boolean; onSelect: (p: any) => void }) => (
    <div data-testid="plan-card" data-plan-id={plan.id} data-is-current={isCurrentPlan}>
      <span data-testid="plan-name">{plan.name}</span>
      <span data-testid="plan-price">{plan.price}</span>
      <button data-testid="select-plan" onClick={() => onSelect(plan)}>Select</button>
    </div>
  ),
}))

jest.mock('../../components/Organizer/subcriptions/WalletSection', () => ({
  __esModule: true,
  default: () => <div data-testid="wallet-section">Wallet Section</div>,
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockAIPackage = (overrides = {}) => ({
  id: 'pkg-1',
  name: 'Pro',
  type: 'Subscription',
  price: 299000,
  tokenQuota: 10000,
  isActive: true,
  ...overrides,
})

const createMockQuota = (overrides = {}) => ({
  subscriptionTokens: 10000,
  topUpTokens: 5000,
  totalTokens: 15000,
  ...overrides,
})

const createMockPurchasedPackage = (overrides = {}) => ({
  packageId: 'pkg-1',
  name: 'Pro',
  type: 'Subscription',
  purchaseCount: 3,
  totalPurchasedTokens: 30000,
  tokenQuota: 10000,
  lastPurchasedAt: new Date().toISOString(),
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('SubscriptionPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockPackageState = {
      list: [],
      quota: null,
      purchasedPackages: [],
      loading: {
        list: false,
        quota: false,
        purchased: false,
      },
    }

    mockWalletState = {
      walletUser: null,
      loading: false,
    }

    mockDispatch.mockResolvedValue({})

    // Mock window.history.state
    Object.defineProperty(window.history, 'state', {
      value: { idx: 1 },
      writable: true,
    })
  })

  // --------------------------------------------------------------------------
  // 1. Render
  // --------------------------------------------------------------------------
  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(screen.getByText('Subscription')).toBeInTheDocument()
    })

    it('should show skeleton when loading all data', () => {
      mockPackageState.loading = { list: true, quota: true, purchased: true }

      render(<SubscriptionPage />)

      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should not show skeleton when not loading', async () => {
      await act(async () => {
        render(<SubscriptionPage />)
      })

      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBe(0)
    })
  })

  // --------------------------------------------------------------------------
  // 2. UI Elements
  // --------------------------------------------------------------------------
  describe('UI Elements', () => {
    it('should render page title and subtitle', async () => {
      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(screen.getByText('Subscription')).toBeInTheDocument()
      expect(screen.getByText('Quản lý gói, theo dõi quyền lợi và lịch sử thanh toán')).toBeInTheDocument()
    })

    it('should render back button', async () => {
      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(screen.getByText('Trở về')).toBeInTheDocument()
    })

    it('should render wallet section', async () => {
      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(screen.getByTestId('wallet-section')).toBeInTheDocument()
    })

    it('should render quota cards when quota data is available', async () => {
      mockPackageState.quota = createMockQuota()

      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(screen.getByText('10000')).toBeInTheDocument()
      expect(screen.getByText('5000')).toBeInTheDocument()
      expect(screen.getByText('15000')).toBeInTheDocument()
    })

    it('should render TopUp packages when available', async () => {
      mockPackageState.list = [
        createMockAIPackage({ id: 'topup-1', name: 'TopUp Small', type: 'TopUp', price: 50000 }),
        createMockAIPackage({ id: 'topup-2', name: 'TopUp Large', type: 'TopUp', price: 100000 }),
      ]

      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(screen.getByText('Nạp token lẻ')).toBeInTheDocument()
    })

    it('should render subscription packages when available', async () => {
      mockPackageState.list = [
        createMockAIPackage({ id: 'sub-1', name: 'Free', type: 'Subscription', price: 0 }),
        createMockAIPackage({ id: 'sub-2', name: 'Pro', type: 'Subscription', price: 299000 }),
      ]

      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(screen.getByText('Gói đăng ký hàng tháng')).toBeInTheDocument()
    })

    it('should render active subscription banner when has active sub', async () => {
      const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      mockPackageState.purchasedPackages = [
        createMockPurchasedPackage({ lastPurchasedAt: recentDate }),
      ]
      mockPackageState.list = [
        createMockAIPackage({ name: 'Pro', type: 'Subscription', price: 299000 }),
      ]

      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(screen.getByTestId('active-subscription-banner')).toBeInTheDocument()
    })

    it('should render purchase history table when has purchased packages', async () => {
      mockPackageState.purchasedPackages = [createMockPurchasedPackage()]

      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(screen.getByText('Lịch sử mua gói')).toBeInTheDocument()
      expect(screen.getByText('3 gói đã mua')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 3. API Calls
  // --------------------------------------------------------------------------
  describe('API Calls', () => {
    it('should call fetchAIPackages on mount', async () => {
      const { fetchAIPackages } = require('../../store/aiPackageSlice')

      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(mockDispatch).toHaveBeenCalledWith(fetchAIPackages())
    })

    it('should call fetchMyQuota on mount', async () => {
      const { fetchMyQuota } = require('../../store/aiPackageSlice')

      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(mockDispatch).toHaveBeenCalledWith(fetchMyQuota())
    })

    it('should call fetchPurchasedPackages on mount', async () => {
      const { fetchPurchasedPackages } = require('../../store/aiPackageSlice')

      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(mockDispatch).toHaveBeenCalledWith(fetchPurchasedPackages())
    })

    it('should call fetchWalletUser with userId 5 on mount', async () => {
      const { fetchWalletUser } = require('../../store/walletSlice')

      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(mockDispatch).toHaveBeenCalledWith(fetchWalletUser(5))
    })
  })

  // --------------------------------------------------------------------------
  // 4. User Interactions
  // --------------------------------------------------------------------------
  describe('User Interactions', () => {
    it('should open payment modal when selecting a plan', async () => {
      mockPackageState.list = [
        createMockAIPackage({ id: 'topup-1', name: 'TopUp Small', type: 'TopUp', price: 50000 }),
      ]

      await act(async () => {
        render(<SubscriptionPage />)
      })

      // Find and click the TopUp chip (which triggers onSelect)
      const topupChip = screen.getByText('TopUp Small')
      await userEvent.click(topupChip.closest('button')!)

      // Payment modal should appear
      await waitFor(() => {
        expect(screen.getByTestId('payment-modal')).toBeInTheDocument()
      })
    })

    it('should close payment modal when clicking close', async () => {
      mockPackageState.list = [
        createMockAIPackage({ id: 'topup-1', name: 'TopUp Small', type: 'TopUp', price: 50000 }),
      ]

      await act(async () => {
        render(<SubscriptionPage />)
      })

      const topupChip = screen.getByText('TopUp Small')
      await userEvent.click(topupChip.closest('button')!)

      await waitFor(() => {
        expect(screen.getByTestId('payment-modal')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByTestId('close-modal'))
      expect(screen.queryByTestId('payment-modal')).not.toBeInTheDocument()
    })

    it('should open payment modal when selecting subscription plan', async () => {
      mockPackageState.list = [
        createMockAIPackage({ id: 'sub-1', name: 'Pro', type: 'Subscription', price: 299000 }),
      ]

      await act(async () => {
        render(<SubscriptionPage />)
      })

      const selectBtn = screen.getByTestId('select-plan')
      await userEvent.click(selectBtn)

      await waitFor(() => {
        expect(screen.getByTestId('payment-modal')).toBeInTheDocument()
      })
    })

    it('should navigate back when clicking back button', async () => {
      await act(async () => {
        render(<SubscriptionPage />)
      })

      const backBtn = screen.getByText('Trở về')
      await userEvent.click(backBtn)

      expect(mockUseNavigate).toHaveBeenCalledWith(-1)
    })

    it('should scroll to subscription section when clicking upgrade', async () => {
      const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      mockPackageState.purchasedPackages = [
        createMockPurchasedPackage({ lastPurchasedAt: recentDate }),
      ]
      mockPackageState.list = [
        createMockAIPackage({ name: 'Pro', type: 'Subscription', price: 299000 }),
      ]

      // Mock scrollIntoView
      const mockScrollIntoView = jest.fn()
      HTMLElement.prototype.scrollIntoView = mockScrollIntoView

      await act(async () => {
        render(<SubscriptionPage />)
      })

      const upgradeBtn = screen.getByTestId('upgrade-btn')
      await userEvent.click(upgradeBtn)

      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    })
  })

  // --------------------------------------------------------------------------
  // 5. Data Display
  // --------------------------------------------------------------------------
  describe('Data Display', () => {
    it('should display quota values correctly', async () => {
      mockPackageState.quota = createMockQuota()

      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(screen.getByText('Token subscription')).toBeInTheDocument()
      expect(screen.getByText('Token nạp thêm')).toBeInTheDocument()
      expect(screen.getByText('Tổng token còn lại')).toBeInTheDocument()
    })

    it('should display TopUp packages sorted by price', async () => {
      mockPackageState.list = [
        createMockAIPackage({ id: 't1', name: 'Large', type: 'TopUp', price: 100000, tokenQuota: 5000 }),
        createMockAIPackage({ id: 't2', name: 'Small', type: 'TopUp', price: 50000, tokenQuota: 2000 }),
      ]

      await act(async () => {
        render(<SubscriptionPage />)
      })

      const chips = screen.getAllByRole('button')
      const smallIdx = chips.findIndex((c) => c.textContent?.includes('Small'))
      const largeIdx = chips.findIndex((c) => c.textContent?.includes('Large'))
      expect(smallIdx).toBeLessThan(largeIdx)
    })

    it('should display subscription plan cards', async () => {
      mockPackageState.list = [
        createMockAIPackage({ id: 's1', name: 'Free', type: 'Subscription', price: 0 }),
        createMockAIPackage({ id: 's2', name: 'Pro', type: 'Subscription', price: 299000 }),
        createMockAIPackage({ id: 's3', name: 'Business', type: 'Subscription', price: 599000 }),
      ]

      await act(async () => {
        render(<SubscriptionPage />)
      })

      const planCards = screen.getAllByTestId('plan-card')
      expect(planCards).toHaveLength(3)
    })

    it('should mark current subscription plan correctly', async () => {
      const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      mockPackageState.purchasedPackages = [
        createMockPurchasedPackage({ name: 'Pro', lastPurchasedAt: recentDate }),
      ]
      mockPackageState.list = [
        createMockAIPackage({ id: 's1', name: 'Free', type: 'Subscription', price: 0 }),
        createMockAIPackage({ id: 's2', name: 'Pro', type: 'Subscription', price: 299000 }),
      ]

      await act(async () => {
        render(<SubscriptionPage />)
      })

      const proCard = screen.getAllByTestId('plan-card').find(
        (card) => card.getAttribute('data-plan-id') === 's2'
      )
      expect(proCard).toHaveAttribute('data-is-current', 'true')
    })

    it('should display purchase history with correct data', async () => {
      mockPackageState.purchasedPackages = [
        createMockPurchasedPackage({
          name: 'Pro',
          type: 'Subscription',
          purchaseCount: 5,
          totalPurchasedTokens: 50000,
          tokenQuota: 10000,
        }),
      ]

      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('50000')).toBeInTheDocument()
      expect(screen.getByText('10000')).toBeInTheDocument()
    })

    it('should not render active banner when subscription is expired', async () => {
      const oldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      mockPackageState.purchasedPackages = [
        createMockPurchasedPackage({ lastPurchasedAt: oldDate }),
      ]
      mockPackageState.list = [
        createMockAIPackage({ name: 'Pro', type: 'Subscription', price: 299000 }),
      ]

      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(screen.queryByTestId('active-subscription-banner')).not.toBeInTheDocument()
    })

    it('should not render TopUp section when no TopUp packages', async () => {
      mockPackageState.list = [
        createMockAIPackage({ name: 'Pro', type: 'Subscription', price: 299000 }),
      ]

      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(screen.queryByText('Nạp token lẻ')).not.toBeInTheDocument()
    })

    it('should not render subscription section when no subscription packages', async () => {
      mockPackageState.list = [
        createMockAIPackage({ name: 'TopUp Small', type: 'TopUp', price: 50000 }),
      ]

      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(screen.queryByText('Gói đăng ký hàng tháng')).not.toBeInTheDocument()
    })

    it('should not render history table when no purchased packages', async () => {
      mockPackageState.purchasedPackages = []

      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(screen.queryByText('Lịch sử mua gói')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 6. Edge Cases
  // --------------------------------------------------------------------------
  describe('Edge Cases', () => {
    it('should handle quota loading state', async () => {
      mockPackageState.loading.quota = true

      render(<SubscriptionPage />)

      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should handle list loading state for subscription packages', async () => {
      mockPackageState.loading.list = true
      mockPackageState.list = [
        createMockAIPackage({ name: 'Pro', type: 'Subscription', price: 299000 }),
      ]

      await act(async () => {
        render(<SubscriptionPage />)
      })

      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should handle packages with price 0 (Free tier)', async () => {
      mockPackageState.list = [
        createMockAIPackage({ name: 'Free', type: 'Subscription', price: 0 }),
      ]

      await act(async () => {
        render(<SubscriptionPage />)
      })

      // Free package should not appear in subscription section (filtered by price > 0)
      const planCards = screen.queryAllByTestId('plan-card')
      expect(planCards).toHaveLength(0)
    })

    it('should handle inactive packages', async () => {
      mockPackageState.list = [
        createMockAIPackage({ id: 'inactive', name: 'Old', type: 'Subscription', price: 100000, isActive: false }),
        createMockAIPackage({ id: 'active', name: 'Pro', type: 'Subscription', price: 299000, isActive: true }),
      ]

      await act(async () => {
        render(<SubscriptionPage />)
      })

      const planCards = screen.getAllByTestId('plan-card')
      expect(planCards).toHaveLength(1)
      expect(planCards[0]).toHaveAttribute('data-plan-id', 'active')
    })

    it('should handle purchased packages with no lastPurchasedAt', async () => {
      mockPackageState.purchasedPackages = [
        createMockPurchasedPackage({ lastPurchasedAt: undefined as any }),
      ]

      await act(async () => {
        render(<SubscriptionPage />)
      })

      expect(screen.getByText('Lịch sử mua gói')).toBeInTheDocument()
    })

    it('should handle window.history.state being undefined', async () => {
      Object.defineProperty(window.history, 'state', {
        value: undefined,
        writable: true,
      })

      await act(async () => {
        render(<SubscriptionPage />)
      })

      const backBtn = screen.getByText('Trở về')
      await userEvent.click(backBtn)

      // Should not crash
      expect(mockUseNavigate).toHaveBeenCalled()
    })
  })
})
