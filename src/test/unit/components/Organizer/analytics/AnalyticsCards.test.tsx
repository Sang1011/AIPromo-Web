/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

import AnalyticsCards from '../../../../../components/Organizer/analytics/AnalyticsCards'

describe('AnalyticsCards', () => {
  describe('Render', () => {
    it('should render all 4 stat cards', () => {
      render(<AnalyticsCards />)

      expect(screen.getByText('Số lượt truy cập')).toBeInTheDocument()
      expect(screen.getByText('Người dùng')).toBeInTheDocument()
      expect(screen.getByText('Người mua')).toBeInTheDocument()
      expect(screen.getByText('Tỉ lệ chuyển đổi')).toBeInTheDocument()
    })

    it('should render correct values for each card', () => {
      render(<AnalyticsCards />)

      expect(screen.getByText('5.2k')).toBeInTheDocument()
      expect(screen.getByText('2.1k')).toBeInTheDocument()
      expect(screen.getByText('450')).toBeInTheDocument()
      expect(screen.getByText('8.5%')).toBeInTheDocument()
    })

    it('should render change indicators', () => {
      render(<AnalyticsCards />)

      expect(screen.getByText('+12.5% so với tháng trước')).toBeInTheDocument()
      expect(screen.getByText('+8.2% so với tháng trước')).toBeInTheDocument()
      expect(screen.getByText('+5.4% so với tháng trước')).toBeInTheDocument()
      expect(screen.getByText('-1.2% so với tháng trước')).toBeInTheDocument()
    })

    it('should render icons for each card', () => {
      render(<AnalyticsCards />)

      const icons = document.querySelectorAll('.text-primary')
      expect(icons.length).toBeGreaterThanOrEqual(4)
    })

    it('should apply correct color for positive changes', () => {
      render(<AnalyticsCards />)

      const positiveChanges = document.querySelectorAll('.text-emerald-400')
      expect(positiveChanges.length).toBe(3) // First 3 cards have positive changes
    })

    it('should apply correct color for negative changes', () => {
      render(<AnalyticsCards />)

      const negativeChanges = document.querySelectorAll('.text-red-400')
      expect(negativeChanges.length).toBe(1) // Last card has negative change
    })

    it('should render with correct grid layout', () => {
      render(<AnalyticsCards />)

      const container = screen.getByText('Số lượt truy cập').closest('.grid')
      expect(container).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'xl:grid-cols-4')
    })

    it('should render cards with correct background styling', () => {
      render(<AnalyticsCards />)

      const cards = document.querySelectorAll('.rounded-2xl')
      expect(cards.length).toBe(4)

      cards.forEach(card => {
        expect(card).toHaveClass('bg-gradient-to-br')
        expect(card).toHaveClass('border-white\\/5')
      })
    })
  })

  describe('Data Accuracy', () => {
    it('should display hardcoded data correctly', () => {
      render(<AnalyticsCards />)

      // Visits card
      expect(screen.getByText('Số lượt truy cập')).toBeInTheDocument()
      expect(screen.getByText('5.2k')).toBeInTheDocument()

      // Users card
      expect(screen.getByText('Người dùng')).toBeInTheDocument()
      expect(screen.getByText('2.1k')).toBeInTheDocument()

      // Buyers card
      expect(screen.getByText('Người mua')).toBeInTheDocument()
      expect(screen.getByText('450')).toBeInTheDocument()

      // Conversion rate card
      expect(screen.getByText('Tỉ lệ chuyển đổi')).toBeInTheDocument()
      expect(screen.getByText('8.5%')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should render card labels with correct text color', () => {
      render(<AnalyticsCards />)

      const labels = document.querySelectorAll('.text-slate-400')
      expect(labels.length).toBeGreaterThanOrEqual(4)
    })

    it('should render values with white bold text', () => {
      render(<AnalyticsCards />)

      const values = document.querySelectorAll('.text-3xl.font-bold.text-white')
      expect(values.length).toBe(4)
    })
  })
})
