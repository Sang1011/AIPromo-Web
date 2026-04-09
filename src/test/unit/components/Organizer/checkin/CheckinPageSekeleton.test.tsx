/// <reference types="jest" />
import { render } from '@testing-library/react'

import CheckInPageSkeleton from '../../../../../components/Organizer/checkin/CheckinPageSekeleton'

describe('CheckInPageSkeleton', () => {
  describe('Render', () => {
    it('should render without crashing', () => {
      const { container } = render(<CheckInPageSkeleton />)
      expect(container).toBeInTheDocument()
    })

    it('should render session selector skeleton', () => {
      render(<CheckInPageSkeleton />)

      const skeletonElements = document.querySelectorAll('.animate-pulse')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })

    it('should render check-in overview skeleton', () => {
      render(<CheckInPageSkeleton />)

      // Should have multiple skeleton boxes
      const skeletonElements = document.querySelectorAll('.animate-pulse')
      expect(skeletonElements.length).toBeGreaterThan(5)
    })

    it('should render ticket bar chart skeleton', () => {
      render(<CheckInPageSkeleton />)

      const bars = document.querySelectorAll('[style*="height"]')
      expect(bars.length).toBeGreaterThan(0)
    })

    it('should render ticket summary table skeleton', () => {
      render(<CheckInPageSkeleton />)

      // Should have table structure
      const gridElements = document.querySelectorAll('.grid')
      expect(gridElements.length).toBeGreaterThan(0)
    })

    it('should render with correct spacing', () => {
      render(<CheckInPageSkeleton />)

      const mainContainer = document.firstChild as Element
      expect(mainContainer).toHaveClass('space-y-6')
    })

    it('should render all three main sections', () => {
      render(<CheckInPageSkeleton />)

      const roundedContainers = document.querySelectorAll('.rounded-2xl')
      expect(roundedContainers.length).toBeGreaterThan(3)
    })

    it('should render skeleton boxes with pulse animation', () => {
      render(<CheckInPageSkeleton />)

      const pulseElements = document.querySelectorAll('.animate-pulse')
      expect(pulseElements.length).toBeGreaterThan(10)
    })

    it('should render chart skeleton with bars', () => {
      render(<CheckInPageSkeleton />)

      // Chart should have multiple bar placeholders
      const chartBars = document.querySelectorAll('[class*="rounded-t-md"]')
      expect(chartBars.length).toBeGreaterThan(0)
    })

    it('should render table skeleton with rows', () => {
      render(<CheckInPageSkeleton />)

      // Table should have row placeholders
      const divideElements = document.querySelectorAll('.divide-y')
      expect(divideElements.length).toBeGreaterThan(0)
    })

    it('should render with correct gradient backgrounds', () => {
      render(<CheckInPageSkeleton />)

      const gradientElements = document.querySelectorAll('.bg-gradient-to-br, .bg-gradient-to-b')
      expect(gradientElements.length).toBeGreaterThan(0)
    })

    it('should render session selector with label and input skeletons', () => {
      render(<CheckInPageSkeleton />)

      const flexContainer = document.querySelector('.flex.items-center')
      expect(flexContainer).toHaveClass('gap-4')
    })

    it('should render overview with left and right sections', () => {
      render(<CheckInPageSkeleton />)

      const gridContainers = document.querySelectorAll('.grid-cols-1')
      expect(gridContainers.length).toBeGreaterThan(0)
    })

    it('should render circular progress skeleton', () => {
      render(<CheckInPageSkeleton />)

      const circles = document.querySelectorAll('.rounded-full')
      expect(circles.length).toBeGreaterThan(0)
    })

    it('should render stat cards in overview skeleton', () => {
      render(<CheckInPageSkeleton />)

      // Should have 2 stat cards on the right
      const statCards = document.querySelectorAll('.rounded-2xl.bg-gradient-to-br')
      expect(statCards.length).toBeGreaterThanOrEqual(2)
    })

    it('should apply consistent border styling', () => {
      render(<CheckInPageSkeleton />)

      const borderedElements = document.querySelectorAll('.border-white\\/5')
      expect(borderedElements.length).toBeGreaterThan(0)
    })
  })

  describe('Structure', () => {
    it('should maintain layout hierarchy', () => {
      render(<CheckInPageSkeleton />)

      // Main wrapper should have space-y-6
      const wrapper = document.querySelector('.space-y-6')
      expect(wrapper).toBeInTheDocument()
    })

    it('should render skeleton boxes inside cards', () => {
      render(<CheckInPageSkeleton />)

      const cardElements = document.querySelectorAll('.rounded-2xl')
      cardElements.forEach(card => {
        const skeletons = card.querySelectorAll('.animate-pulse')
        expect(skeletons.length).toBeGreaterThan(0)
      })
    })

    it('should render chart with legend skeleton', () => {
      render(<CheckInPageSkeleton />)

      const legendContainer = document.querySelector('.flex.items-center.justify-center')
      expect(legendContainer).toBeInTheDocument()
    })

    it('should render table with header and body skeletons', () => {
      render(<CheckInPageSkeleton />)

      const tableContainer = document.querySelector('.rounded-2xl.border')
      expect(tableContainer).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should use consistent color scheme', () => {
      render(<CheckInPageSkeleton />)

      const whiteBgElements = document.querySelectorAll('.bg-white\\/5')
      expect(whiteBgElements.length).toBeGreaterThan(0)
    })

    it('should use gradient backgrounds', () => {
      render(<CheckInPageSkeleton />)

      const gradientElements = document.querySelectorAll('[class*="bg-gradient"]')
      expect(gradientElements.length).toBeGreaterThan(0)
    })

    it('should apply rounded corners consistently', () => {
      render(<CheckInPageSkeleton />)

      const roundedElements = document.querySelectorAll('.rounded-2xl')
      expect(roundedElements.length).toBeGreaterThan(0)
    })

    it('should apply pulse animation to skeleton elements', () => {
      render(<CheckInPageSkeleton />)

      const pulseElements = document.querySelectorAll('.animate-pulse')
      pulseElements.forEach(el => {
        expect(el).toHaveClass('animate-pulse')
      })
    })
  })

  describe('Responsiveness', () => {
    it('should use responsive grid classes', () => {
      render(<CheckInPageSkeleton />)

      const gridElements = document.querySelectorAll('.grid-cols-1')
      expect(gridElements.length).toBeGreaterThan(0)
    })
  })
})
