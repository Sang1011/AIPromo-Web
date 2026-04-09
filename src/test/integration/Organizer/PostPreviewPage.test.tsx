/// <reference types="jest" />
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PostPreviewPage from '../../../pages/Organizer/PostPreviewPage'

// ============================================================================
// MOCKS
// ============================================================================

const mockUseParams = jest.fn()
const mockUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
  useNavigate: () => mockUseNavigate(),
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
  clearPostDetail: jest.fn(() => ({ type: 'POST/clearPostDetail' })),
}))

jest.mock('../../../components/Organizer/post/PostBlockRenderer', () => ({
  __esModule: true,
  default: ({ blocks }: { blocks: any[] }) => (
    <div data-testid="post-block-renderer">
      <span data-testid="block-count">{blocks.length}</span>
    </div>
  ),
}))

jest.mock('../../../utils/renderPostContent', () => ({
  parseBodyToBlocks: (body: string) => [{ type: 'paragraph', content: body }],
}))

jest.mock('../../../utils/injectImageBlock', () => ({
  injectImageBlock: (blocks: any[], imageUrl: string | null) => {
    if (imageUrl) return [...blocks, { type: 'image', url: imageUrl }]
    return blocks
  },
}))

// ============================================================================
// TESTS
// ============================================================================

describe('PostPreviewPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ postId: 'post-123' })
    mockUseNavigate.mockReturnValue(jest.fn())
    mockPostState = {
      postDetail: null,
      loading: { fetchDetail: false },
      error: { fetchDetail: null },
    }
    mockDispatch.mockResolvedValue({})
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      mockPostState.postDetail = { id: 'post-1', title: 'Test Post', body: 'Content', imageUrl: null }
      await act(async () => render(<PostPreviewPage />))
      expect(screen.getByText('Preview bài đăng')).toBeInTheDocument()
    })

    it('should show loading state', async () => {
      mockPostState.loading = { fetchDetail: true }
      render(<PostPreviewPage />)
      expect(screen.getByText('Đang tải nội dung...')).toBeInTheDocument()
    })

    it('should show error state when post not found', async () => {
      mockPostState.error = { fetchDetail: 'Post not found' }
      await act(async () => render(<PostPreviewPage />))
      expect(screen.getByText('Post not found')).toBeInTheDocument()
    })

    it('should show default error when no post and no error', async () => {
      await act(async () => render(<PostPreviewPage />))
      expect(screen.getByText('Không có nội dung để preview.')).toBeInTheDocument()
    })
  })

  describe('UI Elements', () => {
    it('should render post title when loaded', async () => {
      mockPostState.postDetail = { id: 'post-1', title: 'My Post Title', body: 'Content' }
      await act(async () => render(<PostPreviewPage />))
      expect(screen.getByText(/My Post Title/)).toBeInTheDocument()
    })

    it('should render AI badge', async () => {
      mockPostState.postDetail = { id: 'post-1', title: 'Test', body: 'Content' }
      await act(async () => render(<PostPreviewPage />))
      expect(screen.getByText(/Được tạo bởi AI/)).toBeInTheDocument()
    })
  })

  describe('API Calls', () => {
    it('should call fetchPostDetail on mount', async () => {
      const { fetchPostDetail } = require('../../../store/postSlice')
      await act(async () => render(<PostPreviewPage />))
      expect(mockDispatch).toHaveBeenCalledWith(fetchPostDetail('post-123'))
    })

    it('should call clearPostDetail on unmount', async () => {
      const { clearPostDetail } = require('../../../store/postSlice')
      const { unmount } = await act(async () => render(<PostPreviewPage />))
      unmount()
      expect(mockDispatch).toHaveBeenCalledWith(clearPostDetail())
    })
  })

  describe('User Interactions', () => {
    it('should navigate back when clicking back button', async () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)
      mockPostState.postDetail = { id: 'post-1', title: 'Test', body: 'Content' }

      await act(async () => render(<PostPreviewPage />))

      const backButton = screen.getByText(/Quay lại/)
      await userEvent.click(backButton)

      expect(navigate).toHaveBeenCalledWith(-1)
    })
  })

  describe('Data Display', () => {
    it('should render post content with blocks', async () => {
      mockPostState.postDetail = { id: 'post-1', title: 'Test', body: 'Hello World', imageUrl: null }
      await act(async () => render(<PostPreviewPage />))
      expect(screen.getByTestId('post-block-renderer')).toBeInTheDocument()
    })

    it('should include image in blocks when imageUrl exists', async () => {
      mockPostState.postDetail = { id: 'post-1', title: 'Test', body: 'Content', imageUrl: 'https://example.com/img.jpg' }
      await act(async () => render(<PostPreviewPage />))
      expect(screen.getByTestId('block-count')).toHaveTextContent('2')
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing postId', async () => {
      mockUseParams.mockReturnValue({ postId: undefined })
      await act(async () => render(<PostPreviewPage />))
      expect(screen.getByText('Không có nội dung để preview.')).toBeInTheDocument()
    })

    it('should handle post with empty body', async () => {
      mockPostState.postDetail = { id: 'post-1', title: 'Test', body: '', imageUrl: null }
      await act(async () => render(<PostPreviewPage />))
      expect(screen.getByTestId('post-block-renderer')).toBeInTheDocument()
    })
  })
})
