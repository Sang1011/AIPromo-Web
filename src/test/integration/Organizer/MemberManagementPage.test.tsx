/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import MemberManagementPage from '../../../pages/Organizer/MemberManagementPage'

// ============================================================================
// MOCKS
// ============================================================================

// Mock react-router-dom
const mockUseParams = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
}))

// Mock react-icons
jest.mock('react-icons/fi', () => ({
  FiDownload: () => <div data-testid="fi-download" />,
}))

// Mock Redux
const mockDispatch = jest.fn()
let mockEventMemberState: any = {}
let mockAuthState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    EVENT_MEMBER: mockEventMemberState,
    AUTH: mockAuthState,
  }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../../store/eventMemberSlice', () => {
  const mockFetchEventMembers = jest.fn() as any
  mockFetchEventMembers.fulfilled = { match: jest.fn(() => false) as any }
  mockFetchEventMembers.rejected = { match: jest.fn(() => false) as any }
  mockFetchEventMembers.pending = { match: jest.fn(() => false) as any }

  const mockFetchAddEventMember = jest.fn() as any
  mockFetchAddEventMember.fulfilled = { match: jest.fn(() => false) as any }
  mockFetchAddEventMember.rejected = { match: jest.fn(() => false) as any }
  mockFetchAddEventMember.pending = { match: jest.fn(() => false) as any }

  const mockFetchExportExcelMember = jest.fn() as any
  mockFetchExportExcelMember.fulfilled = { match: jest.fn(() => false) as any }
  mockFetchExportExcelMember.rejected = { match: jest.fn(() => false) as any }
  mockFetchExportExcelMember.pending = { match: jest.fn(() => false) as any }

  return {
    fetchEventMembers: mockFetchEventMembers,
    fetchAddEventMember: mockFetchAddEventMember,
    fetchExportExcelMember: mockFetchExportExcelMember,
  }
})

jest.mock('../../../store/authSlice', () => ({
  fetchMe: jest.fn(() => ({ type: 'AUTH/fetchMe' })),
}))

// Mock hooks
jest.mock('../../../hooks/useEventTitle', () => ({
  useEventTitle: jest.fn(() => 'Test Event'),
}))

// Mock utils
jest.mock('../../../utils/notify', () => ({
  notify: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}))

jest.mock('../../../utils/downloadFileExcel', () => ({
  downloadFileExcel: jest.fn(),
}))

jest.mock('../../../utils/getCurrentDateTime', () => ({
  getCurrentDateTime: jest.fn(() => ({
    iso: '2024-12-01T10:00:00Z',
    formatted: '2024-12-01_10-00-00',
  })),
}))

jest.mock('../../../utils/saveReportToFirebase', () => ({
  saveReportToFirebase: jest.fn().mockResolvedValue(undefined),
}))

// Mock child components
jest.mock('../../../components/Organizer/members/MembersTable', () => ({
  __esModule: true,
  default: ({ members, filteredMembers }: any) => (
    <div data-testid="members-table">
      <span data-testid="member-count">{members.length} members</span>
      <span data-testid="filtered-count">{filteredMembers.length} filtered</span>
      {members.map((m: any) => (
        <span key={m.id} data-testid="member-item">{m.email}</span>
      ))}
    </div>
  ),
}))

