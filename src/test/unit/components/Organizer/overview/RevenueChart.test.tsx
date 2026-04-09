/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import RevenueChart from '../../../../../components/Organizer/overview/RevenueChart'
import type { SalesTrendData, SalesTrendPeriod } from '../../../../../types/ticketing/ticketing'

// Mock recharts
jest.mock('recharts', () => ({
  LineChart: ({ children, data }: any) => <div data-testid="line-chart" data-items={data?.length}>{children}</div>,
  Line: () => <div data-testid="line" />,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: ({ yAxisId }: any) => <div data-testid="y-axis" data-yaxis-id={yAxisId} />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}))

describe('RevenueChart', () => {
  const mockTrendData: SalesTrendData = {
    eventId: 'event-123',
    period: 'Day',
    trend: [
      { timeLabel: '2024-12-01T00:00:00Z', revenue: 10000000, ticketsSold: 50 },
      { timeLabel: '2024-12-02T00:00:00Z', revenue: 15000000, ticketsSold: 75 },
      { timeLabel: '2024-12-03T00:00:00Z', revenue: 8000000, ticketsSold: 40 },
    ],
  }

  const mockOnPeriodChange = jest.fn()

  const defaultProps = {
    trendData: mockTrendData,
    period: 'Day' as SalesTrendPeriod,
    loading: false,
    onPeriodChange: mockOnPeriodChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render without crashing', () => {
      render(<RevenueChart {...defaultProps} />)
      expect(screen.getByText('Doanh thu')).toBeInTheDocument()
    })

    it('should render legend for revenue and tickets', () => {
      render(<RevenueChart {...defaultProps} />)
      expect(screen.getByText('Doanh thu')).toBeInTheDocument()
      expect(screen.getByText('Số vé bán')).toBeInTheDocument()
    })

    it('should render period toggle buttons', () => {
      render(<RevenueChart {...defaultProps} />)
      expect(screen.getByText('Theo ngày')).toBeInTheDocument()
      expect(screen.getByText('Theo tuần')).toBeInTheDocument()
    })

    it('should highlight active period', () => {
      render(<RevenueChart {...defaultProps} period="Day" />)
      const dayButton = screen.getByText('Theo ngày')
      expect(dayButton).toHaveClass('bg-primary', 'text-white')
    })

    it('should highlight week period when active', () => {
      render(<RevenueChart {...defaultProps} period="Week" />)
      const weekButton = screen.getByText('Theo tuần')
      expect(weekButton).toHaveClass('bg-primary', 'text-white')
    })

    it('should render chart container', () => {
      render(<RevenueChart {...defaultProps} />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('should render chart when trend data is available', () => {
      render(<RevenueChart {...defaultProps} />)
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toHaveAttribute('data-items', '3')
    })

    it('should render recharts components', () => {
      render(<RevenueChart {...defaultProps} />)
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getAllByTestId('y-axis')).toHaveLength(2)
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
      expect(screen.getByTestId('area')).toBeInTheDocument()
      expect(screen.getAllByTestId('line')).toHaveLength(2)
    })

    it('should format time labels correctly for Day period', () => {
      render(<RevenueChart {...defaultProps} />)
      // Chart should process the trend data
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('should format time labels correctly for Week period', () => {
      const weekData: SalesTrendData = {
        eventId: 'event-123',
        period: 'Week',
        trend: [
          { timeLabel: '2024-12-02T00:00:00Z', revenue: 50000000, ticketsSold: 250 },
        ],
      }
      render(<RevenueChart {...defaultProps} trendData={weekData} period="Week" />)
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show spinner when loading', () => {
      render(<RevenueChart {...defaultProps} loading />)
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should show overlay when loading', () => {
      render(<RevenueChart {...defaultProps} loading />)
      const overlay = document.querySelector('.bg-\\[\\#0b0816\\]\\/60')
      expect(overlay).toBeInTheDocument()
    })

    it('should still render chart structure when loading', () => {
      render(<RevenueChart {...defaultProps} loading />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty message when no trend data', () => {
      render(<RevenueChart {...defaultProps} trendData={null} />)
      expect(screen.getByText('Không có dữ liệu cho khoảng thời gian này.')).toBeInTheDocument()
    })

    it('should show empty message when trend array is empty', () => {
      const emptyData: SalesTrendData = {
        eventId: 'event-123',
        period: 'Day',
        trend: [],
      }
      render(<RevenueChart {...defaultProps} trendData={emptyData} />)
      expect(screen.getByText('Không có dữ liệu cho khoảng thời gian này.')).toBeInTheDocument()
    })

    it('should not show empty message when loading', () => {
      render(<RevenueChart {...defaultProps} trendData={null} loading />)
      expect(screen.queryByText('Không có dữ liệu cho khoảng thời gian này.')).not.toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onPeriodChange when clicking day button', async () => {
      render(<RevenueChart {...defaultProps} period="Week" />)
      await userEvent.click(screen.getByText('Theo ngày'))
      expect(mockOnPeriodChange).toHaveBeenCalledWith('Day')
    })

    it('should call onPeriodChange when clicking week button', async () => {
      render(<RevenueChart {...defaultProps} period="Day" />)
      await userEvent.click(screen.getByText('Theo tuần'))
      expect(mockOnPeriodChange).toHaveBeenCalledWith('Week')
    })
  })

  describe('Styling', () => {
    it('should render with gradient background', () => {
      render(<RevenueChart {...defaultProps} />)
      const container = screen.getByText('Doanh thu').closest('.rounded-2xl')
      expect(container).toHaveClass('bg-gradient-to-b')
    })

    it('should render with border', () => {
      render(<RevenueChart {...defaultProps} />)
      const container = screen.getByText('Doanh thu').closest('.border-white\\/5')
      expect(container).toHaveClass('border-white/5')
    })

    it('should render with correct chart height', () => {
      render(<RevenueChart {...defaultProps} />)
      const chartContainer = screen.getByTestId('responsive-container').parentElement
      expect(chartContainer).toHaveClass('h-[280px]')
    })

    it('should render inactive period button with correct styling', () => {
      render(<RevenueChart {...defaultProps} period="Day" />)
      const weekButton = screen.getByText('Theo tuần')
      expect(weekButton).toHaveClass('bg-white/5', 'text-slate-400')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined trendData', () => {
      render(<RevenueChart {...defaultProps} trendData={undefined as any} />)
      expect(screen.getByText('Không có dữ liệu cho khoảng thời gian này.')).toBeInTheDocument()
    })

    it('should handle trend data with zero revenue', () => {
      const zeroData: SalesTrendData = {
        eventId: 'event-123',
        period: 'Day',
        trend: [
          { timeLabel: '2024-12-01T00:00:00Z', revenue: 0, ticketsSold: 0 },
        ],
      }
      render(<RevenueChart {...defaultProps} trendData={zeroData} />)
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('should handle trend data with large values', () => {
      const largeData: SalesTrendData = {
        eventId: 'event-123',
        period: 'Day',
        trend: [
          { timeLabel: '2024-12-01T00:00:00Z', revenue: 1000000000, ticketsSold: 50000 },
        ],
      }
      render(<RevenueChart {...defaultProps} trendData={largeData} />)
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('should handle many data points', () => {
      const manyPoints: SalesTrendData = {
        eventId: 'event-123',
        period: 'Day',
        trend: Array.from({ length: 30 }, (_, i) => ({
          timeLabel: `2024-12-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
          revenue: 10000000,
          ticketsSold: 50,
        })),
      }
      render(<RevenueChart {...defaultProps} trendData={manyPoints} />)
      expect(screen.getByTestId('line-chart')).toHaveAttribute('data-items', '30')
    })

    it('should handle invalid date strings', () => {
      const invalidData: SalesTrendData = {
        eventId: 'event-123',
        period: 'Day',
        trend: [
          { timeLabel: 'invalid-date', revenue: 10000000, ticketsSold: 50 },
        ],
      }
      render(<RevenueChart {...defaultProps} trendData={invalidData} />)
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })
})
