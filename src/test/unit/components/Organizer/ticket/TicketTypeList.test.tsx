/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

import TicketTypeList from '../../../../../components/Organizer/ticket/TicketTypeList'
import type { TicketTypeItem } from '../../../../../types/ticketType/ticketType'

describe('TicketTypeList', () => {
  const mockTicketTypes: TicketTypeItem[] = [
    { id: 'ticket-1', name: 'VIP', price: 500000, quantity: 100, soldQuantity: 75, remainingQuantity: 25, areaId: 'area-1', areaName: 'Zone A', areaType: 'Zone' },
    { id: 'ticket-2', name: 'Standard', price: 200000, quantity: 200, soldQuantity: 100, remainingQuantity: 100, areaId: 'area-2', areaName: 'Zone B', areaType: 'Zone' },
    { id: 'ticket-3', name: 'Free Ticket', price: 0, quantity: 50, soldQuantity: 30, remainingQuantity: 20, areaId: 'area-3', areaName: 'Zone C', areaType: 'Zone' },
  ]

  describe('Render', () => {
    it('should render all ticket cards', () => {
      render(<TicketTypeList ticketTypes={mockTicketTypes} />)
      expect(screen.getByText('VIP')).toBeInTheDocument()
      expect(screen.getByText('Standard')).toBeInTheDocument()
      expect(screen.getByText('Free Ticket')).toBeInTheDocument()
    })

    it('should render ticket names', () => {
      render(<TicketTypeList ticketTypes={mockTicketTypes} />)
      expect(screen.getByText('VIP')).toBeInTheDocument()
    })

    it('should render sold quantity information', () => {
      render(<TicketTypeList ticketTypes={mockTicketTypes} />)
      expect(screen.getByText('Đã bán: 75 / 100')).toBeInTheDocument()
      expect(screen.getByText('Đã bán: 100 / 200')).toBeInTheDocument()
    })

    it('should render formatted price', () => {
      render(<TicketTypeList ticketTypes={mockTicketTypes} />)
      expect(screen.getByText('500.000đ')).toBeInTheDocument()
      expect(screen.getByText('200.000đ')).toBeInTheDocument()
    })

    it('should render FREE for zero price tickets', () => {
      render(<TicketTypeList ticketTypes={mockTicketTypes} />)
      expect(screen.getByText('FREE')).toBeInTheDocument()
    })

    it('should render remaining quantity', () => {
      render(<TicketTypeList ticketTypes={mockTicketTypes} />)
      expect(screen.getByText('25 còn lại')).toBeInTheDocument()
      expect(screen.getByText('100 còn lại')).toBeInTheDocument()
    })

    it('should render progress bars', () => {
      render(<TicketTypeList ticketTypes={mockTicketTypes} />)
      const progressBars = document.querySelectorAll('.bg-primary')
      expect(progressBars.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Progress Bar', () => {
    it('should calculate correct width for sold percentage', () => {
      render(<TicketTypeList ticketTypes={mockTicketTypes} />)
      const progressBars = document.querySelectorAll('.bg-primary.transition-all')
      expect(progressBars.length).toBe(3)
    })

    it('should handle zero quantity without division by zero', () => {
      const zeroQuantityTickets: TicketTypeItem[] = [
        { id: 'ticket-zero', name: 'Zero Qty', price: 100000, quantity: 0, soldQuantity: 0, remainingQuantity: 0, areaId: '', areaName: '', areaType: 'Zone' },
      ]
      render(<TicketTypeList ticketTypes={zeroQuantityTickets} />)
      expect(screen.getByText('Zero Qty')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should render cards with gradient background', () => {
      render(<TicketTypeList ticketTypes={mockTicketTypes} />)
      const cards = document.querySelectorAll('.rounded-2xl')
      cards.forEach(card => {
        expect(card).toHaveClass('bg-gradient-to-b')
      })
    })

    it('should render cards with border', () => {
      render(<TicketTypeList ticketTypes={mockTicketTypes} />)
      const cards = document.querySelectorAll('.rounded-2xl')
      cards.forEach(card => {
        expect(card).toHaveClass('border-white/5')
      })
    })

    it('should render ticket names with white bold text', () => {
      render(<TicketTypeList ticketTypes={mockTicketTypes} />)
      const ticketNames = document.querySelectorAll('.text-white.font-semibold')
      expect(ticketNames.length).toBe(3)
    })

    it('should render prices with primary color', () => {
      render(<TicketTypeList ticketTypes={mockTicketTypes} />)
      const prices = document.querySelectorAll('.text-primary')
      expect(prices.length).toBe(3)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty array', () => {
      render(<TicketTypeList ticketTypes={[]} />)
      expect(screen.queryByText('VIP')).not.toBeInTheDocument()
    })

    it('should handle large quantities', () => {
      const largeTickets: TicketTypeItem[] = [
        { id: 'ticket-large', name: 'Large', price: 1000000, quantity: 100000, soldQuantity: 50000, remainingQuantity: 50000, areaId: '', areaName: '', areaType: 'Zone' },
      ]
      render(<TicketTypeList ticketTypes={largeTickets} />)
      expect(screen.getByText('100.000 vé')).toBeInTheDocument()
      expect(screen.getByText('50.000 còn lại')).toBeInTheDocument()
    })

    it('should handle tickets with all fields zero', () => {
      const zeroTickets: TicketTypeItem[] = [
        { id: 'ticket-zero', name: 'All Zero', price: 0, quantity: 0, soldQuantity: 0, remainingQuantity: 0, areaId: '', areaName: '', areaType: 'Zone' },
      ]
      render(<TicketTypeList ticketTypes={zeroTickets} />)
      expect(screen.getByText('All Zero')).toBeInTheDocument()
    })

    it('should handle very long ticket names', () => {
      const longNameTickets: TicketTypeItem[] = [
        { id: 'ticket-long', name: 'A'.repeat(100), price: 100000, quantity: 10, soldQuantity: 5, remainingQuantity: 5, areaId: '', areaName: '', areaType: 'Zone' },
      ]
      render(<TicketTypeList ticketTypes={longNameTickets} />)
      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument()
    })

    it('should handle multiple ticket types with same price', () => {
      const samePriceTickets: TicketTypeItem[] = [
        { id: 'ticket-1', name: 'Type 1', price: 100000, quantity: 10, soldQuantity: 5, remainingQuantity: 5, areaId: '', areaName: '', areaType: 'Zone' },
        { id: 'ticket-2', name: 'Type 2', price: 100000, quantity: 20, soldQuantity: 10, remainingQuantity: 10, areaId: '', areaName: '', areaType: 'Zone' },
      ]
      render(<TicketTypeList ticketTypes={samePriceTickets} />)
      expect(screen.getAllByText('100.000đ')).toHaveLength(2)
    })

    it('should format remaining quantity with Vietnamese locale', () => {
      render(<TicketTypeList ticketTypes={mockTicketTypes} />)
      expect(screen.getByText('25 còn lại')).toBeInTheDocument()
    })

    it('should handle decimal prices', () => {
      const decimalTickets: TicketTypeItem[] = [
        { id: 'ticket-decimal', name: 'Decimal', price: 123456.78, quantity: 10, soldQuantity: 5, remainingQuantity: 5, areaId: '', areaName: '', areaType: 'Zone' },
      ]
      render(<TicketTypeList ticketTypes={decimalTickets} />)
      expect(screen.getByText('123.456,78đ')).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should render cards in vertical stack', () => {
      render(<TicketTypeList ticketTypes={mockTicketTypes} />)
      const container = screen.getByText('VIP').closest('.space-y-4')
      expect(container).toBeInTheDocument()
    })

    it('should render each card with flex layout', () => {
      render(<TicketTypeList ticketTypes={mockTicketTypes} />)
      const cards = document.querySelectorAll('.rounded-2xl.flex')
      expect(cards.length).toBe(3)
    })

    it('should render price section on the right', () => {
      render(<TicketTypeList ticketTypes={mockTicketTypes} />)
      const priceSections = document.querySelectorAll('.text-right.shrink-0')
      expect(priceSections.length).toBe(3)
    })
  })
})
