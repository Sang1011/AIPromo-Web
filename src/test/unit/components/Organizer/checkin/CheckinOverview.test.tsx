/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

import CheckinOverview from '../../../../../components/Organizer/checkin/CheckinOverview'
import type { SummaryCheckIn } from '../../../../../types/ticketing/ticketing'

describe('CheckinOverview', () => {
  const createMockSummary = (overrides: Partial<SummaryCheckIn> = {}): SummaryCheckIn => ({
    totalCheckedIn: 350,
    totalSold: 500,
    totalTicketQuantity: 1000,
    totalTicketTypes: 5,
    checkInRate: 70.0,
    ...overrides,
  })

  describe('Render', () => {
    it('should render check-in count', () => {
      const summary = createMockSummary()
      render(<CheckinOverview summary={summary} />)

      expect(screen.getByText('350')).toBeInTheDocument()
    })

    it('should render "vé" label', () => {
      const summary = createMockSummary()
      render(<CheckinOverview summary={summary} />)

      expect(screen.getByText('vé')).toBeInTheDocument()
    })

    it('should render total sold count', () => {
      const summary = createMockSummary()
      render(<CheckinOverview summary={summary} />)

      expect(screen.getByText('500')).toBeInTheDocument()
    })

    it('should render "Đã bán" label', () => {
      const summary = createMockSummary()
      render(<CheckinOverview summary={summary} />)

      expect(screen.getByText('Đã bán')).toBeInTheDocument()
    })

    it('should render "Đã check-in" label', () => {
      const summary = createMockSummary()
      render(<CheckinOverview summary={summary} />)

      expect(screen.getByText('Đã check-in')).toBeInTheDocument()
    })

    it('should render radial progress with correct percentage', () => {
      const summary = createMockSummary({ checkInRate: 70.0 })
      render(<CheckinOverview summary={summary} />)

      expect(screen.getByText('70%')).toBeInTheDocument()
    })

    it('should render "Tỉ lệ check-in" label', () => {
      const summary = createMockSummary()
      render(<CheckinOverview summary={summary} />)

      expect(screen.getByText('Tỉ lệ check-in')).toBeInTheDocument()
    })

    it('should render stat cards', () => {
      const summary = createMockSummary()
      render(<CheckinOverview summary={summary} />)

      expect(screen.getByText('Tổng loại vé')).toBeInTheDocument()
      expect(screen.getByText('Tổng số lượng vé của sự kiện')).toBeInTheDocument()
    })

    it('should render stat card values', () => {
      const summary = createMockSummary()
      render(<CheckinOverview summary={summary} />)

      expect(screen.getByText('5')).toBeInTheDocument() // totalTicketTypes
      expect(screen.getByText('1000')).toBeInTheDocument() // totalTicketQuantity
    })
  })

  describe('Radial Progress', () => {
    it('should render SVG elements for progress circle', () => {
      const summary = createMockSummary()
      render(<CheckinOverview summary={summary} />)

      const svgElements = document.querySelectorAll('svg circle')
      expect(svgElements.length).toBeGreaterThanOrEqual(2) // Track and progress
    })

    it('should render track circle with correct styling', () => {
      const summary = createMockSummary()
      render(<CheckinOverview summary={summary} />)

      const circles = document.querySelectorAll('circle')
      const trackCircle = Array.from(circles).find(
        c => c.getAttribute('stroke') === 'rgba(124,59,237,0.15)'
      )
      expect(trackCircle).toBeInTheDocument()
    })

    it('should render progress circle with primary color', () => {
      const summary = createMockSummary()
      render(<CheckinOverview summary={summary} />)

      const circles = document.querySelectorAll('circle')
      const progressCircle = Array.from(circles).find(
        c => c.getAttribute('stroke') === '#7c3bed'
      )
      expect(progressCircle).toBeInTheDocument()
    })

    it('should round percentage to 2 decimal places', () => {
      const summary = createMockSummary({ checkInRate: 66.666666 })
      render(<CheckinOverview summary={summary} />)

      expect(screen.getByText('66.67%')).toBeInTheDocument()
    })

    it('should handle 0% check-in rate', () => {
      const summary = createMockSummary({ checkInRate: 0 })
      render(<CheckinOverview summary={summary} />)

      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should handle 100% check-in rate', () => {
      const summary = createMockSummary({ checkInRate: 100 })
      render(<CheckinOverview summary={summary} />)

      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('should display large numbers correctly', () => {
      const summary = createMockSummary({
        totalCheckedIn: 10000,
        totalSold: 15000,
        totalTicketQuantity: 20000,
      })
      render(<CheckinOverview summary={summary} />)

      expect(screen.getByText('10000')).toBeInTheDocument()
      expect(screen.getByText('15000')).toBeInTheDocument()
      expect(screen.getByText('20000')).toBeInTheDocument()
    })

    it('should handle zero values', () => {
      const summary = createMockSummary({
        totalCheckedIn: 0,
        totalSold: 0,
        totalTicketQuantity: 0,
        totalTicketTypes: 0,
        checkInRate: 0,
      })
      render(<CheckinOverview summary={summary} />)

      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should render with responsive grid layout', () => {
      const summary = createMockSummary()
      render(<CheckinOverview summary={summary} />)

      const mainCard = screen.getByText('Đã check-in').closest('div')
      expect(mainCard).toHaveClass('rounded-2xl', 'bg-gradient-to-br')
    })

    it('should position radial progress absolutely on the right', () => {
      const summary = createMockSummary()
      render(<CheckinOverview summary={summary} />)

      const progressContainer = screen.getByText('70%').parentElement?.parentElement
      expect(progressContainer).toHaveClass('absolute', 'right-10')
    })

    it('should render stat cards in vertical layout', () => {
      const summary = createMockSummary()
      render(<CheckinOverview summary={summary} />)

      const statCardsContainer = screen.getByText('Tổng loại vé').closest('.flex')
      expect(statCardsContainer).toHaveClass('flex-col')
    })
  })

  describe('Styling', () => {
    it('should apply gradient background to main card', () => {
      const summary = createMockSummary()
      render(<CheckinOverview summary={summary} />)

      const mainCard = screen.getByText('Đã check-in').closest('.rounded-2xl')
      expect(mainCard).toHaveClass('bg-gradient-to-br')
    })

    it('should apply gradient background to stat cards', () => {
      const summary = createMockSummary()
      render(<CheckinOverview summary={summary} />)

      const statCards = document.querySelectorAll('.rounded-2xl.bg-gradient-to-br')
      expect(statCards.length).toBe(3) // 1 main card + 2 stat cards
    })

    it('should render values with large font size', () => {
      const summary = createMockSummary()
      render(<CheckinOverview summary={summary} />)

      const mainValue = screen.getByText('350')
      expect(mainValue).toHaveClass('text-5xl', 'font-bold')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large check-in rate', () => {
      const summary = createMockSummary({ checkInRate: 999.99 })
      render(<CheckinOverview summary={summary} />)

      expect(screen.getByText('100000%')).toBeInTheDocument()
    })

    it('should handle negative values gracefully', () => {
      const summary = createMockSummary({
        totalCheckedIn: -100,
        totalSold: -50,
      })
      render(<CheckinOverview summary={summary} />)

      expect(screen.getByText('-100')).toBeInTheDocument()
      expect(screen.getByText('-50')).toBeInTheDocument()
    })

    it('should handle decimal values for counts', () => {
      const summary = createMockSummary({
        totalCheckedIn: 350.5,
        totalSold: 500.7,
      } as SummaryCheckIn)
      render(<CheckinOverview summary={summary} />)

      expect(screen.getByText('350.5')).toBeInTheDocument()
      expect(screen.getByText('500.7')).toBeInTheDocument()
    })
  })
})
