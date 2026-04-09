/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

import TicketTypeBarChart from '../../../../../components/Organizer/overview/ticketTypeBarChart'
import type { TicketTypeBreakdown } from '../../../../../types/ticketing/ticketing'

// Mock recharts
jest.mock('recharts', () => ({
  BarChart: ({ children, data }: any) => <div data-testid="bar-chart" data-items={data?.length}>{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Legend: () => <div data-testid="legend" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
}))

describe('TicketTypeBarChart', () => {
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
    it('should render without crashing', () => {
      render(<TicketTypeBarChart breakdown={mockBreakdown} />)
      expect(screen.getByText('Theo loại vé')).toBeInTheDocument()
    })

    it('should render chart subtitle', () => {
      render(<TicketTypeBarChart breakdown={mockBreakdown} />)
      expect(screen.getByText('So sánh tổng vé, đã bán và đã check-in theo từng loại')).toBeInTheDocument()
    })

    it('should render chart container', () => {
      render(<TicketTypeBarChart breakdown={mockBreakdown} />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('should render recharts components', () => {
      render(<TicketTypeBarChart breakdown={mockBreakdown} />)
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
      expect(screen.getByTestId('legend')).toBeInTheDocument()
      expect(screen.getAllByTestId('bar')).toHaveLength(3)
    })

    it('should render chart with correct data count', () => {
      render(<TicketTypeBarChart breakdown={mockBreakdown} />)
      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-items', '3')
    })
  })

  describe('Empty State', () => {
    it('should show empty message when breakdown is empty', () => {
      render(<TicketTypeBarChart breakdown={[]} />)
      expect(screen.getByText('Không có dữ liệu vé.')).toBeInTheDocument()
    })

    it('should show empty message when breakdown is null', () => {
      render(<TicketTypeBarChart breakdown={null as any} />)
      expect(screen.getByText('Không có dữ liệu vé.')).toBeInTheDocument()
    })

    it('should show empty message when breakdown is not array', () => {
      render(<TicketTypeBarChart breakdown={'not-array' as any} />)
      expect(screen.getByText('Không có dữ liệu vé.')).toBeInTheDocument()
    })

    it('should not render chart when empty', () => {
      render(<TicketTypeBarChart breakdown={[]} />)
      expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument()
    })
  })

  describe('Data Normalization', () => {
    it('should normalize TicketTypeBreakdown data', () => {
      render(<TicketTypeBarChart breakdown={mockBreakdown} />)
      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-items', '3')
    })

    it('should handle TicketStat data type', () => {
      const ticketStats = [
        {
          ticketTypeId: 'vip',
          ticketTypeName: 'VIP',
          quantity: 100,
          sold: 80,
          checkedIn: 60,
        },
        {
          ticketTypeId: 'standard',
          ticketTypeName: 'Standard',
          quantity: 500,
          sold: 400,
          checkedIn: 300,
        },
      ]
      render(<TicketTypeBarChart breakdown={ticketStats as any} />)
      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-items', '2')
    })
  })

  describe('Dynamic Height', () => {
    it('should use 320px height for 4 or fewer ticket types', () => {
      render(<TicketTypeBarChart breakdown={mockBreakdown} />)
      const chartContainer = screen.getByTestId('responsive-container').parentElement
      expect(chartContainer).toHaveStyle({ height: '320px' })
    })

    it('should use 380px height for more than 4 ticket types', () => {
      const manyTypes = [
        ...mockBreakdown,
        {
          ticketTypeId: 'early',
          ticketTypeName: 'Early Bird',
          totalQuantity: 50,
          quantitySold: 50,
          quantityCheckedIn: 40,
          revenue: 5000000,
        },
        {
          ticketTypeId: 'group',
          ticketTypeName: 'Group',
          totalQuantity: 300,
          quantitySold: 200,
          quantityCheckedIn: 150,
          revenue: 20000000,
        },
      ]
      render(<TicketTypeBarChart breakdown={manyTypes} />)
      const chartContainer = screen.getByTestId('responsive-container').parentElement
      expect(chartContainer).toHaveStyle({ height: '380px' })
    })
  })

  describe('Styling', () => {
    it('should render with violet gradient background', () => {
      render(<TicketTypeBarChart breakdown={mockBreakdown} />)
      const card = screen.getByText('Theo loại vé').closest('.rounded-2xl')
      expect(card).toHaveClass('bg-gradient-to-br')
    })

    it('should render with violet border', () => {
      render(<TicketTypeBarChart breakdown={mockBreakdown} />)
      const card = screen.getByText('Theo loại vé').closest('.border-violet-500\\/20')
      expect(card).toHaveClass('border-violet-500/20')
    })

    it('should render blur effect background', () => {
      render(<TicketTypeBarChart breakdown={mockBreakdown} />)
      const blurEffect = document.querySelector('.blur-3xl')
      expect(blurEffect).toBeInTheDocument()
    })

    it('should render chart title with bold text', () => {
      render(<TicketTypeBarChart breakdown={mockBreakdown} />)
      const title = screen.getByText('Theo loại vé')
      expect(title).toHaveClass('font-bold')
    })

    it('should render subtitle with slate-400 color', () => {
      render(<TicketTypeBarChart breakdown={mockBreakdown} />)
      const subtitle = screen.getByText(/So sánh tổng vé/)
      expect(subtitle).toHaveClass('text-slate-400')
    })
  })

  describe('Edge Cases', () => {
    it('should handle single ticket type', () => {
      const singleBreakdown: TicketTypeBreakdown[] = [
        {
          ticketTypeId: 'vip',
          ticketTypeName: 'VIP Only',
          totalQuantity: 100,
          quantitySold: 80,
          quantityCheckedIn: 60,
          revenue: 80000000,
        },
      ]
      render(<TicketTypeBarChart breakdown={singleBreakdown} />)
      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-items', '1')
    })

    it('should handle ticket types with zero quantities', () => {
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
      render(<TicketTypeBarChart breakdown={zeroBreakdown} />)
      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-items', '1')
    })

    it('should handle very long ticket type names', () => {
      const longNameBreakdown: TicketTypeBreakdown[] = [
        {
          ticketTypeId: 'long',
          ticketTypeName: 'A'.repeat(50),
          totalQuantity: 100,
          quantitySold: 80,
          quantityCheckedIn: 60,
          revenue: 80000000,
        },
      ]
      render(<TicketTypeBarChart breakdown={longNameBreakdown} />)
      expect(screen.getByText('A'.repeat(50))).toBeInTheDocument()
    })

    it('should handle large quantity values', () => {
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
      render(<TicketTypeBarChart breakdown={largeBreakdown} />)
      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-items', '1')
    })

    it('should handle checked-in exceeding sold', () => {
      const overCheckinBreakdown: TicketTypeBreakdown[] = [
        {
          ticketTypeId: 'vip',
          ticketTypeName: 'VIP',
          totalQuantity: 100,
          quantitySold: 50,
          quantityCheckedIn: 60,
          revenue: 50000000,
        },
      ]
      render(<TicketTypeBarChart breakdown={overCheckinBreakdown} />)
      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-items', '1')
    })

    it('should handle special characters in names', () => {
      const specialBreakdown: TicketTypeBreakdown[] = [
        {
          ticketTypeId: 'special',
          ticketTypeName: 'VIP <Premium> & "Exclusive"',
          totalQuantity: 100,
          quantitySold: 80,
          quantityCheckedIn: 60,
          revenue: 80000000,
        },
      ]
      render(<TicketTypeBarChart breakdown={specialBreakdown} />)
      expect(screen.getByText('VIP <Premium> & "Exclusive"')).toBeInTheDocument()
    })

    it('should handle many ticket types with angled labels', () => {
      const manyTypes = Array.from({ length: 10 }, (_, i) => ({
        ticketTypeId: `type-${i}`,
        ticketTypeName: `Type ${i}`,
        totalQuantity: 100,
        quantitySold: 80,
        quantityCheckedIn: 60,
        revenue: 80000000,
      }))
      render(<TicketTypeBarChart breakdown={manyTypes} />)
      const chartContainer = screen.getByTestId('responsive-container').parentElement
      expect(chartContainer).toHaveStyle({ height: '380px' })
    })
  })
})
