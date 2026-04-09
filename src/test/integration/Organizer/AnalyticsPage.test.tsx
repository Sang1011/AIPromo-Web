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
jest.mock('../../store/postSlice', () => ({
  fetchPosts: jest.fn((params) => ({ type: 'POST/fetchPosts', payload: params })),
}))

// Mock hooks
jest.mock('../../hooks/useAnalyticsData', () => ({
  useAnalyticsData: jest.fn(() => ({
    postsWithMetrics: [],
    isLoading: false,
    refresh: jest.fn(),
  })),
}))

// Mock child components
jest.mock('../../components/Organizer/analytics/SummaryKpis', () => ({
  __esModule: true,
  default: ({ data }: { data: any[] }) => (
    <div data-testid="summary-kpis">
      <span data-testid="post-count">{data.length} posts</span>
    </div>
  ),
}))

jest.mock('../../components/Organizer/analytics/ReachTrendChart', () => ({
  __esModule: true,
  default: ({ data }: { data: any[] }) => (
    <div data-testid="reach-trend-chart">
      <span data-testid="chart-data-count">{data.length} items</span>
    </div>
  ),
}))

jest.mock('../../components/Organizer/analytics/CtrPerPostChart', () => ({
  __esModule: true,
  default: ({ data }: { data: any[] }) => (
    <div data-testid="ctr-chart">{data.length} items</div>
  ),
}))

jest.mock('../../components/Organizer/analytics/EngagementBreakdown', () => ({
  __esModule: true,
  default: ({ data }: { data: any[] }) => (
    <div data-testid="engagement-breakdown">{data.length} items</div>
  ),
}))

jest.mock('../../components/Organizer/analytics/TopPostsTable', () => ({
  __esModule: true,
  default: ({ data }: { data: any[] }) => (
    <div data-testid="top-posts-table">
      <span data-testid="top-posts-count">{Math.min(data.length, 5)} top posts</span>
    </div>
  ),
}))

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
      const { useAnalyticsData } = require('../../hooks/useAnalyticsData')
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
      const { useAnalyticsData } = require('../../hooks/useAnalyticsData')
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
      const { useAnalyticsData } = require('../../hooks/useAnalyticsData')
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
      const { useAnalyticsData } = require('../../hooks/useAnalyticsData')
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
      const { useAnalyticsData } = require('../../hooks/useAnalyticsData')
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

      const { useAnalyticsData } = require('../../hooks/useAnalyticsData')
      useAnalyticsData.mockReturnValue({
        postsWithMetrics: mockData,
        isLoading: false,
        refresh: jest.fn(),
      })

      await act(async () => {
        render(<AnalyticsPage />)
      })

      expect(screen.getByTestId('summary-kpis')).toBeInTheDocument()
      expect(screen.getByTestId('reach-trend-chart')).toBeInTheDocument()
      expect(screen.getByTestId('ctr-chart')).toBeInTheDocument()
      expect(screen.getByTestId('engagement-breakdown')).toBeInTheDocument()
      expect(screen.getByTestId('top-posts-table')).toBeInTheDocument()
    })

    it('should show correct post count in components', async () => {
      const mockData = [
        createMockPostWithMetrics(),
        createMockPostWithMetrics(),
        createMockPostWithMetrics(),
      ]

      const { useAnalyticsData } = require('../../hooks/useAnalyticsData')
      useAnalyticsData.mockReturnValue({
        postsWithMetrics: mockData,
        isLoading: false,
        refresh: jest.fn(),
      })

      await act(async () => {
        render(<AnalyticsPage />)
      })

      expect(screen.getByTestId('chart-data-count')).toHaveTextContent('3 items')
    })

    it('should show top 5 posts in table', async () => {
      const mockData = Array(10).fill(null).map((_, i) =>
        createMockPostWithMetrics({
          post: { id: `post-${i}`, title: `Post ${i}` },
          metrics: { reach: 1000 * (i + 1) },
        })
      )

      const { useAnalyticsData } = require('../../hooks/useAnalyticsData')
      useAnalyticsData.mockReturnValue({
        postsWithMetrics: mockData,
        isLoading: false,
        refresh: jest.fn(),
      })

      await act(async () => {
        render(<AnalyticsPage />)
      })

      expect(screen.getByTestId('top-posts-count')).toHaveTextContent('5 top posts')
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

      const { useAnalyticsData } = require('../../hooks/useAnalyticsData')
      useAnalyticsData.mockReturnValue({
        postsWithMetrics: mockData,
        isLoading: false,
        refresh: jest.fn(),
      })

      await act(async () => {
        render(<AnalyticsPage />)
      })

      expect(screen.getByTestId('reach-trend-chart')).toBeInTheDocument()
    })

    it('should handle posts with zero metrics', async () => {
      const mockData = [
        createMockPostWithMetrics({
          metrics: { reach: 0, clicks: 0, likes: 0, comments: 0, shares: 0 },
        }),
      ]

      const { useAnalyticsData } = require('../../hooks/useAnalyticsData')
      useAnalyticsData.mockReturnValue({
        postsWithMetrics: mockData,
        isLoading: false,
        refresh: jest.fn(),
      })

      await act(async () => {
        render(<AnalyticsPage />)
      })

      expect(screen.getByTestId('summary-kpis')).toBeInTheDocument()
    })

    it('should handle eventId from URL params', async () => {
      mockUseParams.mockReturnValue({ eventId: 'test-event-123' })

      await act(async () => {
        render(<AnalyticsPage />)
      })

      const { useAnalyticsData } = require('../../hooks/useAnalyticsData')
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
      const { useAnalyticsData } = require('../../hooks/useAnalyticsData')
      useAnalyticsData.mockReturnValue({
        postsWithMetrics: [],
        isLoading: true,
        refresh: jest.fn(),
      })

      render(<AnalyticsPage />)

      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThanOrEqual(4)
    })

    it('should not show skeleton when not loading', async () => {
      const { useAnalyticsData } = require('../../hooks/useAnalyticsData')
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
