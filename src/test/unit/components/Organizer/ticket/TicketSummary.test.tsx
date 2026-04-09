/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

import TicketSummary from '../../../../../components/Organizer/ticket/TicketSummary'
import type { TicketTypeItem } from '../../../../../types/ticketType/ticketType'

describe('TicketSummary', () => {
  const mockTicketTypes: TicketTypeItem[] = [
    { id: 'ticket-1', name: 'VIP', price: 500000, quantity: 100, soldQuantity: 75, remainingQuantity: 25, areaId: 'area-1', areaName: 'Zone A', areaType: 'Zone' },
    { id: 'ticket-2', name: 'Standard', price: 200000, quantity: 200, soldQuantity: 100, remainingQuantity: 100, areaId: 'area-2', areaName: 'Zone B', areaType: 'Zone' },
    { id: 'ticket-3', name: 'Student', price: 100000, quantity: 150, soldQuantity: 50, remainingQuantity: 100, areaId: 'area-3', areaName: 'Zone C', areaType: 'Zone' },
  ]

  const mockQuantities = {
    'ticket-1': 2,
    'ticket-2': 3,
    'ticket-3': 1,
  }

  const defaultProps = {
    ticketTypes: mockTicketTypes,
    quantities: mockQuantities,
  }

  describe('Render', () => {
    it('should render summary title', () => {
      render(<TicketSummary {...defaultProps} />)
      expect(screen.getByText('Tổng quan')).toBeInTheDocument()
    })

    it('should render ticket items with quantities', () => {
      render(<TicketSummary {...defaultProps} />)
      expect(screen.getByText('VIP')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should render only tickets with quantity > 0', () => {
      const partialQuantities = {
        'ticket-1': 2,
        'ticket-2': 0,
        'ticket-3': 1,
      }
      render(<TicketSummary {...defaultProps} quantities={partialQuantities} />)
      expect(screen.getByText('VIP')).toBeInTheDocument()
      expect(screen.getByText('Student')).toBeInTheDocument()
      expect(screen.queryByText('Standard')).not.toBeInTheDocument()
    })

    it('should not render tickets with undefined quantity', () => {
      const undefinedQuantities = {
        'ticket-1': 2,
      }
      render(<TicketSummary {...defaultProps} quantities={undefinedQuantities} />)
      expect(screen.getByText('VIP')).toBeInTheDocument()
      expect(screen.queryByText('Standard')).not.toBeInTheDocument()
      expect(screen.queryByText('Student')).not.toBeInTheDocument()
    })

    it('should render total section', () => {
      render(<TicketSummary {...defaultProps} />)
      expect(screen.getByText('Tổng')).toBeInTheDocument()
    })

    it('should render calculated total', () => {
      // VIP: 2 × 500,000 = 1,000,000
      // Standard: 3 × 200,000 = 600,000
      // Student: 1 × 100,000 = 100,000
      // Total: 1,700,000
      render(<TicketSummary {...defaultProps} />)
      expect(screen.getByText('1700000 VND')).toBeInTheDocument()
    })

    it('should render with correct styling', () => {
      render(<TicketSummary {...defaultProps} />)
      const aside = screen.getByText('Tổng quan').closest('aside')
      expect(aside).toHaveClass('w-[320px]', 'rounded-2xl')
    })
  })

  describe('Total Calculation', () => {
    it('should calculate total for single ticket type', () => {
      const singleTicket = mockTicketTypes.slice(0, 1)
      const singleQuantities = { 'ticket-1': 5 }
      render(<TicketSummary ticketTypes={singleTicket} quantities={singleQuantities} />)
      // 5 × 500,000 = 2,500,000
      expect(screen.getByText('2500000 VND')).toBeInTheDocument()
    })

    it('should calculate total for all ticket types', () => {
      render(<TicketSummary {...defaultProps} />)
      expect(screen.getByText('1700000 VND')).toBeInTheDocument()
    })

    it('should handle zero quantities for all tickets', () => {
      const zeroQuantities = {
        'ticket-1': 0,
        'ticket-2': 0,
        'ticket-3': 0,
      }
      render(<TicketSummary {...defaultProps} quantities={zeroQuantities} />)
      expect(screen.getByText('0 VND')).toBeInTheDocument()
    })

    it('should handle empty ticket types array', () => {
      render(<TicketSummary ticketTypes={[]} quantities={{}} />)
      expect(screen.getByText('Tổng')).toBeInTheDocument()
      expect(screen.getByText('0 VND')).toBeInTheDocument()
    })

    it('should handle large quantities', () => {
      const largeQuantities = {
        'ticket-1': 1000,
        'ticket-2': 500,
        'ticket-3': 200,
      }
      render(<TicketSummary {...defaultProps} quantities={largeQuantities} />)
      // 1000×500,000 + 500×200,000 + 200×100,000 = 620,000,000
      expect(screen.getByText('620000000 VND')).toBeInTheDocument()
    })

    it('should handle FREE tickets (price = 0)', () => {
      const freeTickets: TicketTypeItem[] = [
        { id: 'ticket-free', name: 'Free', price: 0, quantity: 100, soldQuantity: 0, remainingQuantity: 100, areaId: '', areaName: '', areaType: 'Zone' },
      ]
      const freeQuantities = { 'ticket-free': 5 }
      render(<TicketSummary ticketTypes={freeTickets} quantities={freeQuantities} />)
      expect(screen.getByText('0 VND')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should render with gradient background', () => {
      render(<TicketSummary {...defaultProps} />)
      const aside = screen.getByText('Tổng quan').closest('aside')
      expect(aside).toHaveClass('bg-gradient-to-b')
    })

    it('should render with border', () => {
      render(<TicketSummary {...defaultProps} />)
      const aside = screen.getByText('Tổng quan').closest('aside')
      expect(aside).toHaveClass('border-white/5')
    })

    it('should render with padding', () => {
      render(<TicketSummary {...defaultProps} />)
      const aside = screen.getByText('Tổng quan').closest('aside')
      expect(aside).toHaveClass('p-6')
    })

    it('should render ticket items in slate color', () => {
      render(<TicketSummary {...defaultProps} />)
      const ticketItems = document.querySelectorAll('.text-slate-300')
      expect(ticketItems.length).toBeGreaterThan(0)
    })

    it('should render total section with white bold text', () => {
      render(<TicketSummary {...defaultProps} />)
      const totalSection = screen.getByText('Tổng').parentElement
      expect(totalSection).toHaveClass('text-white', 'font-semibold')
    })

    it('should render divider line', () => {
      render(<TicketSummary {...defaultProps} />)
      const divider = document.querySelector('.border-t')
      expect(divider).toHaveClass('border-white/10')
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing quantities for some tickets', () => {
      const partialQuantities = {
        'ticket-1': 2,
      }
      render(<TicketSummary {...defaultProps} quantities={partialQuantities} />)
      expect(screen.getByText('VIP')).toBeInTheDocument()
      expect(screen.queryByText('Standard')).not.toBeInTheDocument()
    })

    it('should handle empty quantities object', () => {
      render(<TicketSummary {...defaultProps} quantities={{}} />)
      expect(screen.getByText('0 VND')).toBeInTheDocument()
    })

    it('should handle tickets with decimal prices', () => {
      const decimalTickets: TicketTypeItem[] = [
        { id: 'ticket-decimal', name: 'Decimal', price: 123456.78, quantity: 10, soldQuantity: 5, remainingQuantity: 5, areaId: '', areaName: '', areaType: 'Zone' },
      ]
      const decimalQuantities = { 'ticket-decimal': 3 }
      render(<TicketSummary ticketTypes={decimalTickets} quantities={decimalQuantities} />)
      expect(screen.getByText('370370.34 VND')).toBeInTheDocument()
    })

    it('should handle very large total values', () => {
      const largeTickets: TicketTypeItem[] = [
        { id: 'ticket-large', name: 'Expensive', price: 10000000, quantity: 100, soldQuantity: 50, remainingQuantity: 50, areaId: '', areaName: '', areaType: 'Zone' },
      ]
      const largeQuantities = { 'ticket-large': 100 }
      render(<TicketSummary ticketTypes={largeTickets} quantities={largeQuantities} />)
      expect(screen.getByText('1000000000 VND')).toBeInTheDocument()
    })

    it('should handle special characters in ticket names', () => {
      const specialTickets: TicketTypeItem[] = [
        { id: 'ticket-special', name: 'VIP <Premium>', price: 500000, quantity: 10, soldQuantity: 5, remainingQuantity: 5, areaId: '', areaName: '', areaType: 'Zone' },
      ]
      const specialQuantities = { 'ticket-special': 2 }
      render(<TicketSummary ticketTypes={specialTickets} quantities={specialQuantities} />)
      expect(screen.getByText('VIP <Premium>')).toBeInTheDocument()
    })

    it('should handle negative quantities gracefully', () => {
      const negativeQuantities = {
        'ticket-1': -5,
      }
      render(<TicketSummary {...defaultProps} quantities={negativeQuantities} />)
      // Negative quantities should still be calculated
      expect(screen.getByText('-2500000 VND')).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should render as aside element', () => {
      render(<TicketSummary {...defaultProps} />)
      const aside = screen.getByText('Tổng quan').closest('aside')
      expect(aside?.tagName).toBe('ASIDE')
    })

    it('should render tickets in vertical stack', () => {
      render(<TicketSummary {...defaultProps} />)
      const ticketList = screen.getByText('Tổng quan').nextElementSibling
      expect(ticketList).toHaveClass('space-y-2')
    })

    it('should render total section separated by border', () => {
      render(<TicketSummary {...defaultProps} />)
      const totalSection = screen.getByText('Tổng').parentElement
      expect(totalSection).toHaveClass('border-t', 'pt-4')
    })
  })
})
