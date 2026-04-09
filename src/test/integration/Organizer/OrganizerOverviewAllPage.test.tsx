/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import OrganizerOverviewAllPage from '../../../pages/Organizer/OrganizerOverviewAllPage'

// ============================================================================
// MOCKS
// ============================================================================

// Mock recharts
jest.mock('recharts', () => ({
  AreaChart: ({ children, data }: any) => <div data-testid="area-chart" data-items={data?.length}>{children}</div>,
  Area: () => <div data-testid="area" />,
  BarChart: ({ children, data }: any) => <div data-testid="bar-chart" data-items={data?.length}>{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Legend: () => <div data-testid="legend" />,
}))

const mockDispatch = jest.fn()
let mockOrganizerState: any = {}
let mockReportState: any = {}
let mockTicketingState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    ORGANIZER_PROFILE: mockOrganizerState,
    REPORT: mockReportState,
    TICKETING: mockTicketingState,
  }),
  useDispatch: () => mockDispatch,
}))

jest.mock('../../../store/organizerProfileSlice', () => ({
  fetchOrganizerProfile: jest.fn(() => ({ type: 'ORGANIZER/fetchProfile' })),
}))

jest.mock('../../../store/reportSlice', () => ({
  fetchRevenueSummaryOrganizer: jest.fn(() => ({ type: 'REPORT/fetchSummary' })),
  fetchRevenueBreakdownOrganizer: jest.fn(() => ({ type: 'REPORT/fetchBreakdown' })),
}))

jest.mock('../../../store/ticketingSlice', () => ({
  fetchAllEventSalesTrend: jest.fn(() => ({ type: 'TICKETING/fetchTrend' })),
}))

jest.mock('../../../utils/fmtMoneyVND', () => ({
  fmtMoneyVND: (n: number | undefined) => n != null ? n.toLocaleString('vi-VN') : '0',
}))

// ============================================================================
// TESTS
// ============================================================================

