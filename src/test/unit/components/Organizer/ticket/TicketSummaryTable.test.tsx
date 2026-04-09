/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

import TicketSummaryTable from '../../../../../components/Organizer/ticket/TicketSummaryTable'
import type { TicketStat } from '../../../../../types/ticketing/ticketing'

describe('TicketSummaryTable', () => {
  const mockTicketStats: TicketStat[] = [
    { ticketTypeId: 'type-1', ticketTypeName: 'VIP', quantity: 100, sold: 75, checkedIn: 60 },
    { ticketTypeId: 'type-2', ticketTypeName: 'Standard', quantity: 200, sold: 150, checkedIn: 100 },
    { ticketTypeId: 'type-3', ticketTypeName: 'Student', quantity: 150, sold: 50, checkedIn: 40 },
  ]

  describe('Render', () => {
    it('should render table title', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      expect(screen.getByText('Chi tiết')).toBeInTheDocument()
    })

    it('should render table headers', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      expect(screen.getByText('Loại vé')).toBeInTheDocument()
      expect(screen.getByText('Số lượng')).toBeInTheDocument()
      expect(screen.getByText('Đã bán')).toBeInTheDocument()
      expect(screen.getByText('Đã check-in')).toBeInTheDocument()
      expect(screen.getByText('Tỉ lệ check-in')).toBeInTheDocument()
    })

    it('should render ticket type names', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      expect(screen.getByText('VIP')).toBeInTheDocument()
      expect(screen.getByText('Standard')).toBeInTheDocument()
      expect(screen.getByText('Student')).toBeInTheDocument()
    })

    it('should render quantity values', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('200')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument()
    })

    it('should render sold values', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      expect(screen.getByText('75')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
    })

    it('should render checked-in values', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      expect(screen.getByText('60')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('40')).toBeInTheDocument()
    })

    it('should render check-in percentage', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      // VIP: 60/75 = 80%
      // Standard: 100/150 = 67%
      // Student: 40/50 = 80%
      expect(screen.getByText('80%')).toBeInTheDocument()
      expect(screen.getByText('67%')).toBeInTheDocument()
    })

    it('should render progress bars', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      const progressBars = document.querySelectorAll('.bg-primary.rounded-full')
      expect(progressBars.length).toBe(3)
    })
  })

  describe('Empty State', () => {
    it('should show empty message when ticketStats is empty array', () => {
      render(<TicketSummaryTable ticketStats={[]} />)
      expect(screen.getByText('Chi tiết')).toBeInTheDocument()
      expect(screen.getByText('Không có dữ liệu vé.')).toBeInTheDocument()
    })

    it('should not show table headers when empty', () => {
      render(<TicketSummaryTable ticketStats={[]} />)
      expect(screen.queryByText('Loại vé')).not.toBeInTheDocument()
      expect(screen.queryByText('Số lượng')).not.toBeInTheDocument()
    })
  })

  describe('Check-in Rate Calculation', () => {
    it('should calculate correct percentage', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      // VIP: 60/75 = 80%
      const vipRow = screen.getByText('VIP').closest('.grid')
      expect(vipRow).toHaveTextContent('80%')
    })

    it('should handle 100% check-in rate', () => {
      const fullCheckIn: TicketStat[] = [
        { ticketTypeId: 'type-1', ticketTypeName: 'Full', quantity: 100, sold: 50, checkedIn: 50 },
      ]
      render(<TicketSummaryTable ticketStats={fullCheckIn} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should handle 0% check-in rate', () => {
      const noCheckIn: TicketStat[] = [
        { ticketTypeId: 'type-1', ticketTypeName: 'None', quantity: 100, sold: 50, checkedIn: 0 },
      ]
      render(<TicketSummaryTable ticketStats={noCheckIn} />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should cap percentage at 100%', () => {
      const overCheckIn: TicketStat[] = [
        { ticketTypeId: 'type-1', ticketTypeName: 'Over', quantity: 100, sold: 50, checkedIn: 60 },
      ]
      render(<TicketSummaryTable ticketStats={overCheckIn} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should handle zero sold without division by zero', () => {
      const zeroSold: TicketStat[] = [
        { ticketTypeId: 'type-1', ticketTypeName: 'Zero Sold', quantity: 100, sold: 0, checkedIn: 0 },
      ]
      render(<TicketSummaryTable ticketStats={zeroSold} />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should round percentage to nearest integer', () => {
      const decimalRate: TicketStat[] = [
        { ticketTypeId: 'type-1', ticketTypeName: 'Decimal', quantity: 100, sold: 33, checkedIn: 10 },
      ]
      render(<TicketSummaryTable ticketStats={decimalRate} />)
      // 10/33 = 30.303...% → should round to 30%
      expect(screen.getByText('30%')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should render table with gradient background', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      const table = screen.getByText('Loại vé').closest('.rounded-2xl')
      expect(table).toHaveClass('bg-gradient-to-b')
    })

    it('should render table with border', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      const table = screen.getByText('Loại vé').closest('.rounded-2xl')
      expect(table).toHaveClass('border-white/5')
    })

    it('should render headers with uppercase tracking', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      const headers = document.querySelectorAll('.text-slate-400.uppercase')
      expect(headers.length).toBe(5)
    })

    it('should render ticket type names with white medium text', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      const typeNames = document.querySelectorAll('.font-medium.text-white')
      expect(typeNames.length).toBe(3)
    })

    it('should render data with slate-300 color', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      const dataCells = document.querySelectorAll('.text-slate-300')
      expect(dataCells.length).toBeGreaterThan(0)
    })

    it('should render progress bars with primary color', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      const progressBars = document.querySelectorAll('.bg-primary')
      expect(progressBars.length).toBe(3)
    })

    it('should render percentage with slate-400 color', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      const percentages = document.querySelectorAll('.text-slate-400.w-9')
      expect(percentages.length).toBe(3)
    })
  })

  describe('Layout', () => {
    it('should render with grid layout for headers', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      const headerRow = screen.getByText('Loại vé').parentElement
      expect(headerRow).toHaveClass('grid-cols-[1.4fr_1fr_1fr_1fr_1.6fr]')
    })

    it('should render rows with same grid layout', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      const rows = document.querySelectorAll('.grid-cols-[1.4fr_1fr_1fr_1fr_1.6fr]')
      expect(rows.length).toBe(4) // 1 header + 3 data rows
    })

    it('should render with dividers between rows', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      const dividers = document.querySelectorAll('.divide-y')
      expect(dividers.length).toBeGreaterThan(0)
    })

    it('should render progress bar and percentage in same cell', () => {
      render(<TicketSummaryTable ticketStats={mockTicketStats} />)
      const progressCells = document.querySelectorAll('.flex.items-center.gap-3')
      expect(progressCells.length).toBe(3)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null ticketStats', () => {
      render(<TicketSummaryTable ticketStats={null as any} />)
      expect(screen.getByText('Chi tiết')).toBeInTheDocument()
    })

    it('should handle undefined ticketStats', () => {
      render(<TicketSummaryTable ticketStats={undefined as any} />)
      expect(screen.getByText('Chi tiết')).toBeInTheDocument()
    })

    it('should handle non-array ticketStats', () => {
      render(<TicketSummaryTable ticketStats={'not-an-array' as any} />)
      expect(screen.getByText('Chi tiết')).toBeInTheDocument()
    })

    it('should handle large numbers', () => {
      const largeStats: TicketStat[] = [
        { ticketTypeId: 'type-1', ticketTypeName: 'Large', quantity: 1000000, sold: 500000, checkedIn: 400000 },
      ]
      render(<TicketSummaryTable ticketStats={largeStats} />)
      expect(screen.getByText('1000000')).toBeInTheDocument()
      expect(screen.getByText('500000')).toBeInTheDocument()
      expect(screen.getByText('400000')).toBeInTheDocument()
    })

    it('should handle very long ticket type names', () => {
      const longNameStats: TicketStat[] = [
        { ticketTypeId: 'type-1', ticketTypeName: 'A'.repeat(100), quantity: 100, sold: 50, checkedIn: 40 },
      ]
      render(<TicketSummaryTable ticketStats={longNameStats} />)
      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument()
    })

    it('should handle special characters in ticket type names', () => {
      const specialStats: TicketStat[] = [
        { ticketTypeId: 'type-1', ticketTypeName: 'VIP <Premium> & "Exclusive"', quantity: 100, sold: 50, checkedIn: 40 },
      ]
      render(<TicketSummaryTable ticketStats={specialStats} />)
      expect(screen.getByText('VIP <Premium> & "Exclusive"')).toBeInTheDocument()
    })

    it('should handle zero values for all fields', () => {
      const zeroStats: TicketStat[] = [
        { ticketTypeId: 'type-1', ticketTypeName: 'All Zero', quantity: 0, sold: 0, checkedIn: 0 },
      ]
      render(<TicketSummaryTable ticketStats={zeroStats} />)
      expect(screen.getByText('All Zero')).toBeInTheDocument()
      expect(screen.getAllByText('0')).toHaveLength(3)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should handle checked-in greater than sold (data error)', () => {
      const invalidStats: TicketStat[] = [
        { ticketTypeId: 'type-1', ticketTypeName: 'Invalid', quantity: 100, sold: 50, checkedIn: 60 },
      ]
      render(<TicketSummaryTable ticketStats={invalidStats} />)
      // Should cap at 100%
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })
})
