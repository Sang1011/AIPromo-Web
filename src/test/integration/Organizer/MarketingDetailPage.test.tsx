/// <reference types="jest" />
import { act, render, screen } from '@testing-library/react'

import MarketingDetailPage from '../../../pages/Organizer/MarketingDetailPage'

// ============================================================================
// MOCKS
// ============================================================================

const mockUseParams = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
}))

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
  fetchPostDetail: jest.fn((id) => ({ type: 'POST/fetchPostDetail', payload: id })),
}))

jest.mock('../../../components/Organizer/marketing/ContentDetail', () => ({
  __esModule: true,
  default: ({ post, loading, error, onReload }: any) => (
    <div data-testid="content-detail">
      <span data-testid="post-title">{post?.title ?? 'No title'}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error ?? 'none'}</span>
      <button data-testid="reload-button" onClick={onReload}>Reload</button>
    </div>
  ),
}))

jest.mock('../../../components/Organizer/marketing/FacebookMetricsSection', () => ({
  __esModule: true,
  default: ({ post }: any) => (
    <div data-testid="facebook-metrics">
      <span data-testid="metrics-post-id">{post?.id}</span>
    </div>
  ),
}))

// ============================================================================
// TESTS
// ============================================================================

describe('MarketingDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ marketingId: 'post-123' })
    mockPostState = { postDetail: null, loading: { fetchDetail: false }, error: { fetchDetail: null } }
    mockDispatch.mockResolvedValue({})
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => render(<MarketingDetailPage />))
      expect(screen.getByTestId('content-detail')).toBeInTheDocument()
    })

    it('should show loading state', async () => {
      mockPostState.loading = { fetchDetail: true }
      await act(async () => render(<MarketingDetailPage />))
      expect(screen.getByTestId('loading')).toHaveTextContent('true')
    })

    it('should show Facebook metrics when post is loaded', async () => {
      mockPostState.postDetail = { id: 'test-post', title: 'Test Post', body: 'Content' }
      await act(async () => render(<MarketingDetailPage />))
      expect(screen.getByTestId('facebook-metrics')).toBeInTheDocument()
    })
  })

  describe('API Calls', () => {
    it('should call fetchPostDetail on mount', async () => {
      const { fetchPostDetail } = require('../../../store/postSlice')
      await act(async () => render(<MarketingDetailPage />))
      expect(mockDispatch).toHaveBeenCalledWith(fetchPostDetail('post-123'))
    })

    it('should not call fetchPostDetail if marketingId is missing', async () => {
      mockUseParams.mockReturnValue({ marketingId: undefined })
      await act(async () => render(<MarketingDetailPage />))
      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })

  describe('User Interactions', () => {
    it('should reload data when clicking reload button', async () => {
      const { fetchPostDetail } = require('../../../store/postSlice')
      mockPostState.postDetail = { id: 'test-post', title: 'Test Post' }

      await act(async () => render(<MarketingDetailPage />))

      const reloadButton = screen.getByTestId('reload-button')
      await act(async () => reloadButton.click())

      expect(mockDispatch).toHaveBeenCalledWith(fetchPostDetail('post-123'))
    })
  })

  describe('Data Display', () => {
    it('should pass post detail to child components', async () => {
      mockPostState.postDetail = { id: 'my-post', title: 'My Post', body: 'Content' }

      await act(async () => render(<MarketingDetailPage />))

      expect(screen.getByTestId('post-title')).toHaveTextContent('My Post')
      expect(screen.getByTestId('metrics-post-id')).toHaveTextContent('my-post')
    })
  })

  describe('Edge Cases', () => {
    it('should handle error state', async () => {
      mockPostState.error = { fetchDetail: 'Network error' }
      await act(async () => render(<MarketingDetailPage />))
      expect(screen.getByTestId('error')).toHaveTextContent('Network error')
    })

    it('should handle missing marketingId', async () => {
      mockUseParams.mockReturnValue({ marketingId: undefined })
      await act(async () => render(<MarketingDetailPage />))
      expect(screen.getByTestId('content-detail')).toBeInTheDocument()
    })
  })
})
