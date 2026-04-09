/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PlanCard, { type PlanFeature } from '../../../../../components/Organizer/subcriptions/PlanCard'
import type { AIPackage } from '../../../../../types/aiPackage/aiPackage'

describe('PlanCard', () => {
  const createMockPlan = (overrides: Partial<AIPackage> = {}): AIPackage => ({
    id: 'plan-1',
    name: 'Pro',
    price: 399000,
    tokenQuota: 50000,
    description: 'Professional plan with advanced features',
    type: 'Subscription',
    isActive: true,
    ...overrides,
  })

  const mockFeatures: PlanFeature[] = [
    { label: '50 sự kiện / tháng', included: true },
    { label: 'Dashboard nâng cao', included: true },
    { label: 'Marketing tools', included: true },
    { label: 'Xuất báo cáo PDF/Excel', included: true },
    { label: 'Hỗ trợ ưu tiên 24/7', included: false },
  ]

  const mockOnSelect = jest.fn()

  const defaultProps = {
    plan: createMockPlan(),
    features: mockFeatures,
    onSelect: mockOnSelect,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render plan name', () => {
      render(<PlanCard {...defaultProps} />)
      expect(screen.getByText('Pro')).toBeInTheDocument()
    })

    it('should render formatted price', () => {
      render(<PlanCard {...defaultProps} />)
      expect(screen.getByText('399.000')).toBeInTheDocument()
      expect(screen.getByText('₫ / tháng')).toBeInTheDocument()
    })

    it('should render "0 VND" for free plan', () => {
      render(<PlanCard {...defaultProps} plan={createMockPlan({ price: 0 })} />)
      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getByText('VND')).toBeInTheDocument()
    })

    it('should render plan description', () => {
      render(<PlanCard {...defaultProps} />)
      expect(screen.getByText('Professional plan with advanced features')).toBeInTheDocument()
    })

    it('should render token quota', () => {
      render(<PlanCard {...defaultProps} />)
      expect(screen.getByText('50.000 tokens / lần')).toBeInTheDocument()
    })

    it('should render all features', () => {
      render(<PlanCard {...defaultProps} />)
      expect(screen.getByText('50 sự kiện / tháng')).toBeInTheDocument()
      expect(screen.getByText('Dashboard nâng cao')).toBeInTheDocument()
      expect(screen.getByText('Marketing tools')).toBeInTheDocument()
    })
  })

  describe('Feature List', () => {
    it('should show check icon for included features', () => {
      render(<PlanCard {...defaultProps} />)
      const includedFeatures = document.querySelectorAll('.text-emerald-400')
      expect(includedFeatures.length).toBeGreaterThan(0)
    })

    it('should show X icon for excluded features', () => {
      render(<PlanCard {...defaultProps} />)
      const excludedFeatures = document.querySelectorAll('.text-slate-600')
      expect(excludedFeatures.length).toBeGreaterThan(0)
    })

    it('should style included features with lighter text', () => {
      render(<PlanCard {...defaultProps} />)
      const includedText = screen.getByText('50 sự kiện / tháng')
      expect(includedText).toHaveClass('text-slate-300')
    })

    it('should style excluded features with darker text', () => {
      render(<PlanCard {...defaultProps} />)
      const excludedText = screen.getByText('Hỗ trợ ưu tiên 24/7')
      expect(excludedText).toHaveClass('text-slate-600')
    })
  })

  describe('Button States', () => {
    it('should render "Mua [Plan]" button for non-current plans', () => {
      render(<PlanCard {...defaultProps} />)
      expect(screen.getByText('Mua Pro')).toBeInTheDocument()
    })

    it('should render "Gói hiện tại" button when isCurrentPlan is true', () => {
      render(<PlanCard {...defaultProps} isCurrentPlan />)
      const button = screen.getByText('Gói hiện tại')
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })

    it('should call onSelect when clicking buy button', async () => {
      render(<PlanCard {...defaultProps} />)
      await userEvent.click(screen.getByText('Mua Pro'))
      expect(mockOnSelect).toHaveBeenCalledWith(createMockPlan())
    })

    it('should disable button when payment is loading', () => {
      render(<PlanCard {...defaultProps} isPaymentLoading />)
      const button = screen.getByText(/Đang xử lý/)
      expect(button).toBeDisabled()
    })

    it('should show spinner when payment is loading', () => {
      render(<PlanCard {...defaultProps} isPaymentLoading />)
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Featured State', () => {
    it('should show featured badge when isFeatured is true', () => {
      render(<PlanCard {...defaultProps} isFeatured />)
      expect(screen.getByText('Phổ biến nhất')).toBeInTheDocument()
    })

    it('should not show featured badge when isFeatured is false', () => {
      render(<PlanCard {...defaultProps} isFeatured={false} />)
      expect(screen.queryByText('Phổ biến nhất')).not.toBeInTheDocument()
    })

    it('should render custom featured label', () => {
      render(<PlanCard {...defaultProps} isFeatured featuredLabel="Best Value" />)
      expect(screen.getByText('Best Value')).toBeInTheDocument()
    })

    it('should apply card highlight when featured', () => {
      render(<PlanCard {...defaultProps} isFeatured accentColor="amber" />)
      const card = screen.getByText('Pro').closest('.rounded-2xl')
      expect(card).toHaveClass('border-amber-400/20')
    })
  })

  describe('Accent Colors', () => {
    it('should apply amber accent', () => {
      render(<PlanCard {...defaultProps} accentColor="amber" />)
      const planName = screen.getByText('Pro')
      expect(planName).toHaveClass('text-amber-400')
    })

    it('should apply purple accent', () => {
      render(<PlanCard {...defaultProps} accentColor="purple" />)
      const planName = screen.getByText('Pro')
      expect(planName).toHaveClass('text-purple-400')
    })

    it('should apply emerald accent', () => {
      render(<PlanCard {...defaultProps} accentColor="emerald" />)
      const planName = screen.getByText('Pro')
      expect(planName).toHaveClass('text-emerald-400')
    })

    it('should apply slate accent by default', () => {
      render(<PlanCard {...defaultProps} />)
      const planName = screen.getByText('Pro')
      expect(planName).toHaveClass('text-slate-400')
    })

    it('should apply amber button styling', () => {
      render(<PlanCard {...defaultProps} accentColor="amber" />)
      const button = screen.getByText('Mua Pro')
      expect(button).toHaveClass('border-amber-400/30', 'text-amber-400')
    })

    it('should apply purple button styling', () => {
      render(<PlanCard {...defaultProps} accentColor="purple" />)
      const button = screen.getByText('Mua Pro')
      expect(button).toHaveClass('border-purple-400/30', 'text-purple-400')
    })
  })

  describe('Current Plan State', () => {
    it('should apply ring when isCurrentPlan is true', () => {
      render(<PlanCard {...defaultProps} isCurrentPlan />)
      const card = screen.getByText('Pro').closest('.rounded-2xl')
      expect(card).toHaveClass('ring-1', 'ring-primary/40')
    })

    it('should disable button when isCurrentPlan is true', () => {
      render(<PlanCard {...defaultProps} isCurrentPlan />)
      const button = screen.getByText('Gói hiện tại')
      expect(button).toBeDisabled()
    })
  })

  describe('Styling', () => {
    it('should render with card background', () => {
      render(<PlanCard {...defaultProps} />)
      const card = screen.getByText('Pro').closest('.rounded-2xl')
      expect(card).toHaveClass('bg-[#18122B]')
    })

    it('should render with border', () => {
      render(<PlanCard {...defaultProps} />)
      const card = screen.getByText('Pro').closest('.rounded-2xl')
      expect(card).toHaveClass('border-white/10')
    })

    it('should render with transition', () => {
      render(<PlanCard {...defaultProps} />)
      const card = screen.getByText('Pro').closest('.rounded-2xl')
      expect(card).toHaveClass('transition-all')
    })

    it('should render token icon with Zap', () => {
      const { container } = render(<PlanCard {...defaultProps} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('should render horizontal rule separator', () => {
      render(<PlanCard {...defaultProps} />)
      const hr = document.querySelector('hr')
      expect(hr).toHaveClass('border-white/8')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty features array', () => {
      render(<PlanCard {...defaultProps} features={[]} />)
      expect(screen.getByText('Pro')).toBeInTheDocument()
    })

    it('should handle very long plan names', () => {
      const longNamePlan = createMockPlan({ name: 'A'.repeat(100) })
      render(<PlanCard {...defaultProps} plan={longNamePlan} />)
      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument()
    })

    it('should handle large prices', () => {
      const expensivePlan = createMockPlan({ price: 10000000 })
      render(<PlanCard {...defaultProps} plan={expensivePlan} />)
      expect(screen.getByText('10.000.000')).toBeInTheDocument()
    })

    it('should handle large token quotas', () => {
      const largeTokenPlan = createMockPlan({ tokenQuota: 100000000 })
      render(<PlanCard {...defaultProps} plan={largeTokenPlan} />)
      expect(screen.getByText('100.000.000 tokens / lần')).toBeInTheDocument()
    })

    it('should handle special characters in description', () => {
      const specialPlan = createMockPlan({ description: 'Plan with <special> & "characters"' })
      render(<PlanCard {...defaultProps} plan={specialPlan} />)
      expect(screen.getByText('Plan with <special> & "characters"')).toBeInTheDocument()
    })

    it('should handle unknown accent color with fallback', () => {
      render(<PlanCard {...defaultProps} accentColor="amber" />)
      const planName = screen.getByText('Pro')
      expect(planName).toHaveClass('text-slate-400')
    })
  })
})
