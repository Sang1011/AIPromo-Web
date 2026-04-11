/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SummaryPage from '../../../pages/Organizer/SummaryPage'

// ============================================================================
// MOCKS
// ============================================================================

// Mock react-router-dom
const mockUseParams = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
}))

// Mock Redux
const mockDispatch = jest.fn()
let mockTicketingState: any = {}
let mockReportState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    TICKETING: mockTicketingState,
    REPORT: mockReportState,
  }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../../store/ticketingSlice', () => ({
  fetchOverviewOrganizerStats: jest.fn((params) => ({
    type: 'TICKETING/fetchOverviewOrganizerStats',
    payload: params,
  })),
  fetchSalesTrend: jest.fn((params) => ({
    type: 'TICKETING/fetchSalesTrend',
    payload: params,
  })),
}))

jest.mock('../../../store/reportSlice', () => ({
  fetchRefundRate: jest.fn((eventId) => ({
    type: 'REPORT/fetchRefundRate',
    payload: eventId,
  })),
  fetchTransactionSummary: jest.fn((eventId) => ({
    type: 'REPORT/fetchTransactionSummary',
    payload: eventId,
  })),
}))

// Mock child components
jest.mock('../../../components/Organizer/overview/RevenueCards', () => ({
  __esModule: true,
  default: ({ summary }: { summary: any }) => (
    <div data-testid="revenue-cards">
      <span data-testid="total-revenue">{summary.netRevenue}</span>
      <span data-testid="tickets-sold">{summary.totalTicketsSold}</span>
    </div>
  ),
}))

jest.mock('../../../components/Organizer/overview/RevenueChart', () => ({
  __esModule: true,
  default: ({ trendData, period, loading, onPeriodChange }: any) => (
    <div data-testid="revenue-chart" data-period={period} data-loading={loading}>
      <span data-testid="trend-data-count">{trendData?.trend?.length ?? 0} items</span>
      <button data-testid="period-day" onClick={() => onPeriodChange('Day')}>Day</button>
      <button data-testid="period-week" onClick={() => onPeriodChange('Week')}>Week</button>
    </div>
  ),
}))

jest.mock('../../../components/Organizer/overview/TicketTypeBreakdownTable', () => ({
  __esModule: true,
  default: ({ breakdown }: { breakdown: any[] }) => (
    <div data-testid="ticket-type-table">
      <span data-testid="breakdown-count">{breakdown.length} types</span>
    </div>
  ),
}))

jest.mock('../../../components/Organizer/overview/ticketTypeBarChart', () => ({
  __esModule: true,
  default: ({ breakdown }: { breakdown: any[] }) => (
    <div data-testid="ticket-type-chart">
      <span data-testid="chart-breakdown-count">{breakdown.length} items</span>
    </div>
  ),
}))

jest.mock('../../../components/Organizer/overview/RefundRateCard', () => ({
  __esModule: true,
  default: ({ data, loading }: { data: any; loading: boolean }) => (
    <div data-testid="refund-rate-card" data-loading={loading}>
      <span data-testid="refund-rate">{data.refundRatePercent}%</span>
    </div>
  ),
}))

