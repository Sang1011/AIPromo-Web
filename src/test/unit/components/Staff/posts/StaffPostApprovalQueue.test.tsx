/// <reference types="jest" />

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StaffPostApprovalQueue from '../../../../../components/Staff/posts/StaffPostApprovalQueue'

// ============================================================================
// MOCKS
// ============================================================================

// Mock Redux
const mockDispatch = jest.fn()
let mockPostState: any = {}
let mockAuthState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) =>
    selector({
      POST: mockPostState,
      AUTH: mockAuthState,
    }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../../../../store/postSlice', () => ({
  fetchAdminPosts: jest.fn((params) => ({
    type: 'POST/fetchAdminPosts',
    payload: params,
  })),
  approveAdminPost: jest.fn(({ postId, adminId }) => ({
    type: 'POST/approveAdminPost',
    payload: { postId, adminId },
    meta: { arg: { postId, adminId } },
  })),
  rejectAdminPost: jest.fn(({ postId, adminId, reason }) => ({
    type: 'POST/rejectAdminPost',
    payload: { postId, adminId, reason },
    meta: { arg: { postId, adminId, reason } },
  })),
}))

// Mock interceptorAPI
const mockGet = jest.fn()
jest.mock('../../../../../utils/attachInterceptors', () => ({
  interceptorAPI: () => ({
    get: mockGet,
  }),
}))

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}))

// Mock child components
jest.mock('../../../../../components/Staff/posts/StaffPostApprovalCard', () => ({
  __esModule: true,
  default: ({
    id,
    title,
    status,
    onApprove,
    onReject,
    onView,
    onReReview,
  }: any) => (
    <div data-testid="post-card" data-id={id} data-status={status}>
      <span data-testid="post-title">{title}</span>
      <span data-testid="post-status">{status}</span>
      {status === 'pending' && (
        <>
          <button onClick={() => onApprove?.(id)} data-testid="approve-btn">
            Approve
          </button>
          <button onClick={() => onReject?.(id)} data-testid="reject-btn">
            Reject
          </button>
          <button onClick={() => onView?.(id)} data-testid="view-btn">
            View
          </button>
        </>
      )}
      {status === 'rejected' && (
        <button onClick={() => onReReview?.(id)} data-testid="rereview-btn">
          ReReview
        </button>
      )}
    </div>
  ),
}))

