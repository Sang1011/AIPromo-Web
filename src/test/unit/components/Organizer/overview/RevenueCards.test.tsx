/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

import RevenueCards from '../../../../../components/Organizer/overview/RevenueCards'
import type { SummaryOverview } from '../../../../../types/ticketing/ticketing'

describe('RevenueCards', () => {
  const mockSummary: SummaryOverview = {
    totalOrders: 500,
    totalTicketsSold: 1200,
    totalTicketsCheckedIn: 900,
    checkInRate: 75.0,
    grossRevenue: 150000000,
    totalDiscount: 15000000,
    netRevenue: 135000000,
  }

  describe('Render', () => {
    it('should render all revenue cards', () => {
      render(<RevenueCards summary={mockSummary} />)
      expect(screen.getByText('Doanh thu gộp')).toBeInTheDocument()
      expect(screen.getByText('Tổng giảm giá')).toBeInTheDocument()
      expect(screen.getByText('Doanh thu ròng')).toBeInTheDocument()
    })

    it('should render stat cards', () => {
      render(<RevenueCards summary={mockSummary} />)
      expect(screen.getByText('Đơn hàng')).toBeInTheDocument()
      expect(screen.getByText('Vé đã bán')).toBeInTheDocument()
      expect(screen.getByText('Đã check-in')).toBeInTheDocument()
      expect(screen.getByText('Tỉ lệ check-in')).toBeInTheDocument()
    })

    it('should render formatted revenue values', () => {
      render(<RevenueCards summary={mockSummary} />)
      expect(screen.getByText('150.000.000')).toBeInTheDocument()
      expect(screen.getByText('15.000.000')).toBeInTheDocument()
      expect(screen.getByText('135.000.000')).toBeInTheDocument()
    })

    it('should render formatted counts', () => {
      render(<RevenueCards summary={mockSummary} />)
      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('1.200')).toBeInTheDocument()
      expect(screen.getByText('900')).toBeInTheDocument()
    })

    it('should render discount rate', () => {
      render(<RevenueCards summary={mockSummary} />)
      expect(screen.getByText('10.0% so với doanh thu gộp')).toBeInTheDocument()
    })

    it('should render check-in rate', () => {
      render(<RevenueCards summary={mockSummary} />)
      expect(screen.getByText('75.0%')).toBeInTheDocument()
    })
  })

  describe('Calculations', () => {
    it('should calculate discount rate correctly', () => {
      const summary: SummaryOverview = {
        ...mockSummary,
        grossRevenue: 200000000,
        totalDiscount: 20000000,
      }
      render(<RevenueCards summary={summary} />)
      expect(screen.getByText('10.0% so với doanh thu gộp')).toBeInTheDocument()
    })

    it('should handle zero gross revenue for discount rate', () => {
      const summary: SummaryOverview = {
        ...mockSummary,
        grossRevenue: 0,
        totalDiscount: 0,
      }
      render(<RevenueCards summary={summary} />)
      expect(screen.getByText('0.0% so với doanh thu gộp')).toBeInTheDocument()
    })

    it('should handle high check-in rate', () => {
      const summary: SummaryOverview = {
        ...mockSummary,
        checkInRate: 100,
      }
      render(<RevenueCards summary={summary} />)
      expect(screen.getByText('100.0%')).toBeInTheDocument()
    })

    it('should handle zero check-in rate', () => {
      const summary: SummaryOverview = {
        ...mockSummary,
        checkInRate: 0,
      }
      render(<RevenueCards summary={summary} />)
      expect(screen.getByText('0.0%')).toBeInTheDocument()
    })
  })

  describe('Radial Progress', () => {
    it('should render SVG circles for progress', () => {
      render(<RevenueCards summary={mockSummary} />)
      const circles = document.querySelectorAll('circle')
      expect(circles.length).toBeGreaterThanOrEqual(2)
    })

    it('should render percentage in radial progress', () => {
      render(<RevenueCards summary={mockSummary} />)
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('should cap percentage at 100%', () => {
      const summary: SummaryOverview = {
        ...mockSummary,
        checkInRate: 150,
      }
      render(<RevenueCards summary={summary} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should render cards with dark background', () => {
      render(<RevenueCards summary={mockSummary} />)
      const cards = document.querySelectorAll('.bg-card-dark')
      expect(cards.length).toBe(7)
    })

    it('should render cards with borders', () => {
      render(<RevenueCards summary={mockSummary} />)
      const cards = document.querySelectorAll('.border-border-dark')
      expect(cards.length).toBe(7)
    })

    it('should render net revenue card with special styling', () => {
      render(<RevenueCards summary={mockSummary} />)
      const netCard = screen.getByText('Doanh thu ròng').closest('.border-primary\\/40')
      expect(netCard).toHaveClass('border-primary/40')
    })

    it('should render icon containers with primary color', () => {
      render(<RevenueCards summary={mockSummary} />)
      const iconContainers = document.querySelectorAll('.bg-primary\\/20')
      expect(iconContainers.length).toBeGreaterThan(0)
    })
  })

  describe('Layout', () => {
    it('should render top row with 3 columns', () => {
      render(<RevenueCards summary={mockSummary} />)
      const topRow = screen.getByText('Doanh thu gộp').closest('.grid-cols-1')
      expect(topRow).toHaveClass('md:grid-cols-3')
    })

    it('should render bottom row with 4 columns', () => {
      render(<RevenueCards summary={mockSummary} />)
      const bottomRow = screen.getByText('Đơn hàng').closest('.grid-cols-2')
      expect(bottomRow).toHaveClass('md:grid-cols-4')
    })

    it('should render cards with gap spacing', () => {
      render(<RevenueCards summary={mockSummary} />)
      const grids = document.querySelectorAll('.gap-4')
      expect(grids.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero values', () => {
      const summary: SummaryOverview = {
        totalOrders: 0,
        totalTicketsSold: 0,
        totalTicketsCheckedIn: 0,
        checkInRate: 0,
        grossRevenue: 0,
        totalDiscount: 0,
        netRevenue: 0,
      }
      render(<RevenueCards summary={summary} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle very large values', () => {
      const summary: SummaryOverview = {
        totalOrders: 1000000,
        totalTicketsSold: 5000000,
        totalTicketsCheckedIn: 4500000,
        checkInRate: 90,
        grossRevenue: 10000000000,
        totalDiscount: 1000000000,
        netRevenue: 9000000000,
      }
      render(<RevenueCards summary={summary} />)
      expect(screen.getByText('1.000.000')).toBeInTheDocument()
    })

    it('should handle decimal check-in rate', () => {
      const summary: SummaryOverview = {
        ...mockSummary,
        checkInRate: 66.67,
      }
      render(<RevenueCards summary={summary} />)
      expect(screen.getByText('66.7%')).toBeInTheDocument()
    })

    it('should handle negative net revenue', () => {
      const summary: SummaryOverview = {
        ...mockSummary,
        grossRevenue: 100000,
        totalDiscount: 200000,
        netRevenue: -100000,
      }
      render(<RevenueCards summary={summary} />)
      expect(screen.getByText('-100.000')).toBeInTheDocument()
    })
  })
})
