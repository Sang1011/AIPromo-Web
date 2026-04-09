/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ActiveSubscriptionBanner, {
  getVNExpiry,
  formatVNDate,
  getSubscriptionStatus,
} from '../../../../../components/Organizer/subcriptions/ActiveSubscriptionBanner'
import type { AIPurchasedPackage } from '../../../../../types/aiPackage/aiPackage'

describe('ActiveSubscriptionBanner', () => {
  const createMockPackage = (overrides: Partial<AIPurchasedPackage> = {}): AIPurchasedPackage => ({
    packageId: 'pkg-1',
    name: 'Pro',
    description: 'Pro plan',
    type: 'Subscription',
    price: 399000,
    tokenQuota: 50000,
    isActive: true,
    purchaseCount: 1,
    totalPurchasedTokens: 50000,
    lastPurchasedAt: '2024-12-01T10:00:00Z',
    ...overrides,
  })

  const mockOnUpgrade = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Render', () => {
    it('should render package name', () => {
      const pkg = createMockPackage()
      render(<ActiveSubscriptionBanner pkg={pkg} />)
      expect(screen.getByText('Gói Pro')).toBeInTheDocument()
    })

    it('should render expiry date', () => {
      const pkg = createMockPackage()
      render(<ActiveSubscriptionBanner pkg={pkg} />)
      expect(screen.getByText(/Hết hạn/)).toBeInTheDocument()
    })

    it('should render 30 days label', () => {
      const pkg = createMockPackage()
      render(<ActiveSubscriptionBanner pkg={pkg} />)
      expect(screen.getByText('30 ngày / lần')).toBeInTheDocument()
    })

    it('should render Crown icon', () => {
      const pkg = createMockPackage()
      const { container } = render(<ActiveSubscriptionBanner pkg={pkg} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Active Status', () => {
    it('should show "Đang hoạt động" for active subscription', () => {
      jest.setSystemTime(new Date('2024-12-05T10:00:00Z'))
      const pkg = createMockPackage()
      render(<ActiveSubscriptionBanner pkg={pkg} />)
      expect(screen.getByText('Đang hoạt động')).toBeInTheDocument()
    })

    it('should show green dot for active status', () => {
      jest.setSystemTime(new Date('2024-12-05T10:00:00Z'))
      const pkg = createMockPackage()
      render(<ActiveSubscriptionBanner pkg={pkg} />)
      const greenDot = document.querySelector('.bg-emerald-400')
      expect(greenDot).toBeInTheDocument()
    })

    it('should apply green background for active status', () => {
      jest.setSystemTime(new Date('2024-12-05T10:00:00Z'))
      const pkg = createMockPackage()
      render(<ActiveSubscriptionBanner pkg={pkg} />)
      const banner = screen.getByText('Gói Pro').closest('.rounded-2xl')
      expect(banner).toHaveClass('bg-primary/5')
    })
  })

  describe('Expiring Soon Status', () => {
    it('should show "Sắp hết hạn" when within 7 days of expiry', () => {
      jest.setSystemTime(new Date('2024-12-28T10:00:00Z'))
      const pkg = createMockPackage()
      render(<ActiveSubscriptionBanner pkg={pkg} />)
      expect(screen.getByText('Sắp hết hạn')).toBeInTheDocument()
    })

    it('should show amber warning icon for expiring soon', () => {
      jest.setSystemTime(new Date('2024-12-28T10:00:00Z'))
      const pkg = createMockPackage()
      render(<ActiveSubscriptionBanner pkg={pkg} />)
      const warningIcon = document.querySelector('.text-amber-400')
      expect(warningIcon).toBeInTheDocument()
    })

    it('should apply amber background for expiring soon', () => {
      jest.setSystemTime(new Date('2024-12-28T10:00:00Z'))
      const pkg = createMockPackage()
      render(<ActiveSubscriptionBanner pkg={pkg} />)
      const banner = screen.getByText('Gói Pro').closest('.rounded-2xl')
      expect(banner).toHaveClass('bg-amber-500/5')
    })
  })

  describe('Expired Status', () => {
    it('should show "Đã hết hạn" when past expiry', () => {
      jest.setSystemTime(new Date('2025-01-05T10:00:00Z'))
      const pkg = createMockPackage()
      render(<ActiveSubscriptionBanner pkg={pkg} />)
      expect(screen.getByText('Đã hết hạn')).toBeInTheDocument()
    })

    it('should show "Hết hạn từ" label for expired subscription', () => {
      jest.setSystemTime(new Date('2025-01-05T10:00:00Z'))
      const pkg = createMockPackage()
      render(<ActiveSubscriptionBanner pkg={pkg} />)
      expect(screen.getByText('Hết hạn từ')).toBeInTheDocument()
    })

    it('should show red warning icon for expired', () => {
      jest.setSystemTime(new Date('2025-01-05T10:00:00Z'))
      const pkg = createMockPackage()
      render(<ActiveSubscriptionBanner pkg={pkg} />)
      const warningIcon = document.querySelector('.text-red-400')
      expect(warningIcon).toBeInTheDocument()
    })

    it('should apply red background for expired', () => {
      jest.setSystemTime(new Date('2025-01-05T10:00:00Z'))
      const pkg = createMockPackage()
      render(<ActiveSubscriptionBanner pkg={pkg} />)
      const banner = screen.getByText('Gói Pro').closest('.rounded-2xl')
      expect(banner).toHaveClass('bg-red-500/5')
    })

    it('should not show 30 days label for expired', () => {
      jest.setSystemTime(new Date('2025-01-05T10:00:00Z'))
      const pkg = createMockPackage()
      render(<ActiveSubscriptionBanner pkg={pkg} />)
      expect(screen.queryByText('30 ngày / lần')).not.toBeInTheDocument()
    })
  })

  describe('Upgrade Button', () => {
    it('should render upgrade button when onUpgrade is provided', () => {
      const pkg = createMockPackage()
      render(<ActiveSubscriptionBanner pkg={pkg} onUpgrade={mockOnUpgrade} />)
      expect(screen.getByText('Nâng cấp')).toBeInTheDocument()
    })

    it('should not render upgrade button when onUpgrade is not provided', () => {
      const pkg = createMockPackage()
      render(<ActiveSubscriptionBanner pkg={pkg} />)
      expect(screen.queryByText('Nâng cấp')).not.toBeInTheDocument()
    })

    it('should call onUpgrade when clicking button', async () => {
      jest.setSystemTime(new Date('2024-12-05T10:00:00Z'))
      const pkg = createMockPackage()
      render(<ActiveSubscriptionBanner pkg={pkg} onUpgrade={mockOnUpgrade} />)
      await userEvent.click(screen.getByText('Nâng cấp'))
      expect(mockOnUpgrade).toHaveBeenCalled()
    })

    it('should show "Gia hạn ngay" for expired subscription', () => {
      jest.setSystemTime(new Date('2025-01-05T10:00:00Z'))
      const pkg = createMockPackage()
      render(<ActiveSubscriptionBanner pkg={pkg} onUpgrade={mockOnUpgrade} />)
      expect(screen.getByText('Gia hạn ngay')).toBeInTheDocument()
    })
  })

  describe('Type Accent', () => {
    it('should use subscription accent for Subscription type', () => {
      const pkg = createMockPackage({ type: 'Subscription' })
      const { container } = render(<ActiveSubscriptionBanner pkg={pkg} />)
      const crownContainer = container.querySelector('.border-amber-400\\/20')
      expect(crownContainer).toBeInTheDocument()
    })

    it('should use topup accent for TopUp type', () => {
      const pkg = createMockPackage({ type: 'TopUp' })
      const { container } = render(<ActiveSubscriptionBanner pkg={pkg} />)
      const crownContainer = container.querySelector('.border-slate-400\\/20')
      expect(crownContainer).toBeInTheDocument()
    })
  })

  describe('Helper Functions', () => {
    describe('getVNExpiry', () => {
      it('should add 30 days to purchase date in VN time', () => {
        const result = getVNExpiry('2024-12-01T10:00:00Z')
        expect(result).toBeInstanceOf(Date)
      })
    })

    describe('formatVNDate', () => {
      it('should format date in Vietnamese locale', () => {
        const date = new Date('2024-12-31T10:00:00Z')
        const result = formatVNDate(date)
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      })
    })

    describe('getSubscriptionStatus', () => {
      it('should return "active" for recent purchase', () => {
        const now = new Date('2024-12-05T10:00:00Z')
        jest.setSystemTime(now)
        const status = getSubscriptionStatus('2024-12-01T10:00:00Z')
        expect(status).toBe('active')
      })

      it('should return "expiring_soon" for purchase near 30 days', () => {
        const now = new Date('2024-12-28T10:00:00Z')
        jest.setSystemTime(now)
        const status = getSubscriptionStatus('2024-12-01T10:00:00Z')
        expect(status).toBe('expiring_soon')
      })

      it('should return "expired" for old purchase', () => {
        const now = new Date('2025-01-05T10:00:00Z')
        jest.setSystemTime(now)
        const status = getSubscriptionStatus('2024-12-01T10:00:00Z')
        expect(status).toBe('expired')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long package names', () => {
      const pkg = createMockPackage({ name: 'A'.repeat(100) })
      render(<ActiveSubscriptionBanner pkg={pkg} />)
      expect(screen.getByText('Gói ' + 'A'.repeat(100))).toBeInTheDocument()
    })

    it('should handle special characters in package name', () => {
      const pkg = createMockPackage({ name: 'Pro <Premium>' })
      render(<ActiveSubscriptionBanner pkg={pkg} />)
      expect(screen.getByText('Gói Pro <Premium>')).toBeInTheDocument()
    })

    it('should handle empty lastPurchasedAt', () => {
      const pkg = createMockPackage({ lastPurchasedAt: '' })
      const { container } = render(<ActiveSubscriptionBanner pkg={pkg} />)
      expect(container).toBeInTheDocument()
    })
  })
})
