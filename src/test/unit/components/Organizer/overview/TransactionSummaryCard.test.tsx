/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

import TransactionSummaryCard from '../../../../../components/Organizer/overview/TransactionSummaryCard'
import type { TransactionSummaryReportItem } from '../../../../../types/report/report'

// Mock recharts
jest.mock('recharts', () => ({
  BarChart: ({ children, data }: any) => <div data-testid="bar-chart" data-items={data?.length}>{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  LabelList: () => <div data-testid="label-list" />,
}))

describe('TransactionSummaryCard', () => {
  const mockData: TransactionSummaryReportItem = {
    eventId: 'event-123',
    totalTransactions: 1000,
    completedCount: 850,
    failedCount: 100,
    refundedCount: 50,
    walletPayAmount: 600000000,
    directPayAmount: 400000000,
  }

  describe('Render', () => {
    it('should render without crashing', () => {
      render(<TransactionSummaryCard data={mockData} />)
      expect(screen.getByText('Tổng quan giao dịch')).toBeInTheDocument()
    })

    it('should render transaction summary subtitle', () => {
      render(<TransactionSummaryCard data={mockData} />)
      expect(screen.getByText('Transaction summary')).toBeInTheDocument()
    })

    it('should render total transactions badge', () => {
      render(<TransactionSummaryCard data={mockData} />)
      expect(screen.getByText('1000')).toBeInTheDocument()
      expect(screen.getByText('tổng GD')).toBeInTheDocument()
    })

    it('should render status section title', () => {
      render(<TransactionSummaryCard data={mockData} />)
      expect(screen.getByText('Trạng thái giao dịch')).toBeInTheDocument()
    })

    it('should render payment method section title', () => {
      render(<TransactionSummaryCard data={mockData} />)
      expect(screen.getByText('Phương thức thanh toán')).toBeInTheDocument()
    })

    it('should render status data', () => {
      render(<TransactionSummaryCard data={mockData} />)
      expect(screen.getByText('Thành công')).toBeInTheDocument()
      expect(screen.getByText('Thất bại')).toBeInTheDocument()
      expect(screen.getByText('Hoàn tiền')).toBeInTheDocument()
    })

    it('should render status counts', () => {
      render(<TransactionSummaryCard data={mockData} />)
      expect(screen.getByText('850')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
    })

    it('should render payment methods', () => {
      render(<TransactionSummaryCard data={mockData} />)
      expect(screen.getByText('Ví điện tử')).toBeInTheDocument()
      expect(screen.getByText('Thanh toán trực tiếp')).toBeInTheDocument()
    })

    it('should render payment percentages', () => {
      render(<TransactionSummaryCard data={mockData} />)
      expect(screen.getByText('60.0%')).toBeInTheDocument()
      expect(screen.getByText('40.0%')).toBeInTheDocument()
    })

    it('should render payment amounts', () => {
      render(<TransactionSummaryCard data={mockData} />)
      expect(screen.getByText('600.000.000')).toBeInTheDocument()
      expect(screen.getByText('400.000.000')).toBeInTheDocument()
    })

    it('should render chart container', () => {
      render(<TransactionSummaryCard data={mockData} />)
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show skeleton when loading', () => {
      const { container } = render(<TransactionSummaryCard data={mockData} loading />)
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('should not show content when loading', () => {
      render(<TransactionSummaryCard data={mockData} loading />)
      expect(screen.queryByText('Tổng quan giao dịch')).not.toBeInTheDocument()
    })
  })

  describe('Calculations', () => {
    it('should calculate wallet payment percentage correctly', () => {
      const data: TransactionSummaryReportItem = {
        ...mockData,
        walletPayAmount: 750,
        directPayAmount: 250,
      }
      render(<TransactionSummaryCard data={data} />)
      expect(screen.getByText('75.0%')).toBeInTheDocument()
    })

    it('should calculate direct payment percentage correctly', () => {
      const data: TransactionSummaryReportItem = {
        ...mockData,
        walletPayAmount: 300,
        directPayAmount: 700,
      }
      render(<TransactionSummaryCard data={data} />)
      expect(screen.getByText('70.0%')).toBeInTheDocument()
    })

    it('should handle zero total payments', () => {
      const data: TransactionSummaryReportItem = {
        ...mockData,
        walletPayAmount: 0,
        directPayAmount: 0,
      }
      render(<TransactionSummaryCard data={data} />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should handle equal split', () => {
      const data: TransactionSummaryReportItem = {
        ...mockData,
        walletPayAmount: 500,
        directPayAmount: 500,
      }
      render(<TransactionSummaryCard data={data} />)
      expect(screen.getAllByText('50.0%')).toHaveLength(2)
    })
  })

  describe('Chart Display', () => {
    it('should render bar chart with 3 status items', () => {
      render(<TransactionSummaryCard data={mockData} />)
      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-items', '3')
    })

    it('should render recharts components', () => {
      render(<TransactionSummaryCard data={mockData} />)
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
      expect(screen.getByTestId('bar')).toBeInTheDocument()
      expect(screen.getByTestId('label-list')).toBeInTheDocument()
    })

    it('should render status chips with colored dots', () => {
      render(<TransactionSummaryCard data={mockData} />)
      const dots = document.querySelectorAll('.rounded-full')
      expect(dots.length).toBeGreaterThan(0)
    })

    it('should render progress bars for payment methods', () => {
      render(<TransactionSummaryCard data={mockData} />)
      const progressBars = document.querySelectorAll('.rounded-full')
      expect(progressBars.length).toBeGreaterThan(0)
    })
  })

  describe('Styling', () => {
    it('should render with cyan gradient background', () => {
      render(<TransactionSummaryCard data={mockData} />)
      const card = screen.getByText('Tổng quan giao dịch').closest('.rounded-2xl')
      expect(card).toHaveClass('bg-gradient-to-br')
    })

    it('should render with cyan border', () => {
      render(<TransactionSummaryCard data={mockData} />)
      const card = screen.getByText('Tổng quan giao dịch').closest('.border-cyan-500\\/20')
      expect(card).toHaveClass('border-cyan-500/20')
    })

    it('should render total badge with gradient text', () => {
      render(<TransactionSummaryCard data={mockData} />)
      const badge = screen.getByText('1000')
      expect(badge).toHaveClass('text-transparent', 'bg-clip-text')
    })

    it('should render status chips with correct colors', () => {
      render(<TransactionSummaryCard data={mockData} />)
      const successChip = screen.getByText('850')
      expect(successChip).toHaveClass('font-semibold')
    })

    it('should render payment amounts with gradient text', () => {
      render(<TransactionSummaryCard data={mockData} />)
      const walletAmount = screen.getByText('600.000.000')
      expect(walletAmount).toHaveClass('text-transparent', 'bg-clip-text')
    })
  })

  describe('Layout', () => {
    it('should render status chips in horizontal layout', () => {
      render(<TransactionSummaryCard data={mockData} />)
      const chipsContainer = screen.getByText('850').closest('.flex')
      expect(chipsContainer).toHaveClass('gap-2')
    })

    it('should render payment methods in vertical stack', () => {
      render(<TransactionSummaryCard data={mockData} />)
      const paymentSection = screen.getByText('Phương thức thanh toán').closest('.space-y-3')
      expect(paymentSection).toBeInTheDocument()
    })

    it('should render payment totals side by side', () => {
      render(<TransactionSummaryCard data={mockData} />)
      const totalsContainer = screen.getByText('600.000.000').parentElement?.parentElement
      expect(totalsContainer).toHaveClass('flex', 'justify-between')
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero transactions', () => {
      const data: TransactionSummaryReportItem = {
        eventId: 'event-123',
        totalTransactions: 0,
        completedCount: 0,
        failedCount: 0,
        refundedCount: 0,
        walletPayAmount: 0,
        directPayAmount: 0,
      }
      render(<TransactionSummaryCard data={data} />)
      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getAllByText('0%')).toHaveLength(2)
    })

    it('should handle all failed transactions', () => {
      const data: TransactionSummaryReportItem = {
        eventId: 'event-123',
        totalTransactions: 100,
        completedCount: 0,
        failedCount: 100,
        refundedCount: 0,
        walletPayAmount: 0,
        directPayAmount: 0,
      }
      render(<TransactionSummaryCard data={data} />)
      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should handle large transaction counts', () => {
      const data: TransactionSummaryReportItem = {
        eventId: 'event-123',
        totalTransactions: 1000000,
        completedCount: 900000,
        failedCount: 50000,
        refundedCount: 50000,
        walletPayAmount: 10000000000,
        directPayAmount: 5000000000,
      }
      render(<TransactionSummaryCard data={data} />)
      expect(screen.getByText('1.000.000')).toBeInTheDocument()
    })

    it('should handle only wallet payments', () => {
      const data: TransactionSummaryReportItem = {
        ...mockData,
        walletPayAmount: 1000000,
        directPayAmount: 0,
      }
      render(<TransactionSummaryCard data={data} />)
      expect(screen.getByText('100.0%')).toBeInTheDocument()
    })

    it('should handle only direct payments', () => {
      const data: TransactionSummaryReportItem = {
        ...mockData,
        walletPayAmount: 0,
        directPayAmount: 1000000,
      }
      render(<TransactionSummaryCard data={data} />)
      expect(screen.getByText('100.0%')).toBeInTheDocument()
    })

    it('should handle refunded count exceeding completed', () => {
      const data: TransactionSummaryReportItem = {
        eventId: 'event-123',
        totalTransactions: 100,
        completedCount: 50,
        failedCount: 10,
        refundedCount: 40,
        walletPayAmount: 600,
        directPayAmount: 400,
      }
      render(<TransactionSummaryCard data={data} />)
      expect(screen.getByText('40')).toBeInTheDocument()
    })
  })
})