jest.mock('../../../../../components/Staff/posts/StaffPostApprovalPagination', () => ({
  __esModule: true,
  default: ({ currentPage, totalPages, onPageChange }: any) => (
    <div data-testid="pagination">
      <span data-testid="current-page">{currentPage}</span>
      <span data-testid="total-pages">{totalPages}</span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        data-testid="next-page-btn"
      >
        Next
      </button>
    </div>
  ),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockPost = (overrides = {}) => ({
  id: 'post-1',
  title: 'Test Post',
  body: 'Test post body content',
  imageUrl: 'https://example.com/post.jpg',
  status: 'Pending',
  createdAt: '2026-04-13T10:00:00Z',
  rejectionReason: null,
  ...overrides,
})

const createMockPagination = (overrides = {}) => ({
  pageNumber: 1,
  totalPages: 3,
  totalCount: 25,
  currentStartIndex: 1,
  currentEndIndex: 10,
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('StaffPostApprovalQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockPostState = {
      adminPosts: [],
      adminPagination: null,
      loading: {
        fetchAdminList: false,
      },
    }

    mockAuthState = {
      currentInfor: {
        userId: 'staff-1',
      },
    }

    mockDispatch.mockImplementation(() => Promise.resolve({}))
    mockGet.mockResolvedValue({
      data: {
        data: {
          totalCount: 0,
        },
      },
    })
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      expect(
        screen.getByText('Duyệt bài đăng Marketing')
      ).toBeInTheDocument()
    })

    it('should render header with title and description', async () => {
      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      expect(
        screen.getByText('Duyệt bài đăng Marketing')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Kiểm duyệt nội dung và theo dõi phân phối đa nền tảng')
      ).toBeInTheDocument()
    })

    it('should render all 4 tabs', async () => {
      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      expect(screen.getByText('Chờ duyệt')).toBeInTheDocument()
      expect(screen.getByText('Đã duyệt')).toBeInTheDocument()
      expect(screen.getByText('Đã đăng')).toBeInTheDocument()
      expect(screen.getByText('Bị từ chối')).toBeInTheDocument()
    })

    it('should render reload button', async () => {
      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      expect(screen.getByText('Reload')).toBeInTheDocument()
    })
  })

  describe('Redux API Calls', () => {
    it('should dispatch fetchAdminPosts on mount with Pending status', async () => {
      const { fetchAdminPosts } = require('../../../../../store/postSlice')

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        fetchAdminPosts({
          PageNumber: 1,
          PageSize: 10,
          SortColumn: 'CreatedAt',
          SortOrder: 'desc',
          Status: 'Pending',
        })
      )
    })

    it('should fetch tab counts on mount', async () => {
      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalled()
      })
    })
  })

  describe('Tab Switching', () => {
    it('should dispatch fetchAdminPosts with correct status when tab changes', async () => {
      const { fetchAdminPosts } = require('../../../../../store/postSlice')

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      await userEvent.click(screen.getByText('Đã duyệt'))

      expect(mockDispatch).toHaveBeenCalledWith(
        fetchAdminPosts({
          PageNumber: 1,
          PageSize: 10,
          SortColumn: 'CreatedAt',
          SortOrder: 'desc',
          Status: 'Approved',
        })
      )
    })

    it('should reset page to 1 when tab changes', async () => {
      const { fetchAdminPosts } = require('../../../../../store/postSlice')

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      await userEvent.click(screen.getByText('Đã đăng'))

      expect(mockDispatch).toHaveBeenCalledWith(
        fetchAdminPosts({
          PageNumber: 1,
          PageSize: 10,
          SortColumn: 'CreatedAt',
          SortOrder: 'desc',
          Status: 'Published',
        })
      )
    })

    it('should highlight active tab', async () => {
      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      const pendingTab = screen.getByText('Chờ duyệt')
      expect(pendingTab).toHaveClass('bg-fuchsia-500')
    })

    it('should show counts in tab labels', async () => {
      mockGet.mockResolvedValue({
        data: {
          data: {
            totalCount: 5,
          },
        },
      })

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      await waitFor(() => {
        expect(screen.getByText('Chờ duyệt (5)')).toBeInTheDocument()
      })
    })
  })

  describe('Data Display', () => {
    it('should display post cards when data is available', async () => {
      mockPostState.adminPosts = [createMockPost()]

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      expect(screen.getByTestId('post-title')).toHaveTextContent('Test Post')
    })

    it('should display multiple post cards', async () => {
      mockPostState.adminPosts = [
        createMockPost(),
        createMockPost({ id: 'post-2', title: 'Post 2' }),
      ]

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      const titles = screen.getAllByTestId('post-title')
      expect(titles).toHaveLength(2)
    })

    it('should map post status correctly', async () => {
      mockPostState.adminPosts = [createMockPost({ status: 'Pending' })]

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      expect(screen.getByTestId('post-status')).toHaveTextContent('pending')
    })

    it('should show empty state when no posts', async () => {
      mockPostState.adminPosts = []

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      expect(
        screen.getByText('Không có bài đăng nào trong trạng thái này.')
      ).toBeInTheDocument()
    })

    it('should show loading state when loading', async () => {
      mockPostState.loading = { fetchAdminList: true }

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('should display pagination when pagination data is available', async () => {
      mockPostState.adminPosts = [createMockPost()]
      mockPostState.adminPagination = createMockPagination()

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      expect(screen.getByTestId('pagination')).toBeInTheDocument()
      expect(screen.getByTestId('current-page')).toHaveTextContent('1')
      expect(screen.getByTestId('total-pages')).toHaveTextContent('3')
    })

    it('should dispatch fetchAdminPosts when page changes', async () => {
      mockPostState.adminPosts = [createMockPost()]
      mockPostState.adminPagination = createMockPagination()

      const { fetchAdminPosts } = require('../../../../../store/postSlice')

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      await userEvent.click(screen.getByTestId('next-page-btn'))

      expect(mockDispatch).toHaveBeenCalledWith(
        fetchAdminPosts({
          PageNumber: 2,
          PageSize: 10,
          SortColumn: 'CreatedAt',
          SortOrder: 'desc',
          Status: 'Pending',
        })
      )
    })
  })

  describe('Approve Action', () => {
    it('should show approve confirmation modal when approve is clicked', async () => {
      mockPostState.adminPosts = [createMockPost()]

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      await userEvent.click(screen.getByTestId('approve-btn'))

      // Use getAllByText since there might be multiple elements with same text
      const confirmTexts = screen.getAllByText('Xác nhận duyệt')
      expect(confirmTexts.length).toBeGreaterThanOrEqual(1)
    })

    it('should display approve button for pending posts', async () => {
      mockPostState.adminPosts = [createMockPost()]

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      // Verify approve button exists
      expect(screen.getByTestId('approve-btn')).toBeInTheDocument()
    })

    it('should open approve confirmation modal', async () => {
      mockPostState.adminPosts = [createMockPost()]

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      await userEvent.click(screen.getByTestId('approve-btn'))
      const confirmTexts = screen.getAllByText('Xác nhận duyệt')
      expect(confirmTexts.length).toBeGreaterThanOrEqual(1)
    })

    it('should display reject button for pending posts', async () => {
      mockPostState.adminPosts = [createMockPost()]

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      // Verify reject button exists
      expect(screen.getByTestId('reject-btn')).toBeInTheDocument()
    })

    it('should open reject confirmation modal', async () => {
      mockPostState.adminPosts = [createMockPost()]

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      await userEvent.click(screen.getByTestId('reject-btn'))
      const textarea = screen.getByPlaceholderText('Nhập lý do từ chối...')
      expect(textarea).toBeInTheDocument()
    })

    it('should display re-review button for rejected posts', async () => {
      mockPostState.adminPosts = [createMockPost({ status: 'Rejected' })]

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      // Verify re-review button exists
      expect(screen.getByTestId('rereview-btn')).toBeInTheDocument()
    })
  })

  describe('Reject Action', () => {
    it('should handle reject confirmation modal', async () => {
      mockPostState.adminPosts = [createMockPost()]

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      await userEvent.click(screen.getByTestId('reject-btn'))

      const confirmTexts = screen.getAllByText('Xác nhận từ chối')
      expect(confirmTexts.length).toBeGreaterThanOrEqual(1)
    })

    it('should display reject reason textarea', async () => {
      mockPostState.adminPosts = [createMockPost()]

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      await userEvent.click(screen.getByTestId('reject-btn'))
      const textarea = screen.getByPlaceholderText('Nhập lý do từ chối...')
      expect(textarea).toBeInTheDocument()
    })
  })

  describe('ReReview Action', () => {
    it('should display re-review button for rejected posts', async () => {
      mockPostState.adminPosts = [
        createMockPost({ status: 'Rejected' }),
      ]

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      expect(screen.getByTestId('rereview-btn')).toBeInTheDocument()
    })
  })

  describe('View Action', () => {
    it('should show detail modal when view is clicked', async () => {
      mockPostState.adminPosts = [createMockPost()]

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      await userEvent.click(screen.getByTestId('view-btn'))

      expect(screen.getByText('Chi tiết bài đăng')).toBeInTheDocument()
    })
  })

  describe('Reload', () => {
    it('should reload posts when reload button is clicked', async () => {
      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      await userEvent.click(screen.getByText('Reload'))

      // Component should handle reload without crashing
      expect(screen.getByText('Duyệt bài đăng Marketing')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty posts array', async () => {
      mockPostState.adminPosts = []

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      expect(
        screen.getByText('Không có bài đăng nào trong trạng thái này.')
      ).toBeInTheDocument()
    })

    it('should handle null pagination', async () => {
      mockPostState.adminPosts = [createMockPost()]
      mockPostState.adminPagination = null

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      // Should not crash
      expect(screen.getByTestId('post-title')).toBeInTheDocument()
    })

    it('should handle missing staffId gracefully', async () => {
      mockAuthState.currentInfor = {}

      mockPostState.adminPosts = [createMockPost()]

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      // Component should render without crashing
      expect(screen.getByText('Duyệt bài đăng Marketing')).toBeInTheDocument()
    })

    it('should handle approve button gracefully', async () => {
      mockPostState.adminPosts = [createMockPost()]

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      // Verify approve button exists and can be clicked to open modal
      await userEvent.click(screen.getByTestId('approve-btn'))
      const confirmTexts = screen.getAllByText('Xác nhận duyệt')
      expect(confirmTexts.length).toBeGreaterThanOrEqual(1)
    })

    it('should handle reject button gracefully', async () => {
      mockPostState.adminPosts = [createMockPost()]

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      // Verify reject button exists and opens textarea
      await userEvent.click(screen.getByTestId('reject-btn'))
      const textarea = screen.getByPlaceholderText('Nhập lý do từ chối...')
      expect(textarea).toBeInTheDocument()
    })

    it('should handle tab count API errors gracefully', async () => {
      mockGet.mockRejectedValue(new Error('API Error'))

      await act(async () => {
        render(<StaffPostApprovalQueue onReload={jest.fn()} />)
      })

      // Should not crash
      await waitFor(() => {
        expect(
          screen.getByText('Duyệt bài đăng Marketing')
        ).toBeInTheDocument()
      })
    })
  })
})





