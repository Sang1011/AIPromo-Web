/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

import TicketRow from '../../../../../components/Organizer/ticket/TicketRow'

describe('TicketRow', () => {
  const mockTicket = {
    id: 'ticket-1',
    name: 'VIP Ticket',
    price: 500000,
    quantity: 100,
    note: 'Front row seats',
  }

  describe('Render', () => {
    it('should render ticket name', () => {
      render(<TicketRow ticket={mockTicket} />)
      expect(screen.getByText('VIP Ticket')).toBeInTheDocument()
    })

    it('should render formatted price', () => {
      render(<TicketRow ticket={mockTicket} />)
      expect(screen.getByText('500.000 ₫')).toBeInTheDocument()
    })

    it('should render quantity', () => {
      render(<TicketRow ticket={mockTicket} />)
      expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should render note when available', () => {
      render(<TicketRow ticket={{ ...mockTicket, note: 'Special access' }} />)
      expect(screen.getByText('Special access')).toBeInTheDocument()
    })

    it('should not render note section when note is empty', () => {
      render(<TicketRow ticket={{ ...mockTicket, note: '' }} />)
      expect(screen.queryByTestId('ticket-note')).not.toBeInTheDocument()
    })

    it('should render ticket icon', () => {
      render(<TicketRow ticket={mockTicket} />)
      expect(screen.getByTestId('ticket-icon')).toBeInTheDocument()
    })
  })
})
