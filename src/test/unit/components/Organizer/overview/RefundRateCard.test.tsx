/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

import RefundRateCard from '../../../../../components/Organizer/overview/RefundRateCard'
import type { RefundRateReportItem } from '../../../../../types/report/report'

// Mock recharts
jest.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}))

describe('RefundRateCard', () => {
  const createMockData = (overrides: Partial<RefundRateReportItem> = {}): RefundRateReportItem => ({
    eventId: 'event-123',
    grossRevenue: 100000000,
    totalRefunds: 5000000,
    refundRatePercent: 5.0,
    ...overrides,
  })

  describe('Render', () => {
    it('should render without crashing', () => {
      const data = createMockData()
      render(<RefundRateCard data={data} />)
      expect(screen.getByText('Phân tích hoàn tiền')).toBeInTheDocument()
    })

    it('should render refund analytics subtitle', () => {
      const data = createMockData()
      render(<RefundRateCard data={data} />)
      expect(screen.getByText('Refund analytics')).toBeInTheDocument()
    })

    it('should render refund rate percentage', () => {
      const data = createMockData()
      render(<RefundRateCard data={data} />)
      expect(screen.getByText('5.0%')).toBeInTheDocument()
    })

    it('should render "Tỉ lệ HT" label', () => {
      const data = createMockData()
      render(<RefundRateCard data={data} />)
      expect(screen.getByText('Tỉ lệ HT')).toBeInTheDocument()
    })

    it('should render gross revenue stat', () => {
      const data = createMockData()
      render(<RefundRateCard data={data} />)
      expect(screen.getByText('Doanh thu gộp')).toBeInTheDocument()
    })

    it('should render refunded amount stat', () => {
      const data = createMockData()
      render(<RefundRateCard data={data} />)
      expect(screen.getByText('Đã hoàn tiền')).toBeInTheDocument()
    })

    it('should render retained amount stat', () => {
      const data = createMockData()
      render(<RefundRateCard data={data} />)
      expect(screen.getByText('Còn lại')).toBeInTheDocument()
    })

    it('should render refund rate bar section', () => {
      const data = createMockData()
      render(<RefundRateCard data={data} />)
      expect(screen.getByText('Tỉ lệ hoàn tiền')).toBeInTheDocument()
    })

    it('should render formatted currency values', () => {
      const data = createMockData()
      render(<RefundRateCard data={data} />)
      expect(screen.getByText('100.000.000')).toBeInTheDocument()
      expect(screen.getByText('5.000.000')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show skeleton when loading', () => {
      const data = createMockData()
      const { container } = render(<RefundRateCard data={data} loading />)
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('should not show content when loading', () => {
      const data = createMockData()
      render(<RefundRateCard data={data} loading />)
      expect(screen.queryByText('Phân tích hoàn tiền')).not.toBeInTheDocument()
    })
  })

  describe('Calculations', () => {
    it('should calculate retained revenue correctly', () => {
      const data = createMockData({ grossRevenue: 100, totalRefunds: 30 })
      render(<RefundRateCard data={data} />)
      expect(screen.getByText('70')).toBeInTheDocument()
    })

    it('should handle zero refunds', () => {
      const data = createMockData({ totalRefunds: 0, refundRatePercent: 0 })
      render(<RefundRateCard data={data} />)
      expect(screen.getByText('0.0%')).toBeInTheDocument()
    })

    it('should handle 100% refund rate', () => {
      const data = createMockData({ refundRatePercent: 100 })
      render(<RefundRateCard data={data} />)
      expect(screen.getByText('100.0%')).toBeInTheDocument()
    })
  })

  describe('Progress Bar', () => {
    it('should cap percentage at 100%', () => {
      const data = createMockData({ refundRatePercent: 150 })
      render(<RefundRateCard data={data} />)
      const progressBar = document.querySelector('[style*="width: 100%"]')
      expect(progressBar).toBeInTheDocument()
    })

    it('should render correct percentage for normal values', () => {
      const data = createMockData({ refundRatePercent: 5.0 })
      render(<RefundRateCard data={data} />)
      expect(screen.getByText('5.00%')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should render with red gradient background', () => {
      const data = createMockData()
      render(<RefundRateCard data={data} />)
      const card = screen.getByText('Phân tích hoàn tiền').closest('.rounded-2xl')
      expect(card).toHaveClass('bg-gradient-to-br')
    })

    it('should render with border', () => {
      const data = createMockData()
      render(<RefundRateCard data={data} />)
      const card = screen.getByText('Phân tích hoàn tiền').closest('.border-red-500\\/20')
      expect(card).toBeInTheDocument()
    })

    it('should render donut chart with correct size', () => {
      const data = createMockData()
      render(<RefundRateCard data={data} />)
      const chartContainer = document.querySelector('[style*="width: 140"]')
      expect(chartContainer).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large revenue values', () => {
      const data = createMockData({ grossRevenue: 1000000000000 })
      const { container } = render(<RefundRateCard data={data} />)
      expect(container).toBeInTheDocument()
    })

    it('should handle negative refund rate', () => {
      const data = createMockData({ refundRatePercent: -5 })
      render(<RefundRateCard data={data} />)
      expect(screen.getByText('-5.0%')).toBeInTheDocument()
    })

    it('should handle zero gross revenue', () => {
      const data = createMockData({ grossRevenue: 0, totalRefunds: 0, refundRatePercent: 0 })
      render(<RefundRateCard data={data} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle refunds exceeding gross revenue', () => {
      const data = createMockData({ grossRevenue: 100, totalRefunds: 150, refundRatePercent: 150 })
      render(<RefundRateCard data={data} />)
      expect(screen.getByText('-50')).toBeInTheDocument()
    })
  })
})
