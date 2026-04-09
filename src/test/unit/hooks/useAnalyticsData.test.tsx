/// <reference types="jest" />
import { renderHook, waitFor } from '@testing-library/react'
import { useAnalyticsData } from '../../../hooks/useAnalyticsData'

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

jest.mock('../../../store/postSlice', () => ({
  fetchOrganizerPosts: jest.fn((params) => ({ type: 'POST/fetchPosts', payload: params })),
  fetchAllDistributionMetrics: jest.fn((targets) => ({ type: 'POST/fetchMetrics', payload: targets })),
}))

describe('useAnalyticsData', () => {
  const mockParams = {
    pageNumber: 1,
    pageSize: 10,
    eventId: 'event-123',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockPostState = {
      posts: [],
      loading: { fetchList: false, fetchDistributionMetrics: false },
      distributionMetricsMap: {},
    }
    mockDispatch.mockResolvedValue({})
  })

  describe('Initial fetch', () => {
    it('should dispatch fetchOrganizerPosts on mount', () => {
      const { fetchOrganizerPosts } = require('../../../store/postSlice')

      renderHook(() => useAnalyticsData(mockParams))

      expect(mockDispatch).toHaveBeenCalledWith(fetchOrganizerPosts(mockParams))
    })
  })

  describe('postsWithMetrics', () => {
    it('should return empty array when no posts', () => {
      const { result } = renderHook(() => useAnalyticsData(mockParams))

      expect(result.current.postsWithMetrics).toEqual([])
    })

    it('should return posts with metrics when available', () => {
      mockPostState.posts = [
        {
          id: 'post-1',
          title: 'Test Post',
          publishedAt: '2024-12-01T10:00:00Z',
          distributions: [
            { id: 'dist-1', platform: 'Facebook', status: 'Sent', sentAt: '2024-12-01T09:00:00Z' },
          ],
        },
      ]
      mockPostState.distributionMetricsMap = {
        'dist-1': { reach: 1000, clicks: 50, likes: 100, comments: 20, shares: 10 },
      }

      const { result } = renderHook(() => useAnalyticsData(mockParams))

      expect(result.current.postsWithMetrics).toHaveLength(1)
      expect(result.current.postsWithMetrics[0]).toMatchObject({
        post: { id: 'post-1', title: 'Test Post' },
        metrics: { reach: 1000, clicks: 50 },
        distributionId: 'dist-1',
      })
    })

    it('should filter out posts without Facebook distributions', () => {
      mockPostState.posts = [
        {
          id: 'post-1',
          title: 'No Facebook Post',
          publishedAt: '2024-12-01T10:00:00Z',
          distributions: [
            { id: 'dist-1', platform: 'Instagram', status: 'Sent', sentAt: '2024-12-01T09:00:00Z' },
          ],
        },
      ]

      const { result } = renderHook(() => useAnalyticsData(mockParams))

      expect(result.current.postsWithMetrics).toHaveLength(0)
    })

    it('should filter out posts without metrics', () => {
      mockPostState.posts = [
        {
          id: 'post-1',
          title: 'No Metrics Post',
          publishedAt: '2024-12-01T10:00:00Z',
          distributions: [
            { id: 'dist-1', platform: 'Facebook', status: 'Sent', sentAt: '2024-12-01T09:00:00Z' },
          ],
        },
      ]
      mockPostState.distributionMetricsMap = {}

      const { result } = renderHook(() => useAnalyticsData(mockParams))

      expect(result.current.postsWithMetrics).toHaveLength(0)
    })

    it('should sort posts by publishedAt ascending', () => {
      mockPostState.posts = [
        {
          id: 'post-2',
          title: 'Later Post',
          publishedAt: '2024-12-02T10:00:00Z',
          distributions: [
            { id: 'dist-2', platform: 'Facebook', status: 'Sent', sentAt: '2024-12-02T09:00:00Z' },
          ],
        },
        {
          id: 'post-1',
          title: 'Earlier Post',
          publishedAt: '2024-12-01T10:00:00Z',
          distributions: [
            { id: 'dist-1', platform: 'Facebook', status: 'Sent', sentAt: '2024-12-01T09:00:00Z' },
          ],
        },
      ]
      mockPostState.distributionMetricsMap = {
        'dist-1': { reach: 100, clicks: 10, likes: 20, comments: 5, shares: 2 },
        'dist-2': { reach: 200, clicks: 20, likes: 40, comments: 10, shares: 5 },
      }

      const { result } = renderHook(() => useAnalyticsData(mockParams))

      expect(result.current.postsWithMetrics[0].post.id).toBe('post-1')
      expect(result.current.postsWithMetrics[1].post.id).toBe('post-2')
    })

    it('should pick the most recent Facebook distribution', () => {
      mockPostState.posts = [
        {
          id: 'post-1',
          title: 'Test Post',
          publishedAt: '2024-12-01T10:00:00Z',
          distributions: [
            { id: 'dist-old', platform: 'Facebook', status: 'Sent', sentAt: '2024-11-01T09:00:00Z' },
            { id: 'dist-new', platform: 'Facebook', status: 'Sent', sentAt: '2024-12-01T09:00:00Z' },
          ],
        },
      ]
      mockPostState.distributionMetricsMap = {
        'dist-old': { reach: 100, clicks: 10, likes: 20, comments: 5, shares: 2 },
        'dist-new': { reach: 500, clicks: 50, likes: 100, comments: 25, shares: 10 },
      }

      const { result } = renderHook(() => useAnalyticsData(mockParams))

      expect(result.current.postsWithMetrics[0].distributionId).toBe('dist-new')
    })
  })

  describe('isLoading', () => {
    it('should return false when not loading', () => {
      mockPostState.loading = { fetchList: false, fetchDistributionMetrics: false }

      const { result } = renderHook(() => useAnalyticsData(mockParams))

      expect(result.current.isLoading).toBe(false)
    })

    it('should return true when fetchList is loading', () => {
      mockPostState.loading = { fetchList: true, fetchDistributionMetrics: false }

      const { result } = renderHook(() => useAnalyticsData(mockParams))

      expect(result.current.isLoading).toBe(true)
    })

    it('should return true when fetchDistributionMetrics is loading', () => {
      mockPostState.loading = { fetchList: false, fetchDistributionMetrics: true }

      const { result } = renderHook(() => useAnalyticsData(mockParams))

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('refresh', () => {
    it('should dispatch fetchOrganizerPosts when called', () => {
      const { fetchOrganizerPosts } = require('../../../store/postSlice')
      const { result } = renderHook(() => useAnalyticsData(mockParams))

      result.current.refresh()

      expect(mockDispatch).toHaveBeenCalledWith(fetchOrganizerPosts(mockParams))
    })
  })

  describe('Side effects', () => {
    it('should fetch distribution metrics when posts have Facebook distributions', async () => {
      const { fetchAllDistributionMetrics } = require('../../../store/postSlice')
      mockPostState.posts = [
        {
          id: 'post-1',
          title: 'Test Post',
          publishedAt: '2024-12-01T10:00:00Z',
          distributions: [
            { id: 'dist-1', platform: 'Facebook', status: 'Sent', sentAt: '2024-12-01T09:00:00Z' },
          ],
        },
      ]

      renderHook(() => useAnalyticsData(mockParams))

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchAllDistributionMetrics([{ postId: 'post-1', distributionId: 'dist-1' }])
        )
      })
    })

    it('should not fetch metrics when posts have no distributions', async () => {
      mockPostState.posts = [
        {
          id: 'post-1',
          title: 'Test Post',
          publishedAt: '2024-12-01T10:00:00Z',
          distributions: [],
        },
      ]

      renderHook(() => useAnalyticsData(mockParams))

      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'POST/fetchMetrics' })
      )
    })

    it('should not fetch metrics for non-Facebook distributions', async () => {
      mockPostState.posts = [
        {
          id: 'post-1',
          title: 'Test Post',
          publishedAt: '2024-12-01T10:00:00Z',
          distributions: [
            { id: 'dist-1', platform: 'Instagram', status: 'Sent', sentAt: '2024-12-01T09:00:00Z' },
          ],
        },
      ]

      renderHook(() => useAnalyticsData(mockParams))

      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'POST/fetchMetrics' })
      )
    })

    it('should not fetch metrics for non-Sent distributions', async () => {
      mockPostState.posts = [
        {
          id: 'post-1',
          title: 'Test Post',
          publishedAt: '2024-12-01T10:00:00Z',
          distributions: [
            { id: 'dist-1', platform: 'Facebook', status: 'Pending', sentAt: '2024-12-01T09:00:00Z' },
          ],
        },
      ]

      renderHook(() => useAnalyticsData(mockParams))

      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'POST/fetchMetrics' })
      )
    })
  })

  describe('Edge cases', () => {
    it('should handle posts with null distributions', () => {
      mockPostState.posts = [
        {
          id: 'post-1',
          title: 'Test Post',
          publishedAt: '2024-12-01T10:00:00Z',
          distributions: null,
        },
      ]

      const { result } = renderHook(() => useAnalyticsData(mockParams))

      expect(result.current.postsWithMetrics).toHaveLength(0)
      expect(result.current.isLoading).toBe(false)
    })

    it('should handle posts with null publishedAt', () => {
      mockPostState.posts = [
        {
          id: 'post-1',
          title: 'Test Post',
          publishedAt: null,
          distributions: [
            { id: 'dist-1', platform: 'Facebook', status: 'Sent', sentAt: '2024-12-01T09:00:00Z' },
          ],
        },
      ]
      mockPostState.distributionMetricsMap = {
        'dist-1': { reach: 100, clicks: 10, likes: 20, comments: 5, shares: 2 },
      }

      const { result } = renderHook(() => useAnalyticsData(mockParams))

      expect(result.current.postsWithMetrics).toHaveLength(1)
    })
  })
})