describe('OrganizerOverviewAllPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockOrganizerState = {
      profile: { userId: 'user-123' },
    }

    mockReportState = {
      revenueSummaryOrganizer: {
        grossRevenue: 150000000,
        netRevenue: 135000000,
        totalDiscount: 15000000,
        totalRefunds: 5000000,
        refundRate: 3.33,
        eventCount: 5,
        completedEventCount: 3,
        activeEventCount: 2,
      },
      revenueBreakdownOrganizer: [
        { eventName: 'Event 1', grossRevenue: 50000000, netRevenue: 45000000, refundRate: 5.0 },
        { eventName: 'Event 2', grossRevenue: 100000000, netRevenue: 90000000, refundRate: 2.0 },
      ],
      loading: {
        organizerSummary: false,
        organizerBreakdown: false,
      },
    }

    mockTicketingState = {
      allEventSalesTrend: {
        events: [
          { title: 'Event 1', salesTrend: [{ time: '2024-12-01', netRevenue: 50000 }] },
        ],
      },
      allEventSalesTrendLoading: false,
    }

    mockDispatch.mockResolvedValue({})
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => render(<OrganizerOverviewAllPage />))
      expect(screen.getByText('Tổng quan tất cả sự kiện')).toBeInTheDocument()
    })

    it('should render metric cards', async () => {
      await act(async () => render(<OrganizerOverviewAllPage />))
      expect(screen.getByText('Tổng doanh thu gộp')).toBeInTheDocument()
      expect(screen.getByText('Doanh thu ròng', { selector: 'p.text-sm' })).toBeInTheDocument()
      expect(screen.getByText('Số sự kiện')).toBeInTheDocument()
      expect(screen.getByText('Tổng hoàn vé')).toBeInTheDocument()
    })

    it('should render chart sections', async () => {
      await act(async () => render(<OrganizerOverviewAllPage />))
      expect(screen.getByText('Doanh thu theo sự kiện')).toBeInTheDocument()
      expect(screen.getByText('Phân bổ doanh thu')).toBeInTheDocument()
    })

    it('should render trend period buttons', async () => {
      await act(async () => render(<OrganizerOverviewAllPage />))
      expect(screen.getByText('1 tháng')).toBeInTheDocument()
      expect(screen.getByText('3 tháng')).toBeInTheDocument()
      expect(screen.getByText('6 tháng')).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('should display formatted revenue values', async () => {
      await act(async () => render(<OrganizerOverviewAllPage />))
      expect(screen.getByText(/150\.000\.000 đồng/)).toBeInTheDocument()
    })

    it('should display event counts', async () => {
      await act(async () => render(<OrganizerOverviewAllPage />))
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should display refund rate', async () => {
      await act(async () => render(<OrganizerOverviewAllPage />))
      expect(screen.getByText(/3\.33% tỉ lệ hoàn/)).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should change trend period when clicking button', async () => {
      const { fetchAllEventSalesTrend } = require('../../../store/ticketingSlice')
      await act(async () => render(<OrganizerOverviewAllPage />))

      await userEvent.click(screen.getByText('6 tháng'))

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchAllEventSalesTrend(expect.any(Object)))
      })
    })
  })

  describe('API Calls', () => {
    it('should call fetchOrganizerProfile on mount', async () => {
      const { fetchOrganizerProfile } = require('../../../store/organizerProfileSlice')
      await act(async () => render(<OrganizerOverviewAllPage />))
      expect(mockDispatch).toHaveBeenCalledWith(fetchOrganizerProfile())
    })

    it('should call fetchRevenueSummaryOrganizer when profile is loaded', async () => {
      const { fetchRevenueSummaryOrganizer } = require('../../../store/reportSlice')
      await act(async () => render(<OrganizerOverviewAllPage />))
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchRevenueSummaryOrganizer('user-123'))
      })
    })

    it('should call fetchAllEventSalesTrend on mount', async () => {
      const { fetchAllEventSalesTrend } = require('../../../store/ticketingSlice')
      await act(async () => render(<OrganizerOverviewAllPage />))
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchAllEventSalesTrend(expect.any(Object)))
      })
    })
  })

  describe('Loading States', () => {
    it('should show skeleton when summary is loading', async () => {
      mockReportState.loading.organizerSummary = true
      await act(async () => render(<OrganizerOverviewAllPage />))
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should show skeleton when breakdown is loading', async () => {
      mockReportState.loading.organizerBreakdown = true
      await act(async () => render(<OrganizerOverviewAllPage />))
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should show skeleton when trend is loading', async () => {
      mockTicketingState.allEventSalesTrendLoading = true
      await act(async () => render(<OrganizerOverviewAllPage />))
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null profile', async () => {
      mockOrganizerState.profile = null
      const { container } = render(<OrganizerOverviewAllPage />)
      expect(container).toBeInTheDocument()
    })

    it('should handle empty revenue data', async () => {
      mockReportState.revenueSummaryOrganizer = {
        grossRevenue: 0,
        netRevenue: 0,
        totalDiscount: 0,
        totalRefunds: 0,
        refundRate: 0,
        eventCount: 0,
        completedEventCount: 0,
        activeEventCount: 0,
      }
      await act(async () => render(<OrganizerOverviewAllPage />))
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle empty breakdown array', async () => {
      mockReportState.revenueBreakdownOrganizer = []
      const { container } = render(<OrganizerOverviewAllPage />)
      expect(container).toBeInTheDocument()
    })

    it('should handle empty trend data', async () => {
      mockTicketingState.allEventSalesTrend = { events: [] }
      const { container } = render(<OrganizerOverviewAllPage />)
      expect(container).toBeInTheDocument()
    })

    it('should handle large revenue values', async () => {
      mockReportState.revenueSummaryOrganizer.grossRevenue = 10000000000
      await act(async () => render(<OrganizerOverviewAllPage />))
      expect(screen.getByText(/10\.000\.000\.000 đồng/)).toBeInTheDocument()
    })

    it('should handle high refund rate', async () => {
      mockReportState.revenueSummaryOrganizer.totalRefunds = 23250000
      mockReportState.revenueSummaryOrganizer.grossRevenue = 150000000
      await act(async () => render(<OrganizerOverviewAllPage />))
      expect(screen.getByText(/15\.50% tỉ lệ hoàn/)).toBeInTheDocument()
    })
  })
})
