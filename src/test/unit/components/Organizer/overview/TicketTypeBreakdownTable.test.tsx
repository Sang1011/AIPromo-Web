/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

import TicketTypeBreakdownTable from '../../../../../components/Organizer/overview/TicketTypeBreakdownTable'
import type { TicketTypeBreakdown } from '../../../../../types/ticketing/ticketing'

describe('TicketTypeBreakdownTable', () => {
  const mockBreakdown: TicketTypeBreakdown[] = [
    {
      ticketTypeId: 'vip',
      ticketTypeName: 'VIP',
      totalQuantity: 100,
      quantitySold: 80,
      quantityCheckedIn: 60,
      revenue: 80000000,
    },
    {
      ticketTypeId: 'standard',
      ticketTypeName: 'Standard',
      totalQuantity: 500,
      quantitySold: 400,
      quantityCheckedIn: 300,
      revenue: 100000000,
    },
    {
      ticketTypeId: 'student',
      ticketTypeName: 'Student',
      totalQuantity: 200,
      quantitySold: 150,
      quantityCheckedIn: 100,
      revenue: 15000000,
    },
  ]

  describe('Render', () => {
    it('should render table title', () => {
      render(<TicketTypeBreakdownTable breakdown={mockBreakdown} />)
      expect(screen.getByText('Theo loại vé')).toBeInTheDocument()
    })

    it('should render table headers', () => {
      render(<TicketTypeBreakdownTable breakdown={mockBreakdown} />)
      expect(screen.getByText('Loại vé')).toBeInTheDocument()
      expect(screen.getByText('Số lượng')).toBeInTheDocument()
      expect(screen.getByText('Đã bán')).toBeInTheDocument()
      expect(screen.getByText('Doanh thu')).toBeInTheDocument()
      expect(screen.getByText('Tỉ lệ bán')).toBeInTheDocument()
    })

    it('should render ticket type names', () => {
      render(<TicketTypeBreakdownTable breakdown={mockBreakdown} />)
      expect(screen.getByText('VIP')).toBeInTheDocument()
      expect(screen.getByText('Standard')).toBeInTheDocument()
      expect(screen.getByText('Student')).toBeInTheDocument()
    })

    it('should render total quantities', () => {
      render(<TicketTypeBreakdownTable breakdown={mockBreakdown} />)
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('200')).toBeInTheDocument()
    })

    it('should render sold quantities', () => {
      render(<TicketTypeBreakdownTable breakdown={mockBreakdown} />)
      expect(screen.getByText('80')).toBeInTheDocument()
      expect(screen.getByText('400')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument()
    })

    it('should render revenue values', () => {
      render(<TicketTypeBreakdownTable breakdown={mockBreakdown} />)
      expect(screen.getByText('80.000.000')).toBeInTheDocument()
      expect(screen.getByText('100.000.000')).toBeInTheDocument()
      expect(screen.getByText('15.000.000')).toBeInTheDocument()
    })

    it('should render sold percentages', () => {
      render(<TicketTypeBreakdownTable breakdown={mockBreakdown} />)
      expect(screen.getByText('80%')).toBeInTheDocument()
      expect(screen.getByText('80%')).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('should render progress bars', () => {
      render(<TicketTypeBreakdownTable breakdown={mockBreakdown} />)
      const progressBars = document.querySelectorAll('.bg-gradient-to-r')
      expect(progressBars.length).toBe(3)
    })
  })

  describe('Empty State', () => {
    it('should show empty message when breakdown is empty', () => {
      render(<TicketTypeBreakdownTable breakdown={[]} />)
      expect(screen.getByText('Theo loại vé')).toBeInTheDocument()
      expect(screen.getByText('Không có dữ liệu.')).toBeInTheDocument()
    })

    it('should show empty message when breakdown is null', () => {
      render(<TicketTypeBreakdownTable breakdown={null as any} />)
      expect(screen.getByText('Không có dữ liệu.')).toBeInTheDocument()
    })

    it('should show empty message when breakdown is not array', () => {
      render(<TicketTypeBreakdownTable breakdown={'not-array' as any} />)
      expect(screen.getByText('Không có dữ liệu.')).toBeInTheDocument()
    })
  })

  describe('Calculations', () => {
    it('should calculate sold percentage correctly', () => {
      render(<TicketTypeBreakdownTable breakdown={mockBreakdown} />)
      // VIP: 80/100 = 80%
      expect(screen.getByText('80%')).toBeInTheDocument()
    })

    it('should cap percentage at 100%', () => {
      const overSoldBreakdown: TicketTypeBreakdown[] = [
        {
          ticketTypeId: 'vip',
          ticketTypeName: 'VIP',
          totalQuantity: 100,
          quantitySold: 150,
          quantityCheckedIn: 60,
          revenue: 80000000,
        },
      ]
      render(<TicketTypeBreakdownTable breakdown={overSoldBreakdown} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should handle zero total quantity', () => {
      const zeroBreakdown: TicketTypeBreakdown[] = [
        {
          ticketTypeId: 'vip',
          ticketTypeName: 'VIP',
          totalQuantity: 0,
          quantitySold: 0,
          quantityCheckedIn: 0,
          revenue: 0,
        },
      ]
      render(<TicketTypeBreakdownTable breakdown={zeroBreakdown} />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should render with gradient background', () => {
      render(<TicketTypeBreakdownTable breakdown={mockBreakdown} />)
      const table = screen.getByText('Loại vé').closest('.rounded-2xl')
      expect(table).toHaveClass('bg-gradient-to-br')
    })

    it('should render with violet border', () => {
      render(<TicketTypeBreakdownTable breakdown={mockBreakdown} />)
      const table = screen.getByText('Loại vé').closest('.border-violet-500\\/20')
      expect(table).toHaveClass('border-violet-500/20')
    })

    it('should render ticket type names with white text', () => {
      render(<TicketTypeBreakdownTable breakdown={mockBreakdown} />)
      const typeNames = document.querySelectorAll('.font-medium.text-white')
      expect(typeNames.length).toBe(3)
    })

    it('should render data with slate-300 color', () => {
      render(<TicketTypeBreakdownTable breakdown={mockBreakdown} />)
      const dataCells = document.querySelectorAll('.text-slate-300')
      expect(dataCells.length).toBeGreaterThan(0)
    })

    it('should render progress bars with gradient', () => {
      render(<TicketTypeBreakdownTable breakdown={mockBreakdown} />)
      const progressBars = document.querySelectorAll('.from-primary.to-purple-400')
      expect(progressBars.length).toBe(3)
    })

    it('should render percentage with bold font', () => {
      render(<TicketTypeBreakdownTable breakdown={mockBreakdown} />)
      const percentages = document.querySelectorAll('.font-semibold')
      expect(percentages.length).toBeGreaterThan(0)
    })
  })

  describe('Layout', () => {
    it('should render with 5-column grid', () => {
      render(<TicketTypeBreakdownTable breakdown={mockBreakdown} />)
      const headerRow = screen.getByText('Loại vé').parentElement
      expect(headerRow).toHaveClass('grid-cols-[1.4fr_1fr_1fr_1.2fr_1.6fr]')
    })

    it('should render data rows with same grid layout', () => {
      render(<TicketTypeBreakdownTable breakdown={mockBreakdown} />)
      const rows = document.querySelectorAll('.grid-cols-[1.4fr_1fr_1fr_1.2fr_1.6fr]')
      expect(rows.length).toBe(4) // 1 header + 3 data rows
    })

    it('should render with dividers between rows', () => {
      render(<TicketTypeBreakdownTable breakdown={mockBreakdown} />)
      const dividers = document.querySelectorAll('.divide-y')
      expect(dividers.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long ticket type names', () => {
      const longNameBreakdown: TicketTypeBreakdown[] = [
        {
          ticketTypeId: 'long',
          ticketTypeName: 'A'.repeat(100),
          totalQuantity: 100,
          quantitySold: 50,
          quantityCheckedIn: 30,
          revenue: 50000000,
        },
      ]
      render(<TicketTypeBreakdownTable breakdown={longNameBreakdown} />)
      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument()
    })

    it('should handle large quantities', () => {
      const largeBreakdown: TicketTypeBreakdown[] = [
        {
          ticketTypeId: 'large',
          ticketTypeName: 'Large',
          totalQuantity: 1000000,
          quantitySold: 500000,
          quantityCheckedIn: 400000,
          revenue: 500000000000,
        },
      ]
      render(<TicketTypeBreakdownTable breakdown={largeBreakdown} />)
      expect(screen.getByText('1.000.000')).toBeInTheDocument()
      expect(screen.getByText('500.000')).toBeInTheDocument()
    })

    it('should handle zero revenue', () => {
      const zeroRevenueBreakdown: TicketTypeBreakdown[] = [
        {
          ticketTypeId: 'free',
          ticketTypeName: 'Free',
          totalQuantity: 100,
          quantitySold: 50,
          quantityCheckedIn: 30,
          revenue: 0,
        },
      ]
      render(<TicketTypeBreakdownTable breakdown={zeroRevenueBreakdown} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle special characters in names', () => {
      const specialBreakdown: TicketTypeBreakdown[] = [
        {
          ticketTypeId: 'special',
          ticketTypeName: 'VIP <Premium>',
          totalQuantity: 100,
          quantitySold: 50,
          quantityCheckedIn: 30,
          revenue: 50000000,
        },
      ]
      render(<TicketTypeBreakdownTable breakdown={specialBreakdown} />)
      expect(screen.getByText('VIP <Premium>')).toBeInTheDocument()
    })

    it('should handle decimal revenue values', () => {
      const decimalBreakdown: TicketTypeBreakdown[] = [
        {
          ticketTypeId: 'decimal',
          ticketTypeName: 'Decimal',
          totalQuantity: 3,
          quantitySold: 1,
          quantityCheckedIn: 0,
          revenue: 333333.33,
        },
      ]
      render(<TicketTypeBreakdownTable breakdown={decimalBreakdown} />)
      expect(screen.getByText('33%')).toBeInTheDocument()
    })
  })
})
