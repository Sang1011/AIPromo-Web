/// <reference types="jest" />
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import AnalyticsPage from '../../../pages/Organizer/AnalyticsPage'

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
let mockPostState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    POST: mockPostState,
  }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../../store/postSlice', () => ({
  fetchPosts: jest.fn((params) => ({ type: 'POST/fetchPosts', payload: params })),
}))

// Mock hooks
jest.mock('../../../hooks/useAnalyticsData', () => ({
  useAnalyticsData: jest.fn(() => ({
    postsWithMetrics: [],
    isLoading: false,
    refresh: jest.fn(),
  })),
}))

// Mock recharts (used by inline chart components in AnalyticsPage)
jest.mock('recharts', () => ({
  AreaChart: ({ children, data }: any) => <div data-testid="area-chart" data-items={data?.length}>{children}</div>,
  Area: () => <div data-testid="area" />,
  BarChart: ({ children, data }: any) => <div data-testid="bar-chart" data-items={data?.length}>{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Legend: () => <div data-testid="legend" />,
}))

// Mock child components (they are inline in AnalyticsPage, so no external mocks needed)
// The page defines SummaryKpis, ReachTrendChart, CtrPerPostChart, EngagementBreakdown, TopPostsTable inline

// ============================================================================
// TEST DATA
// ============================================================================

const createMockPostWithMetrics = (overrides: { post?: any; metrics?: any } = {}) => ({
  post: {
    id: 'post-1',
    title: 'Test Post',
    publishedAt: '2024-12-01T10:00:00Z',
    ...overrides.post,
  },
  metrics: {
    reach: 1000,
    clicks: 50,
    likes: 100,
    comments: 20,
    shares: 10,
    ...overrides.metrics,
  },
  distributionId: 'dist-1',
})

// ============================================================================
// TESTS
// ============================================================================

describe('AnalyticsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseParams.mockReturnValue({ eventId: 'event-1' })

    mockPostState = {
      posts: [],
      loading: false,
    }

    mockDispatch.mockResolvedValue({})
  })

  // --------------------------------------------------------------------------
  // 1. Render
  // --------------------------------------------------------------------------
  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<AnalyticsPage />)
      })

      expect(screen.getByText('Phân tích dữ liệu')).toBeInTheDocument()
    })

    it('should show loading state when data is loading', async () => {
      const { useAnalyticsData } = require('../../../hooks/useAnalyticsData')
      useAnalyticsData.mockReturnValue({
        postsWithMetrics: [],
        isLoading: true,
        refresh: jest.fn(),
      })

      render(<AnalyticsPage />)

      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should show empty state when no data available', async () => {
      const { useAnalyticsData } = require('../../../hooks/useAnalyticsData')
      useAnalyticsData.mockReturnValue({
        postsWithMetrics: [],
        isLoading: false,
        refresh: jest.fn(),
      })

      await act(async () => {
        render(<AnalyticsPage />)
      })

      expect(screen.getByText('Chưa có dữ liệu Facebook')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 2. UI Elements
  // --------------------------------------------------------------------------
  describe('UI Elements', () => {
    it('should render page title', async () => {
      await act(async () => {
        render(<AnalyticsPage />)
      })

      expect(screen.getByText('Phân tích dữ liệu')).toBeInTheDocument()
    })

    it('should render refresh button', async () => {
      await act(async () => {
        render(<AnalyticsPage />)
      })

      expect(screen.getByText('Làm mới')).toBeInTheDocument()
    })

    it('should render post count in subtitle', async () => {
      const { useAnalyticsData } = require('../../../hooks/useAnalyticsData')
      useAnalyticsData.mockReturnValue({
        postsWithMetrics: [createMockPostWithMetrics()],
        isLoading: false,
        refresh: jest.fn(),
      })

      await act(async () => {
        render(<AnalyticsPage />)
      })

      expect(screen.getByText(/1 bài đã phân tích/)).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 3. User Interactions
  // --------------------------------------------------------------------------
  describe('User Interactions', () => {
    it('should call refresh when clicking refresh button', async () => {
      const mockRefresh = jest.fn()
      const { useAnalyticsData } = require('../../../hooks/useAnalyticsData')
      useAnalyticsData.mockReturnValue({
        postsWithMetrics: [createMockPostWithMetrics()],
        isLoading: false,
        refresh: mockRefresh,
      })

      await act(async () => {
        render(<AnalyticsPage />)
      })

      const refreshButton = screen.getByText('Làm mới')
      await userEvent.click(refreshButton)

      expect(mockRefresh).toHaveBeenCalled()
    })

    it('should disable refresh button when loading', async () => {
      const { useAnalyticsData } = require('../../../hooks/useAnalyticsData')
      useAnalyticsData.mockReturnValue({
        postsWithMetrics: [],
        isLoading: true,
        refresh: jest.fn(),
      })

      await act(async () => {
        render(<AnalyticsPage />)
      })

      const refreshButton = screen.getByText('Làm mới')
      expect(refreshButton).toBeDisabled()
    })
  })

  // --------------------------------------------------------------------------
  // 4. Data Display
  // --------------------------------------------------------------------------
  describe('Data Display', () => {
    it('should display analytics components when data is available', async () => {
      const mockData = [
        createMockPostWithMetrics({ metrics: { reach: 1000, clicks: 50, likes: 100, comments: 20, shares: 10 } }),
        createMockPostWithMetrics({ metrics: { reach: 2000, clicks: 100, likes: 200, comments: 40, shares: 20 } }),
      ]

      const { useAnalyticsData } = require('../../../hooks/useAnalyticsData')
      useAnalyticsData.mockReturnValue({
        postsWithMetrics: mockData,
        isLoading: false,
        refresh: jest.fn(),
      })

      await act(async () => {
        render(<AnalyticsPage />)
      })

      expect(screen.getByText('Tổng Reach')).toBeInTheDocument()
      expect(screen.getByText('Reach theo bài đăng')).toBeInTheDocument()
      expect(screen.getByText('Clicks theo bài đăng')).toBeInTheDocument()
      expect(screen.getByText('Phân tích Engagement')).toBeInTheDocument()
      expect(screen.getByText('Top bài đăng theo Reach')).toBeInTheDocument()
    })

    it('should show correct post count in subtitle', async () => {
      const mockData = [
        createMockPostWithMetrics(),
        createMockPostWithMetrics(),
        createMockPostWithMetrics(),
      ]

      const { useAnalyticsData } = require('../../../hooks/useAnalyticsData')
      useAnalyticsData.mockReturnValue({
        postsWithMetrics: mockData,
        isLoading: false,
        refresh: jest.fn(),
      })

      await act(async () => {
        render(<AnalyticsPage />)
      })

      expect(screen.getByText(/3 bài đã phân tích/)).toBeInTheDocument()
    })

    it('should show top 5 posts in table', async () => {
      const mockData = Array(10).fill(null).map((_, i) =>
        createMockPostWithMetrics({
          post: { id: `post-${i}`, title: `Post ${i}` },
          metrics: { reach: 1000 * (i + 1) },
        })
      )

      const { useAnalyticsData } = require('../../../hooks/useAnalyticsData')
      useAnalyticsData.mockReturnValue({
        postsWithMetrics: mockData,
        isLoading: false,
        refresh: jest.fn(),
      })

      await act(async () => {
        render(<AnalyticsPage />)
      })

      expect(screen.getByText(/Top 5/)).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 5. Edge Cases
  // --------------------------------------------------------------------------
  describe('Edge Cases', () => {
    it('should handle posts with null publishedAt', async () => {
      const mockData = [
        createMockPostWithMetrics({ post: { publishedAt: null } }),
      ]

      const { useAnalyticsData } = require('../../../hooks/useAnalyticsData')
      useAnalyticsData.mockReturnValue({
        postsWithMetrics: mockData,
        isLoading: false,
        refresh: jest.fn(),
      })

      await act(async () => {
        render(<AnalyticsPage />)
      })

      expect(screen.getByText('Reach theo bài đăng')).toBeInTheDocument()
    })

    it('should handle posts with zero metrics', async () => {
      const mockData = [
        createMockPostWithMetrics({
          metrics: { reach: 0, clicks: 0, likes: 0, comments: 0, shares: 0 },
        }),
      ]

      const { useAnalyticsData } = require('../../../hooks/useAnalyticsData')
      useAnalyticsData.mockReturnValue({
        postsWithMetrics: mockData,
        isLoading: false,
        refresh: jest.fn(),
      })

      await act(async () => {
        render(<AnalyticsPage />)
      })

      expect(screen.getByText('Tổng Reach')).toBeInTheDocument()
    })

    it('should handle eventId from URL params', async () => {
      mockUseParams.mockReturnValue({ eventId: 'test-event-123' })

      await act(async () => {
        render(<AnalyticsPage />)
      })

      const { useAnalyticsData } = require('../../../hooks/useAnalyticsData')
      expect(useAnalyticsData).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: 'test-event-123',
        })
      )
    })

    it('should handle missing eventId gracefully', async () => {
      mockUseParams.mockReturnValue({ eventId: undefined })

      await act(async () => {
        render(<AnalyticsPage />)
      })

      expect(screen.getByText('Phân tích dữ liệu')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 6. Loading States
  // --------------------------------------------------------------------------
  describe('Loading States', () => {
    it('should show skeleton during initial load', async () => {
      const { useAnalyticsData } = require('../../../hooks/useAnalyticsData')
      useAnalyticsData.mockReturnValue({
        postsWithMetrics: [],
        isLoading: true,
        refresh: jest.fn(),
      })

      render(<AnalyticsPage />)

      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThanOrEqual(1)
    })

    it('should not show skeleton when not loading', async () => {
      const { useAnalyticsData } = require('../../../hooks/useAnalyticsData')
      useAnalyticsData.mockReturnValue({
        postsWithMetrics: [createMockPostWithMetrics()],
        isLoading: false,
        refresh: jest.fn(),
      })

      await act(async () => {
        render(<AnalyticsPage />)
      })

      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBe(0)
    })
  })
})
