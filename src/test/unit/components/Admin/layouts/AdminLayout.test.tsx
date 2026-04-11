/// <reference types="jest" />
import React from 'react'
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminLayout from '../../../../../components/Admin/layouts/AdminLayout'

const mockDispatch = jest.fn()
let mockAuthState: any = {}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ pathname: '/admin' }),
  useNavigate: () => jest.fn(),
  Outlet: () => <div data-testid="outlet" />,
  Link: ({ children, to }: any) => <a href={to} data-testid="link">{children}</a>,
}))

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ AUTH: mockAuthState }),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-icons/md', () => ({
  MdDashboard: () => <span data-testid="icon-dashboard" />,
  MdGroup: () => <span data-testid="icon-group" />,
  MdGavel: () => <span data-testid="icon-gavel" />,
  MdPayments: () => <span data-testid="icon-payments" />,
  MdAssignmentReturn: () => <span data-testid="icon-return" />,
  MdRocketLaunch: () => <span data-testid="icon-rocket" />,
  MdAutoAwesome: () => <span data-testid="icon-auto" />,
  MdCategory: () => <span data-testid="icon-category" />,
  MdLocalOffer: () => <span data-testid="icon-offer" />,
  MdAccountBalanceWallet: () => <span data-testid="icon-wallet" />,
  MdLogout: () => <span data-testid="icon-logout" />,
  MdKeyboardArrowDown: () => <span data-testid="icon-arrow-down" />,
  MdChevronLeft: () => <span data-testid="icon-left" />,
  MdChevronRight: () => <span data-testid="icon-right" />,
  MdPolicy: () => <span data-testid="icon-policy" />,
}))

describe('AdminLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
    mockAuthState = {
      currentInfor: { name: 'Admin User', email: 'admin@example.com' },
    }
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<AdminLayout />)
      })
      expect(screen.getByText('AIPromo Admin')).toBeInTheDocument()
    })

    it('should display welcome message', async () => {
      await act(async () => {
        render(<AdminLayout />)
      })
      expect(screen.getByText(/Chào mừng đến với trung tâm giám sát/)).toBeInTheDocument()
    })

    it('should render navigation items', async () => {
      await act(async () => {
        render(<AdminLayout />)
      })
      expect(screen.getByText('Tổng quan')).toBeInTheDocument()
      expect(screen.getByText('Quản lý Người dùng')).toBeInTheDocument()
    })

    it('should display user name', async () => {
      await act(async () => {
        render(<AdminLayout />)
      })
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })
  })
})
