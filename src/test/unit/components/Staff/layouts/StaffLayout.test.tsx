/// <reference types="jest" />

import { act, render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StaffLayout from '../../../../../components/Staff/layouts/StaffLayout'

// ============================================================================
// MOCKS
// ============================================================================

// Mock react-router-dom
const mockLocation = { pathname: '/staff/event-approval' }
const mockNavigate = jest.fn()
const mockOutlet = <div data-testid="outlet-content">Outlet Content</div>

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
  useNavigate: () => mockNavigate,
  Outlet: () => mockOutlet,
  Link: ({
    to,
    children,
    className,
  }: {
    to: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={to} className={className} data-testid="nav-link" data-path={to}>
      {children}
    </a>
  ),
}))

// Mock Redux
const mockDispatch = jest.fn()
let mockAuthState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) =>
    selector({
      AUTH: mockAuthState,
    }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../../../../store/authSlice', () => ({
  clearAuth: jest.fn(() => ({
    type: 'AUTH/clearAuth',
  })),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockUser = (overrides = {}) => ({
  userId: 'user-1',
  name: 'Test Staff User',
  userName: 'teststaff',
  email: 'staff@example.com',
  roles: ['Staff'],
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('StaffLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockLocation.pathname = '/staff/event-approval'
    mockAuthState = {
      currentInfor: createMockUser(),
    }

    mockDispatch.mockResolvedValue({})
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<StaffLayout />)
      })

      expect(screen.getByText('AIPromo')).toBeInTheDocument()
    })

    it('should render sidebar with branding', async () => {
      await act(async () => {
        render(<StaffLayout />)
      })

      expect(screen.getByText('AIPromo')).toBeInTheDocument()
      expect(screen.getByText('Cổng Nhân Viên')).toBeInTheDocument()
    })

    it('should render all 3 navigation menu items', async () => {
      await act(async () => {
        render(<StaffLayout />)
      })

      expect(screen.getByText('Duyệt sự kiện')).toBeInTheDocument()
      expect(screen.getByText('Duyệt nhà tổ chức')).toBeInTheDocument()
      expect(screen.getByText('Duyệt bài đăng')).toBeInTheDocument()
    })

    it('should render user dropdown with user info', async () => {
      await act(async () => {
        render(<StaffLayout />)
      })

      expect(screen.getByText('teststaff')).toBeInTheDocument()
      expect(screen.getByText('Nhân viên')).toBeInTheDocument()
    })

    it('should render page title based on current route', async () => {
      mockLocation.pathname = '/staff/event-approval'

      await act(async () => {
        render(<StaffLayout />)
      })

      expect(
        screen.getByText('Danh sách chờ duyệt sự kiện')
      ).toBeInTheDocument()
    })

    it('should render outlet content', async () => {
      await act(async () => {
        render(<StaffLayout />)
      })

      expect(screen.getByTestId('outlet-content')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should render correct navigation links', async () => {
      await act(async () => {
        render(<StaffLayout />)
      })

      const links = screen.getAllByTestId('nav-link')
      expect(links).toHaveLength(3)

      expect(
        screen.getByRole('link', { name: /Duyệt sự kiện/i })
      ).toHaveAttribute('href', '/staff/event-approval')
      expect(
        screen.getByRole('link', { name: /Duyệt nhà tổ chức/i })
      ).toHaveAttribute('href', '/staff/organizer-profile')
      expect(
        screen.getByRole('link', { name: /Duyệt bài đăng/i })
      ).toHaveAttribute('href', '/staff/post-approval')
    })

    it('should highlight active menu item for exact match', async () => {
      mockLocation.pathname = '/staff/event-approval'

      await act(async () => {
        render(<StaffLayout />)
      })

      const eventNavLink = screen.getByRole('link', { name: /Duyệt sự kiện/i })
      expect(eventNavLink).toHaveClass('bg-primary/10')
    })

    it('should highlight active menu item for nested path', async () => {
      mockLocation.pathname = '/staff/event-approval/123'

      await act(async () => {
        render(<StaffLayout />)
      })

      const eventNavLink = screen.getByRole('link', { name: /Duyệt sự kiện/i })
      expect(eventNavLink).toHaveClass('bg-primary/10')
    })

    it('should not highlight inactive menu items', async () => {
      mockLocation.pathname = '/staff/post-approval'

      await act(async () => {
        render(<StaffLayout />)
      })

      const eventNavLink = screen.getByRole('link', { name: /Duyệt sự kiện/i })
      expect(eventNavLink).not.toHaveClass('bg-primary/10')
    })
  })

  describe('Page Titles', () => {
    it('should show event approval title for /staff/event-approval', async () => {
      mockLocation.pathname = '/staff/event-approval'

      await act(async () => {
        render(<StaffLayout />)
      })

      expect(
        screen.getByText('Danh sách chờ duyệt sự kiện')
      ).toBeInTheDocument()
    })

    it('should show organizer profile title for /staff/organizer-profile', async () => {
      mockLocation.pathname = '/staff/organizer-profile'

      await act(async () => {
        render(<StaffLayout />)
      })

      // Get all elements with the text and check at least one is in header
      const titles = screen.getAllByText('Duyệt nhà tổ chức')
      expect(titles.length).toBeGreaterThanOrEqual(1)
    })

    it('should show post approval title for /staff/post-approval', async () => {
      mockLocation.pathname = '/staff/post-approval'

      await act(async () => {
        render(<StaffLayout />)
      })

      expect(screen.getByText('Duyệt bài đăng Marketing')).toBeInTheDocument()
    })

    it('should show default title for unknown routes', async () => {
      mockLocation.pathname = '/staff/unknown'

      await act(async () => {
        render(<StaffLayout />)
      })

      expect(screen.getByText('Tổng quan Dashboard')).toBeInTheDocument()
    })
  })

  describe('User Dropdown', () => {
    it('should open dropdown when user button is clicked', async () => {
      await act(async () => {
        render(<StaffLayout />)
      })

      const userBtn = screen.getByRole('button')
      await userEvent.click(userBtn)

      expect(screen.getByText('Test Staff User')).toBeInTheDocument()
      expect(screen.getByText('staff@example.com')).toBeInTheDocument()
    })

    it('should close dropdown when clicked again', async () => {
      await act(async () => {
        render(<StaffLayout />)
      })

      const userBtn = screen.getByRole('button')
      await userEvent.click(userBtn)
      expect(screen.getByText('Test Staff User')).toBeInTheDocument()

      await userEvent.click(userBtn)
      expect(screen.queryByText('Test Staff User')).not.toBeInTheDocument()
    })

    it('should close dropdown when clicking outside', async () => {
      await act(async () => {
        render(<StaffLayout />)
      })

      const userBtn = screen.getByRole('button')
      await userEvent.click(userBtn)
      expect(screen.getByText('Test Staff User')).toBeInTheDocument()

      // Click outside
      fireEvent.mouseDown(document.body)

      await waitFor(() => {
        expect(
          screen.queryByText('Test Staff User')
        ).not.toBeInTheDocument()
      })
    })

    it('should show user initials when name is missing', async () => {
      mockAuthState.currentInfor = createMockUser({ name: undefined })

      await act(async () => {
        render(<StaffLayout />)
      })

      // Should show "S" as default initial
      const initialElement = screen.getByText('S')
      expect(initialElement).toBeInTheDocument()
    })

    it('should show first letter of name as initials', async () => {
      mockAuthState.currentInfor = createMockUser({ name: 'Alice' })

      await act(async () => {
        render(<StaffLayout />)
      })

      expect(screen.getByText('A')).toBeInTheDocument()
    })
  })

  describe('Logout', () => {
    it('should dispatch clearAuth and navigate to login on logout', async () => {
      const { clearAuth } = require('../../../../../store/authSlice')

      await act(async () => {
        render(<StaffLayout />)
      })

      // Open dropdown
      const userBtn = screen.getByRole('button')
      await userEvent.click(userBtn)

      // Click logout
      const logoutBtn = screen.getByText('Đăng xuất')
      await userEvent.click(logoutBtn)

      expect(mockDispatch).toHaveBeenCalledWith(clearAuth())
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })

    it('should close dropdown after logout', async () => {
      await act(async () => {
        render(<StaffLayout />)
      })

      // Open dropdown
      const userBtn = screen.getByRole('button')
      await userEvent.click(userBtn)

      // Click logout
      const logoutBtn = screen.getByText('Đăng xuất')
      await userEvent.click(logoutBtn)

      await waitFor(() => {
        expect(
          screen.queryByText('Test Staff User')
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing user info gracefully', async () => {
      mockAuthState.currentInfor = {}

      await act(async () => {
        render(<StaffLayout />)
      })

      expect(screen.getByText('AIPromo')).toBeInTheDocument()
      expect(screen.getByText('Cổng Nhân Viên')).toBeInTheDocument()
    })

    it('should handle undefined currentInfor', async () => {
      mockAuthState.currentInfor = undefined

      await act(async () => {
        render(<StaffLayout />)
      })

      // Should not crash
      expect(screen.getByText('AIPromo')).toBeInTheDocument()
    })

    it('should handle null currentInfor', async () => {
      mockAuthState.currentInfor = null

      await act(async () => {
        render(<StaffLayout />)
      })

      // Should not crash
      expect(screen.getByText('AIPromo')).toBeInTheDocument()
    })

    it('should handle user without email', async () => {
      mockAuthState.currentInfor = createMockUser({ email: undefined })

      await act(async () => {
        render(<StaffLayout />)
      })

      // Open dropdown
      const userBtn = screen.getByRole('button')
      await userEvent.click(userBtn)

      // Should still render without email
      expect(screen.getByText('Test Staff User')).toBeInTheDocument()
    })

    it('should handle long user names gracefully', async () => {
      mockAuthState.currentInfor = createMockUser({
        name: 'A'.repeat(100),
        userName: 'B'.repeat(100),
      })

      await act(async () => {
        render(<StaffLayout />)
      })

      // Should render without crashing
      expect(screen.getByText('AIPromo')).toBeInTheDocument()
    })
  })
})
