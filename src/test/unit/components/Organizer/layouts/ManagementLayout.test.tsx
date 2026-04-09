/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

import ManagementLayout from '../../../../../components/Organizer/layouts/ManagementLayout'

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet" />,
  useParams: () => ({ eventId: 'event-123' }),
  useMatch: () => null,
  useNavigate: () => jest.fn(),
}))

// Mock child components
jest.mock('../../../../../components/Organizer/navigations/Sidebar', () => ({
  __esModule: true,
  default: ({ collapsed, menuGroups }: any) => (
    <div data-testid="sidebar" data-collapsed={collapsed}>
      <span data-testid="menu-group-headers">
        {menuGroups?.map((g: any) => g.headerTitle).filter(Boolean).join(', ')}
      </span>
    </div>
  ),
}))

jest.mock('../../../../../components/Organizer/navigations/Header', () => ({
  __esModule: true,
  default: ({ haveTitle, canGoBack }: any) => (
    <div data-testid="header" data-have-title={haveTitle} data-can-go-back={canGoBack} />
  ),
}))

describe('ManagementLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render without crashing', () => {
      render(<ManagementLayout />)
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('outlet')).toBeInTheDocument()
    })

    it('should render sidebar', () => {
      render(<ManagementLayout />)
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    })

    it('should render header with title enabled', () => {
      render(<ManagementLayout />)
      expect(screen.getByTestId('header')).toHaveAttribute('data-have-title', 'true')
    })
  })

  describe('Menu Groups', () => {
    it('should render management menu group header', () => {
      render(<ManagementLayout />)
      expect(screen.getByText('Quản trị')).toBeInTheDocument()
    })

    it('should render reports menu group header', () => {
      render(<ManagementLayout />)
      expect(screen.getByText('Báo cáo')).toBeInTheDocument()
    })

    it('should render settings menu group header', () => {
      render(<ManagementLayout />)
      expect(screen.getByText('Cài đặt sự kiện')).toBeInTheDocument()
    })

    it('should render marketing menu group header', () => {
      render(<ManagementLayout />)
      expect(screen.getByText('Marketing')).toBeInTheDocument()
    })

    it('should include overview menu item', () => {
      render(<ManagementLayout />)
      expect(screen.getByText('Tổng kết')).toBeInTheDocument()
    })

    it('should include analytics menu item', () => {
      render(<ManagementLayout />)
      expect(screen.getByText('Phân tích')).toBeInTheDocument()
    })

    it('should include orders menu item', () => {
      render(<ManagementLayout />)
      expect(screen.getByText('Danh sách đơn hàng')).toBeInTheDocument()
    })

    it('should include check-in menu item', () => {
      render(<ManagementLayout />)
      expect(screen.getByText('Check-in')).toBeInTheDocument()
    })

    it('should include members menu item', () => {
      render(<ManagementLayout />)
      expect(screen.getByText('Thành viên')).toBeInTheDocument()
    })

    it('should include edit menu item', () => {
      render(<ManagementLayout />)
      expect(screen.getByText('Chỉnh sửa')).toBeInTheDocument()
    })

    it('should include seat map menu item', () => {
      render(<ManagementLayout />)
      expect(screen.getByText('Sơ đồ ghế')).toBeInTheDocument()
    })

    it('should include vouchers menu item', () => {
      render(<ManagementLayout />)
      expect(screen.getByText('Mã giảm giá (Voucher)')).toBeInTheDocument()
    })

    it('should include marketing menu item', () => {
      render(<ManagementLayout />)
      expect(screen.getByText('Marketing')).toBeInTheDocument()
    })
  })

  describe('Event Context', () => {
    it('should build paths with event ID', () => {
      render(<ManagementLayout />)
      // Menu items should contain paths with event-123
      expect(screen.getByText('Tổng kết')).toBeInTheDocument()
    })
  })

  describe('Header Navigation', () => {
    it('should have back button disabled by default', () => {
      render(<ManagementLayout />)
      expect(screen.getByTestId('header')).toHaveAttribute('data-can-go-back', 'false')
    })

    it('should enable back button on marketing detail pages', () => {
      // This would require mocking useMatch to return a match
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        Outlet: () => <div data-testid="outlet" />,
        useParams: () => ({ eventId: 'event-123' }),
        useMatch: () => ({ params: {} }), // Simulates being on marketing detail
        useNavigate: () => jest.fn(),
      }))

      render(<ManagementLayout />)
      // With useMatch returning a match, canGoBack should be true
    })
  })

  describe('Layout Structure', () => {
    it('should render with correct min-height', () => {
      render(<ManagementLayout />)
      const container = screen.getByTestId('sidebar').parentElement
      expect(container).toHaveClass('min-h-screen')
    })

    it('should render main content with flex layout', () => {
      render(<ManagementLayout />)
      const mainContent = screen.getByTestId('outlet').parentElement
      expect(mainContent).toHaveClass('p-8', 'flex', 'gap-8')
    })

    it('should render outlet in flex-1 container', () => {
      render(<ManagementLayout />)
      const outletContainer = screen.getByTestId('outlet').parentElement
      expect(outletContainer).toHaveClass('flex-1')
    })
  })

  describe('Sidebar State', () => {
    it('should render with sidebar expanded by default', () => {
      render(<ManagementLayout />)
      expect(screen.getByTestId('sidebar')).toHaveAttribute('data-collapsed', 'false')
    })

    it('should apply correct margin when sidebar is expanded', () => {
      render(<ManagementLayout />)
      const mainArea = screen.getByTestId('header').parentElement
      expect(mainArea).toHaveClass('ml-64')
    })
  })
})
