/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ScheduleCard from '../../../../components/Organizer/ScheduleCard'

// Mock TicketRow component
jest.mock('../../../../components/Organizer/ticket/TicketRow', () => ({
  __esModule: true,
  default: ({ ticket }: { ticket: any }) => (
    <div data-testid="ticket-row" data-ticket-id={ticket.id}>
      <span data-testid="ticket-name">{ticket.name}</span>
      <span data-testid="ticket-price">{ticket.price}</span>
    </div>
  ),
}))

describe('ScheduleCard', () => {
  const mockSchedule = {
    date: '01/12/2024',
    time: '19:00 - 21:00',
    tickets: [
      { id: 'ticket-1', name: 'VIP', price: '500.000đ' },
      { id: 'ticket-2', name: 'Standard', price: '200.000đ' },
    ],
  }

  const mockOnAddTicket = jest.fn()

  const defaultProps = {
    schedule: mockSchedule,
    onAddTicket: mockOnAddTicket,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render without crashing', () => {
      render(<ScheduleCard {...defaultProps} />)
      expect(screen.getByText('01/12/2024')).toBeInTheDocument()
    })

    it('should render schedule date', () => {
      render(<ScheduleCard {...defaultProps} />)
      expect(screen.getByText('01/12/2024')).toBeInTheDocument()
    })

    it('should render schedule time', () => {
      render(<ScheduleCard {...defaultProps} />)
      expect(screen.getByText('19:00 - 21:00')).toBeInTheDocument()
    })

    it('should render ticket count', () => {
      render(<ScheduleCard {...defaultProps} />)
      expect(screen.getByText('2 Loại vé')).toBeInTheDocument()
    })

    it('should render calendar icon', () => {
      const { container } = render(<ScheduleCard {...defaultProps} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('should render chevron icon', () => {
      const { container } = render(<ScheduleCard {...defaultProps} />)
      const chevrons = container.querySelectorAll('svg')
      expect(chevrons.length).toBeGreaterThan(1)
    })
  })

  describe('Expand/Collapse', () => {
    it('should be expanded by default', () => {
      render(<ScheduleCard {...defaultProps} />)
      expect(screen.getByText('Tên loại vé')).toBeInTheDocument()
      expect(screen.getByText('Giá')).toBeInTheDocument()
      expect(screen.getByText('Số lượng')).toBeInTheDocument()
      expect(screen.getByText('Thao tác')).toBeInTheDocument()
    })

    it('should collapse when clicking header', async () => {
      render(<ScheduleCard {...defaultProps} />)
      const header = screen.getByText('01/12/2024').closest('button')

      await userEvent.click(header!)

      expect(screen.queryByText('Tên loại vé')).not.toBeInTheDocument()
    })

    it('should expand when clicking collapsed header', async () => {
      render(<ScheduleCard {...defaultProps} />)
      const header = screen.getByText('01/12/2024').closest('button')

      // Collapse
      await userEvent.click(header!)
      expect(screen.queryByText('Tên loại vé')).not.toBeInTheDocument()

      // Expand
      await userEvent.click(header!)
      expect(screen.getByText('Tên loại vé')).toBeInTheDocument()
    })

    it('should rotate chevron when expanded/collapsed', async () => {
      const { container } = render(<ScheduleCard {...defaultProps} />)
      const header = screen.getByText('01/12/2024').closest('button')

      // Initially expanded - chevron should be rotated
      expect(container.querySelector('.rotate-180')).toBeInTheDocument()

      // Collapse
      await userEvent.click(header!)
      expect(container.querySelector('.rotate-180')).not.toBeInTheDocument()
    })
  })

  describe('Ticket List', () => {
    it('should render all tickets in the schedule', () => {
      render(<ScheduleCard {...defaultProps} />)
      expect(screen.getByText('VIP')).toBeInTheDocument()
      expect(screen.getByText('Standard')).toBeInTheDocument()
    })

    it('should render TicketRow for each ticket', () => {
      render(<ScheduleCard {...defaultProps} />)
      const ticketRows = screen.getAllByTestId('ticket-row')
      expect(ticketRows).toHaveLength(2)
    })

    it('should render ticket names', () => {
      render(<ScheduleCard {...defaultProps} />)
      expect(screen.getByTestId('ticket-name')).toHaveTextContent('VIP')
    })

    it('should render empty ticket list message', () => {
      const emptySchedule = {
        date: '02/12/2024',
        time: '20:00 - 22:00',
        tickets: [],
      }
      render(<ScheduleCard {...defaultProps} schedule={emptySchedule} />)
      expect(screen.queryByTestId('ticket-row')).not.toBeInTheDocument()
    })
  })

  describe('Table Headers', () => {
    it('should render table headers when expanded', () => {
      render(<ScheduleCard {...defaultProps} />)
      expect(screen.getByText('Tên loại vé')).toBeInTheDocument()
      expect(screen.getByText('Giá')).toBeInTheDocument()
      expect(screen.getByText('Số lượng')).toBeInTheDocument()
      expect(screen.getByText('Thao tác')).toBeInTheDocument()
    })

    it('should not render table headers when collapsed', async () => {
      render(<ScheduleCard {...defaultProps} />)
      const header = screen.getByText('01/12/2024').closest('button')

      await userEvent.click(header!)

      expect(screen.queryByText('Tên loại vé')).not.toBeInTheDocument()
      expect(screen.queryByText('Giá')).not.toBeInTheDocument()
    })
  })

  describe('Add Ticket Button', () => {
    it('should render add ticket button', () => {
      render(<ScheduleCard {...defaultProps} />)
      expect(screen.getByText('Tạo loại vé mới')).toBeInTheDocument()
    })

    it('should call onAddTicket when clicking add button', async () => {
      render(<ScheduleCard {...defaultProps} />)
      const addButton = screen.getByText('Tạo loại vé mới')

      await userEvent.click(addButton)

      expect(mockOnAddTicket).toHaveBeenCalled()
    })

    it('should not call onAddTicket when clicking other elements', async () => {
      render(<ScheduleCard {...defaultProps} />)
      const header = screen.getByText('01/12/2024')

      await userEvent.click(header)

      expect(mockOnAddTicket).not.toHaveBeenCalled()
    })

    it('should render add button with icon', () => {
      render(<ScheduleCard {...defaultProps} />)
      const addButton = screen.getByText('Tạo loại vé mới')
      expect(addButton.querySelector('svg')).toBeInTheDocument()
    })

    it('should render add button with dashed border', () => {
      render(<ScheduleCard {...defaultProps} />)
      const addButton = screen.getByText('Tạo loại vé mới')
      expect(addButton).toHaveClass('border-dashed')
    })
  })

  describe('Styling', () => {
    it('should render card with gradient background', () => {
      const card = screen.getByText('01/12/2024').closest('.rounded-2xl')
      expect(card).toHaveClass('bg-gradient-to-b')
    })

    it('should render card with border', () => {
      render(<ScheduleCard {...defaultProps} />)
      const card = screen.getByText('01/12/2024').closest('.rounded-2xl')
      expect(card).toHaveClass('border-white/5')
    })

    it('should render header with hover effect', () => {
      render(<ScheduleCard {...defaultProps} />)
      const header = screen.getByText('01/12/2024').closest('button')
      expect(header).toHaveClass('hover:bg-white/5')
    })

    it('should render calendar icon with primary color', () => {
      const iconContainer = screen.getByText('01/12/2024').parentElement?.querySelector('.bg-primary\\/20')
      expect(iconContainer).toHaveClass('text-primary')
    })

    it('should render date with white bold text', () => {
      render(<ScheduleCard {...defaultProps} />)
      const dateText = screen.getByText('01/12/2024')
      expect(dateText).toHaveClass('font-semibold', 'text-white')
    })

    it('should render time with slate-400 color', () => {
      render(<ScheduleCard {...defaultProps} />)
      const timeText = screen.getByText('19:00 - 21:00')
      expect(timeText).toHaveClass('text-slate-400')
    })
  })

  describe('User Interactions', () => {
    it('should toggle expand/collapse on header click', async () => {
      render(<ScheduleCard {...defaultProps} />)
      const header = screen.getByText('01/12/2024').closest('button')

      // Initially expanded
      expect(screen.getByText('Tên loại vé')).toBeInTheDocument()

      // Collapse
      await userEvent.click(header!)
      expect(screen.queryByText('Tên loại vé')).not.toBeInTheDocument()

      // Expand again
      await userEvent.click(header!)
      expect(screen.getByText('Tên loại vé')).toBeInTheDocument()
    })

    it('should add ticket when clicking add button', async () => {
      render(<ScheduleCard {...defaultProps} />)
      const addButton = screen.getByText('Tạo loại vé mới')

      await userEvent.click(addButton)

      expect(mockOnAddTicket).toHaveBeenCalledTimes(1)
    })

    it('should not trigger add ticket when clicking header', async () => {
      render(<ScheduleCard {...defaultProps} />)
      const header = screen.getByText('01/12/2024').closest('button')

      await userEvent.click(header!)

      expect(mockOnAddTicket).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle schedule with no tickets', () => {
      const emptySchedule = {
        date: '03/12/2024',
        time: '18:00 - 20:00',
        tickets: [],
      }
      render(<ScheduleCard {...defaultProps} schedule={emptySchedule} />)
      expect(screen.getByText('03/12/2024')).toBeInTheDocument()
      expect(screen.getByText('0 Loại vé')).toBeInTheDocument()
    })

    it('should handle schedule with many tickets', () => {
      const manyTickets = {
        date: '04/12/2024',
        time: '19:00 - 21:00',
        tickets: Array.from({ length: 10 }, (_, i) => ({
          id: `ticket-${i}`,
          name: `Ticket ${i + 1}`,
          price: `${(i + 1) * 100000}đ`,
        })),
      }
      render(<ScheduleCard {...defaultProps} schedule={manyTickets} />)
      expect(screen.getByText('10 Loại vé')).toBeInTheDocument()
      const ticketRows = screen.getAllByTestId('ticket-row')
      expect(ticketRows).toHaveLength(10)
    })

    it('should handle empty date string', () => {
      const emptyDateSchedule = {
        date: '',
        time: '19:00 - 21:00',
        tickets: [],
      }
      render(<ScheduleCard {...defaultProps} schedule={emptyDateSchedule} />)
      expect(screen.getByText('')).toBeInTheDocument()
    })

    it('should handle empty time string', () => {
      const emptyTimeSchedule = {
        date: '05/12/2024',
        time: '',
        tickets: [],
      }
      render(<ScheduleCard {...defaultProps} schedule={emptyTimeSchedule} />)
      expect(screen.getByText('')).toBeInTheDocument()
    })

    it('should handle special characters in date', () => {
      const specialDateSchedule = {
        date: '01/12/2024 <Special>',
        time: '19:00 - 21:00',
        tickets: [],
      }
      render(<ScheduleCard {...defaultProps} schedule={specialDateSchedule} />)
      expect(screen.getByText('01/12/2024 <Special>')).toBeInTheDocument()
    })

    it('should handle undefined onAddTicket', () => {
      render(<ScheduleCard schedule={mockSchedule} onAddTicket={undefined as any} />)
      const addButton = screen.getByText('Tạo loại vé mới')
      expect(addButton).toBeInTheDocument()
    })

    it('should handle very long date strings', () => {
      const longDateSchedule = {
        date: 'A'.repeat(100),
        time: '19:00 - 21:00',
        tickets: [],
      }
      render(<ScheduleCard {...defaultProps} schedule={longDateSchedule} />)
      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument()
    })

    it('should handle tickets without id', () => {
      const noIdSchedule = {
        date: '06/12/2024',
        time: '19:00 - 21:00',
        tickets: [
          { name: 'No ID Ticket', price: '100.000đ' },
        ],
      }
      render(<ScheduleCard {...defaultProps} schedule={noIdSchedule} />)
      expect(screen.getByText('No ID Ticket')).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should render header with flex layout', () => {
      render(<ScheduleCard {...defaultProps} />)
      const header = screen.getByText('01/12/2024').closest('button')
      expect(header).toHaveClass('flex', 'items-center', 'justify-between')
    })

    it('should render tickets in vertical stack', () => {
      render(<ScheduleCard {...defaultProps} />)
      const ticketSection = screen.getByText('Tên loại vé').closest('.space-y-4')
      expect(ticketSection).toBeInTheDocument()
    })

    it('should render add button at the bottom', () => {
      render(<ScheduleCard {...defaultProps} />)
      const addButton = screen.getByText('Tạo loại vé mới')
      expect(addButton).toHaveClass('w-full')
    })

    it('should render table header row with flex layout', () => {
      render(<ScheduleCard {...defaultProps} />)
      const headerRow = screen.getByText('Tên loại vé').parentElement
      expect(headerRow).toHaveClass('flex')
    })
  })

  describe('Accessibility', () => {
    it('should render header as button', () => {
      render(<ScheduleCard {...defaultProps} />)
      const header = screen.getByText('01/12/2024')
      expect(header.closest('button')).toBeInTheDocument()
    })

    it('should render add ticket as button', () => {
      render(<ScheduleCard {...defaultProps} />)
      const addButton = screen.getByText('Tạo loại vé mới')
      expect(addButton.tagName).toBe('BUTTON')
    })
  })
})