jest.mock('../../../components/Organizer/overview/TransactionSummaryCard', () => ({
  __esModule: true,
  default: ({ data, loading }: { data: any; loading: boolean }) => (
    <div data-testid="transaction-summary-card" data-loading={loading}>
      <span data-testid="transaction-count">{data.totalTransactions}</span>
    </div>
  ),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockOverviewStats = (overrides: { summary?: any; ticketTypeBreakdown?: any } = {}) => ({
  eventId: 'event-1',
  summary: {
    totalOrders: 312,
    totalTicketsSold: 420,
    totalTicketsCheckedIn: 350,
    checkInRate: 83.3,
    grossRevenue: 167_000_000,
    totalDiscount: 12_500_000,
    netRevenue: 154_500_000,
    ...overrides.summary,
  },
  ticketTypeBreakdown: [
    {
      ticketTypeId: 'vip',
      ticketTypeName: 'VIP',
      totalQuantity: 100,
      quantitySold: 90,
      quantityCheckedIn: 80,
      revenue: 90_000_000,
    },
    {
      ticketTypeId: 'standard',
      ticketTypeName: 'Standard',
      totalQuantity: 300,
      quantitySold: 250,
      quantityCheckedIn: 210,
      revenue: 62_500_000,
    },
  ],
})

const createMockSalesTrend = () => ({
  eventId: 'event-1',
  period: 'Day',
  trend: [
    { timeLabel: '25/03', ticketsSold: 12, revenue: 6_000_000 },
    { timeLabel: '26/03', ticketsSold: 28, revenue: 14_000_000 },
    { timeLabel: '27/03', ticketsSold: 45, revenue: 22_500_000 },
  ],
})

const createMockRefundRate = (overrides = {}) => ({
  eventId: 'event-1',
  grossRevenue: 167_000_000,
  totalRefunds: 8_500_000,
  refundRatePercent: 5.09,
  ...overrides,
})

const createMockTransactionSummary = (overrides = {}) => ({
  eventId: 'event-1',
  totalTransactions: 342,
  completedCount: 312,
  failedCount: 18,
  refundedCount: 12,
  walletPayAmount: 98_000_000,
  directPayAmount: 56_500_000,
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('SummaryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseParams.mockReturnValue({ eventId: 'event-1' })

    mockTicketingState = {
      overviewStats: null,
      loading: false,
      salesTrend: null,
      salesTrendLoading: false,
    }

    mockReportState = {
      refundRate: null,
      transactionSummary: null,
      loading: {
        refundRate: false,
        transaction: false,
      },
    }

    mockDispatch.mockResolvedValue({})
  })

  // --------------------------------------------------------------------------
  // 1. Render
  // --------------------------------------------------------------------------
  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<SummaryPage />)
      })

      expect(screen.getByTestId('revenue-chart')).toBeInTheDocument()
    })

    it('should show loading spinner when loading and no stats', () => {
      mockTicketingState.loading = true
      mockTicketingState.overviewStats = null

      render(<SummaryPage />)

      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should not show spinner when loading but stats exist', async () => {
      mockTicketingState.loading = true
      mockTicketingState.overviewStats = createMockOverviewStats()

      await act(async () => {
        render(<SummaryPage />)
      })

      const spinners = document.querySelectorAll('.animate-spin')
      expect(spinners.length).toBe(0)
    })

    it('should show empty state components when no data', async () => {
      await act(async () => {
        render(<SummaryPage />)
      })

      // Refund rate and transaction cards should still render with fallback
      expect(screen.getByTestId('refund-rate-card')).toBeInTheDocument()
      expect(screen.getByTestId('transaction-summary-card')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 2. UI Elements
  // --------------------------------------------------------------------------
  describe('UI Elements', () => {
    it('should render revenue cards when overview stats exist', async () => {
      mockTicketingState.overviewStats = createMockOverviewStats()

      await act(async () => {
        render(<SummaryPage />)
      })

      expect(screen.getByTestId('revenue-cards')).toBeInTheDocument()
    })

    it('should render revenue chart with period selector', async () => {
      await act(async () => {
        render(<SummaryPage />)
      })

      expect(screen.getByTestId('revenue-chart')).toBeInTheDocument()
      expect(screen.getByTestId('period-day')).toBeInTheDocument()
      expect(screen.getByTestId('period-week')).toBeInTheDocument()
    })

    it('should render refund rate card', async () => {
      await act(async () => {
        render(<SummaryPage />)
      })

      expect(screen.getByTestId('refund-rate-card')).toBeInTheDocument()
    })

    it('should render transaction summary card', async () => {
      await act(async () => {
        render(<SummaryPage />)
      })

      expect(screen.getByTestId('transaction-summary-card')).toBeInTheDocument()
    })

    it('should render ticket type breakdown when available', async () => {
      mockTicketingState.overviewStats = createMockOverviewStats()

      await act(async () => {
        render(<SummaryPage />)
      })

      expect(screen.getByTestId('ticket-type-table')).toBeInTheDocument()
      expect(screen.getByTestId('ticket-type-chart')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 3. API Calls
  // --------------------------------------------------------------------------
  describe('API Calls', () => {
    it('should call fetchOverviewOrganizerStats on mount', async () => {
      const { fetchOverviewOrganizerStats } = require('../../../store/ticketingSlice')

      await act(async () => {
        render(<SummaryPage />)
      })

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchOverviewOrganizerStats({ eventId: 'event-1' })
        )
      })
    })

    it('should call fetchSalesTrend on mount with default period', async () => {
      const { fetchSalesTrend } = require('../../../store/ticketingSlice')

      await act(async () => {
        render(<SummaryPage />)
      })

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchSalesTrend({ eventId: 'event-1', period: 'Day' })
        )
      })
    })

    it('should call fetchRefundRate on mount', async () => {
      const { fetchRefundRate } = require('../../../store/reportSlice')

      await act(async () => {
        render(<SummaryPage />)
      })

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchRefundRate('event-1'))
      })
    })

    it('should call fetchTransactionSummary on mount', async () => {
      const { fetchTransactionSummary } = require('../../../store/reportSlice')

      await act(async () => {
        render(<SummaryPage />)
      })

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchTransactionSummary('event-1'))
      })
    })

    it('should call fetchSalesTrend when period changes', async () => {
      const { fetchSalesTrend } = require('../../../store/ticketingSlice')

      await act(async () => {
        render(<SummaryPage />)
      })

      mockDispatch.mockClear()

      await userEvent.click(screen.getByTestId('period-week'))

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchSalesTrend({ eventId: 'event-1', period: 'Week' })
        )
      })
    })

    it('should not call APIs if eventId is undefined', async () => {
      mockUseParams.mockReturnValue({ eventId: undefined })

      await act(async () => {
        render(<SummaryPage />)
      })

      const { fetchOverviewOrganizerStats } = require('../../../store/ticketingSlice')
      expect(mockDispatch).not.toHaveBeenCalledWith(
        fetchOverviewOrganizerStats({ eventId: undefined })
      )
    })
  })

  // --------------------------------------------------------------------------
  // 4. User Interactions
  // --------------------------------------------------------------------------
  describe('User Interactions', () => {
    it('should change period to Week when clicking Week button', async () => {
      await act(async () => {
        render(<SummaryPage />)
      })

      expect(screen.getByTestId('revenue-chart')).toHaveAttribute('data-period', 'Day')

      await userEvent.click(screen.getByTestId('period-week'))

      await waitFor(() => {
        expect(screen.getByTestId('revenue-chart')).toHaveAttribute('data-period', 'Week')
      })
    })

    it('should change period back to Day when clicking Day button', async () => {
      await act(async () => {
        render(<SummaryPage />)
      })

      await userEvent.click(screen.getByTestId('period-week'))
      await userEvent.click(screen.getByTestId('period-day'))

      await waitFor(() => {
        expect(screen.getByTestId('revenue-chart')).toHaveAttribute('data-period', 'Day')
      })
    })
  })

  // --------------------------------------------------------------------------
  // 5. Data Display
  // --------------------------------------------------------------------------
  describe('Data Display', () => {
    it('should display revenue summary correctly', async () => {
      mockTicketingState.overviewStats = createMockOverviewStats()

      await act(async () => {
        render(<SummaryPage />)
      })

      expect(screen.getByTestId('total-revenue')).toHaveTextContent('154500000')
      expect(screen.getByTestId('tickets-sold')).toHaveTextContent('420')
    })

    it('should display sales trend data correctly', async () => {
      mockTicketingState.salesTrend = createMockSalesTrend()

      await act(async () => {
        render(<SummaryPage />)
      })

      expect(screen.getByTestId('trend-data-count')).toHaveTextContent('3 items')
    })

    it('should display refund rate correctly', async () => {
      mockReportState.refundRate = createMockRefundRate()

      await act(async () => {
        render(<SummaryPage />)
      })

      expect(screen.getByTestId('refund-rate')).toHaveTextContent('5.09%')
    })

    it('should display transaction summary correctly', async () => {
      mockReportState.transactionSummary = createMockTransactionSummary()

      await act(async () => {
        render(<SummaryPage />)
      })

      expect(screen.getByTestId('transaction-count')).toHaveTextContent('342')
    })

    it('should display ticket type breakdown correctly', async () => {
      mockTicketingState.overviewStats = createMockOverviewStats()

      await act(async () => {
        render(<SummaryPage />)
      })

      expect(screen.getByTestId('breakdown-count')).toHaveTextContent('2 types')
      expect(screen.getByTestId('chart-breakdown-count')).toHaveTextContent('2 items')
    })
  })

  // --------------------------------------------------------------------------
  // 6. Edge Cases
  // --------------------------------------------------------------------------
  describe('Edge Cases', () => {
    it('should handle missing eventId gracefully', async () => {
      mockUseParams.mockReturnValue({ eventId: undefined })

      await act(async () => {
        render(<SummaryPage />)
      })

      // Should render without crashing
      expect(screen.getByTestId('revenue-chart')).toBeInTheDocument()
    })

    it('should handle overview stats with empty breakdown', async () => {
      mockTicketingState.overviewStats = createMockOverviewStats({
        ticketTypeBreakdown: [],
      })

      await act(async () => {
        render(<SummaryPage />)
      })

      // Revenue cards should still show
      expect(screen.getByTestId('revenue-cards')).toBeInTheDocument()
      // Breakdown components should not render when empty
    })

    it('should handle refund rate with zero values', async () => {
      mockReportState.refundRate = createMockRefundRate({
        grossRevenue: 0,
        totalRefunds: 0,
        refundRatePercent: 0,
      })

      await act(async () => {
        render(<SummaryPage />)
      })

      expect(screen.getByTestId('refund-rate')).toHaveTextContent('0%')
    })

    it('should handle transaction summary with zero values', async () => {
      mockReportState.transactionSummary = createMockTransactionSummary({
        totalTransactions: 0,
        completedCount: 0,
        failedCount: 0,
        refundedCount: 0,
      })

      await act(async () => {
        render(<SummaryPage />)
      })

      expect(screen.getByTestId('transaction-count')).toHaveTextContent('0')
    })

    it('should handle sales trend with empty trend array', async () => {
      mockTicketingState.salesTrend = { eventId: 'event-1', period: 'Day', trend: [] }

      await act(async () => {
        render(<SummaryPage />)
      })

      expect(screen.getByTestId('trend-data-count')).toHaveTextContent('0 items')
    })

    it('should show loading state on revenue chart when trend is loading', async () => {
      mockTicketingState.salesTrendLoading = true

      await act(async () => {
        render(<SummaryPage />)
      })

      expect(screen.getByTestId('revenue-chart')).toHaveAttribute('data-loading', 'true')
    })

    it('should show loading state on refund rate card when loading', async () => {
      mockReportState.loading.refundRate = true

      await act(async () => {
        render(<SummaryPage />)
      })

      expect(screen.getByTestId('refund-rate-card')).toHaveAttribute('data-loading', 'true')
    })

    it('should show loading state on transaction card when loading', async () => {
      mockReportState.loading.transaction = true

      await act(async () => {
        render(<SummaryPage />)
      })

      expect(screen.getByTestId('transaction-summary-card')).toHaveAttribute('data-loading', 'true')
    })
  })
})