jest.mock('../../../components/Organizer/shared/Pagination', () => ({
  __esModule: true,
  default: ({ currentPage, totalPages, onPageChange }: any) => (
    <div data-testid="pagination">
      <span data-testid="current-page">{currentPage}</span>
      <span data-testid="total-pages">{totalPages}</span>
      <button data-testid="page-next" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
        Next
      </button>
      <button data-testid="page-prev" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
        Prev
      </button>
    </div>
  ),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockMember = (overrides = {}) => ({
  id: `member-${Math.random()}`,
  email: 'test@example.com',
  permissions: ['CheckIn', 'ViewReports'],
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('MemberManagementPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseParams.mockReturnValue({ eventId: 'event-1' })

    mockEventMemberState = {
      members: [],
      addingMember: false,
    }

    mockAuthState = {
      currentUser: null,
    }

    mockDispatch.mockReturnValue({ unwrap: () => Promise.resolve({}) })
  })

  // --------------------------------------------------------------------------
  // 1. Render
  // --------------------------------------------------------------------------
  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<MemberManagementPage />)
      })

      expect(screen.getByText('Quản lý thành viên')).toBeInTheDocument()
    })

    it('should render null when eventId is missing', () => {
      mockUseParams.mockReturnValue({ eventId: undefined })

      const { container } = render(<MemberManagementPage />)
      expect(container.innerHTML).toBe('')
    })

    it('should show member count badge', async () => {
      mockEventMemberState.members = [createMockMember(), createMockMember()]

      await act(async () => {
        render(<MemberManagementPage />)
      })

      expect(screen.getByText('Thành viên')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 2. UI Elements
  // --------------------------------------------------------------------------
  describe('UI Elements', () => {
    it('should render search input', async () => {
      await act(async () => {
        render(<MemberManagementPage />)
      })

      expect(screen.getByPlaceholderText('Tìm thành viên theo email...')).toBeInTheDocument()
    })

    it('should render export Excel button', async () => {
      await act(async () => {
        render(<MemberManagementPage />)
      })

      expect(screen.getByText('Xuất Excel')).toBeInTheDocument()
    })

    it('should render add member button', async () => {
      await act(async () => {
        render(<MemberManagementPage />)
      })

      expect(screen.getByText('+ Thêm thành viên')).toBeInTheDocument()
    })

    it('should render members table', async () => {
      await act(async () => {
        render(<MemberManagementPage />)
      })

      expect(screen.getByTestId('members-table')).toBeInTheDocument()
    })

    it('should render pagination', async () => {
      await act(async () => {
        render(<MemberManagementPage />)
      })

      expect(screen.getByTestId('pagination')).toBeInTheDocument()
    })

    it('should show add modal when clicking add button', async () => {
      await act(async () => {
        render(<MemberManagementPage />)
      })

      const addBtn = screen.getByText('+ Thêm thành viên')
      await userEvent.click(addBtn)

      expect(screen.getByText('Thêm thành viên mới')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 3. API Calls
  // --------------------------------------------------------------------------
  describe('API Calls', () => {
    it('should call fetchEventMembers on mount', async () => {
      const { fetchEventMembers } = require('../../../store/eventMemberSlice')

      await act(async () => {
        render(<MemberManagementPage />)
      })

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchEventMembers('event-1'))
      })
    })

    it('should call fetchAddEventMember when adding member', async () => {
      const eventMemberSlice = require('../../../store/eventMemberSlice')

      await act(async () => {
        render(<MemberManagementPage />)
      })

      // Open modal
      await userEvent.click(screen.getByText('+ Thêm thành viên'))

      // Fill email
      const emailInput = screen.getByPlaceholderText('example@email.com')
      await userEvent.type(emailInput, 'new@example.com')

      // Submit
      const submitBtn = screen.getByText('Thêm thành viên')
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          eventMemberSlice.fetchAddEventMember({
            eventId: 'event-1',
            data: { email: 'new@example.com', permissions: [] },
          })
        )
      })
    })

    it('should call fetchExportExcelMember when clicking export', async () => {
      const eventMemberSlice = require('../../../store/eventMemberSlice')
      const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      mockDispatch.mockResolvedValue({ unwrap: () => Promise.resolve(mockBlob) })

      await act(async () => {
        render(<MemberManagementPage />)
      })

      const exportBtn = screen.getByText('Xuất Excel')
      await userEvent.click(exportBtn)

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(eventMemberSlice.fetchExportExcelMember('event-1'))
      })
    })
  })

  // --------------------------------------------------------------------------
  // 4. User Interactions
  // --------------------------------------------------------------------------
  describe('User Interactions', () => {
    it('should filter members when typing in search', async () => {
      mockEventMemberState.members = [
        createMockMember({ id: '1', email: 'alice@example.com' }),
        createMockMember({ id: '2', email: 'bob@example.com' }),
      ]

      await act(async () => {
        render(<MemberManagementPage />)
      })

      const searchInput = screen.getByPlaceholderText('Tìm thành viên theo email...')
      await userEvent.type(searchInput, 'alice')

      await waitFor(() => {
        expect(screen.getByTestId('filtered-count')).toHaveTextContent('1 filtered')
      })
    })

    it('should toggle permissions in add modal', async () => {
      await act(async () => {
        render(<MemberManagementPage />)
      })

      await userEvent.click(screen.getByText('+ Thêm thành viên'))

      const checkInPerm = screen.getByText('Check-in')
      await userEvent.click(checkInPerm)

      // Click again to uncheck
      await userEvent.click(checkInPerm)

      // Should not crash
      expect(screen.getByText('Check-in')).toBeInTheDocument()
    })

    it('should close add modal when clicking cancel', async () => {
      await act(async () => {
        render(<MemberManagementPage />)
      })

      await userEvent.click(screen.getByText('+ Thêm thành viên'))
      expect(screen.getByText('Thêm thành viên mới')).toBeInTheDocument()

      const cancelBtn = screen.getByText('Hủy')
      await userEvent.click(cancelBtn)

      expect(screen.queryByText('Thêm thành viên mới')).not.toBeInTheDocument()
    })

    it('should close add modal when submit succeeds', async () => {
      const eventMemberSlice = require('../../../store/eventMemberSlice')
      eventMemberSlice.fetchAddEventMember.fulfilled.match = jest.fn(() => true)

      await act(async () => {
        render(<MemberManagementPage />)
      })

      await userEvent.click(screen.getByText('+ Thêm thành viên'))
      const emailInput = screen.getByPlaceholderText('example@email.com')
      await userEvent.type(emailInput, 'new@example.com')

      const submitBtn = screen.getByText('Thêm thành viên')
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.queryByText('Thêm thành viên mới')).not.toBeInTheDocument()
      })
    })

    it('should validate email format in add modal', async () => {
      await act(async () => {
        render(<MemberManagementPage />)
      })

      await userEvent.click(screen.getByText('+ Thêm thành viên'))
      const emailInput = screen.getByPlaceholderText('example@email.com')
      await userEvent.type(emailInput, 'invalid-email')

      const submitBtn = screen.getByText('Thêm thành viên')
      await userEvent.click(submitBtn)

      expect(screen.getByText('Email không hợp lệ.')).toBeInTheDocument()
    })

    it('should show error for empty email', async () => {
      await act(async () => {
        render(<MemberManagementPage />)
      })

      await userEvent.click(screen.getByText('+ Thêm thành viên'))

      const submitBtn = screen.getByText('Thêm thành viên')
      await userEvent.click(submitBtn)

      expect(screen.getByText('Vui lòng nhập email.')).toBeInTheDocument()
    })

    it('should show error for duplicate email', async () => {
      mockEventMemberState.members = [createMockMember({ email: 'existing@example.com' })]

      await act(async () => {
        render(<MemberManagementPage />)
      })

      await userEvent.click(screen.getByText('+ Thêm thành viên'))
      const emailInput = screen.getByPlaceholderText('example@email.com')
      await userEvent.type(emailInput, 'existing@example.com')

      const submitBtn = screen.getByText('Thêm thành viên')
      await userEvent.click(submitBtn)

      expect(screen.getByText('Thành viên này đã tồn tại trong đội ngũ.')).toBeInTheDocument()
    })

    it('should show warning for non-existent user (404)', async () => {
      const eventMemberSlice = require('../../../store/eventMemberSlice')
      eventMemberSlice.fetchAddEventMember.fulfilled.match = jest.fn(() => false)
      eventMemberSlice.fetchAddEventMember.rejected.match = jest.fn(() => true)

      mockDispatch.mockReturnValue({
        unwrap: () => Promise.reject({ payload: { status: 404 } }),
        payload: { status: 404 },
      })

      await act(async () => {
        render(<MemberManagementPage />)
      })

      await userEvent.click(screen.getByText('+ Thêm thành viên'))
      const emailInput = screen.getByPlaceholderText('example@email.com')
      await userEvent.type(emailInput, 'nonexistent@example.com')

      const submitBtn = screen.getByText('Thêm thành viên')
      await userEvent.click(submitBtn)

      const { notify } = require('../../../utils/notify')
      await waitFor(() => {
        expect(notify.warning).toHaveBeenCalledWith('Thành viên này không tồn tại')
      })
    })

    it('should reset form after successful add', async () => {
      const eventMemberSlice = require('../../../store/eventMemberSlice')
      eventMemberSlice.fetchAddEventMember.fulfilled.match = jest.fn(() => true)

      await act(async () => {
        render(<MemberManagementPage />)
      })

      await userEvent.click(screen.getByText('+ Thêm thành viên'))
      const emailInput = screen.getByPlaceholderText('example@email.com')
      await userEvent.type(emailInput, 'new@example.com')

      const submitBtn = screen.getByText('Thêm thành viên')
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.queryByText('Thêm thành viên mới')).not.toBeInTheDocument()
      })
    })

    it('should paginate through members', async () => {
      const members = Array.from({ length: 25 }, (_, i) =>
        createMockMember({ id: `m${i}`, email: `user${i}@example.com` })
      )
      mockEventMemberState.members = members

      await act(async () => {
        render(<MemberManagementPage />)
      })

      expect(screen.getByTestId('member-count')).toHaveTextContent('10 members')

      await userEvent.click(screen.getByTestId('page-next'))

      await waitFor(() => {
        expect(screen.getByTestId('current-page')).toHaveTextContent('2')
      })
    })
  })

  // --------------------------------------------------------------------------
  // 5. Data Display
  // --------------------------------------------------------------------------
  describe('Data Display', () => {
    it('should display members correctly', async () => {
      mockEventMemberState.members = [
        createMockMember({ email: 'alice@example.com' }),
        createMockMember({ email: 'bob@example.com' }),
      ]

      await act(async () => {
        render(<MemberManagementPage />)
      })

      expect(screen.getByTestId('member-count')).toHaveTextContent('2 members')
      expect(screen.getAllByTestId('member-item')).toHaveLength(2)
    })

    it('should paginate members with page size 10', async () => {
      const members = Array.from({ length: 15 }, (_, i) =>
        createMockMember({ id: `m${i}`, email: `user${i}@example.com` })
      )
      mockEventMemberState.members = members

      await act(async () => {
        render(<MemberManagementPage />)
      })

      expect(screen.getByTestId('member-count')).toHaveTextContent('10 members')
      expect(screen.getByTestId('total-pages')).toHaveTextContent('2')
    })

    it('should show empty filtered count when no members match search', async () => {
      mockEventMemberState.members = [createMockMember({ email: 'alice@example.com' })]

      await act(async () => {
        render(<MemberManagementPage />)
      })

      const searchInput = screen.getByPlaceholderText('Tìm thành viên theo email...')
      await userEvent.type(searchInput, 'nonexistent')

      await waitFor(() => {
        expect(screen.getByTestId('filtered-count')).toHaveTextContent('0 filtered')
      })
    })
  })

  // --------------------------------------------------------------------------
  // 6. Edge Cases
  // --------------------------------------------------------------------------
  describe('Edge Cases', () => {
    it('should handle members with no email', async () => {
      mockEventMemberState.members = [createMockMember({ email: null as any })]

      await act(async () => {
        render(<MemberManagementPage />)
      })

      expect(screen.getByTestId('member-count')).toHaveTextContent('1 members')
    })

    it('should handle adding member with loading state', async () => {
      mockEventMemberState.addingMember = true

      await act(async () => {
        render(<MemberManagementPage />)
      })

      await userEvent.click(screen.getByText('+ Thêm thành viên'))

      const submitBtn = screen.getByText('Đang thêm...')
      expect(submitBtn).toBeDisabled()
    })

    it('should reset page to 1 when search changes', async () => {
      const members = Array.from({ length: 25 }, (_, i) =>
        createMockMember({ id: `m${i}`, email: `user${i}@example.com` })
      )
      mockEventMemberState.members = members

      await act(async () => {
        render(<MemberManagementPage />)
      })

      // Go to page 2
      await userEvent.click(screen.getByTestId('page-next'))
      expect(screen.getByTestId('current-page')).toHaveTextContent('2')

      // Type in search
      const searchInput = screen.getByPlaceholderText('Tìm thành viên theo email...')
      await userEvent.type(searchInput, 'user1')

      // Should reset to page 1
      await waitFor(() => {
        expect(screen.getByTestId('current-page')).toHaveTextContent('1')
      })
    })

    it('should adjust page when filtered results have fewer pages', async () => {
      const members = Array.from({ length: 25 }, (_, i) =>
        createMockMember({ id: `m${i}`, email: `user${i}@example.com` })
      )
      mockEventMemberState.members = members

      await act(async () => {
        render(<MemberManagementPage />)
      })

      // Go to page 3
      await userEvent.click(screen.getByTestId('page-next'))
      await userEvent.click(screen.getByTestId('page-next'))
      expect(screen.getByTestId('current-page')).toHaveTextContent('3')

      // Filter to only 5 results (1 page)
      const searchInput = screen.getByPlaceholderText('Tìm thành viên theo email...')
      await userEvent.type(searchInput, 'user0')

      // Should adjust to page 1
      await waitFor(() => {
        expect(screen.getByTestId('current-page')).toHaveTextContent('1')
      })
    })

    it('should handle export failure', async () => {
      mockDispatch.mockReturnValue({ unwrap: () => Promise.reject(new Error('Export failed')) })

      await act(async () => {
        render(<MemberManagementPage />)
      })

      const exportBtn = screen.getByText('Xuất Excel')
      await userEvent.click(exportBtn)

      const { notify } = require('../../../utils/notify')
      await waitFor(() => {
        expect(notify.error).toHaveBeenCalledWith('Xuất Excel thất bại')
      })
    })

    it('should handle case-insensitive email search', async () => {
      mockEventMemberState.members = [
        createMockMember({ email: 'Alice@Example.com' }),
        createMockMember({ email: 'bob@example.com' }),
      ]

      await act(async () => {
        render(<MemberManagementPage />)
      })

      const searchInput = screen.getByPlaceholderText('Tìm thành viên theo email...')
      await userEvent.type(searchInput, 'ALICE')

      await waitFor(() => {
        expect(screen.getByTestId('filtered-count')).toHaveTextContent('1 filtered')
      })
    })
  })
})
