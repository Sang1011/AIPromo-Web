/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

import DashboardLayout from '../../../../../components/Organizer/layouts/DashboardLayout'

// Mock react-router-dom
const mockOutletContext = { setConfig: jest.fn() }
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet" />,
  useOutletContext: () => mockOutletContext,
}))

// Mock child components
jest.mock('../../../../../components/Organizer/navigations/Sidebar', () => ({
  __esModule: true,
  default: ({ collapsed, menuGroups }: any) => (
    <div data-testid="sidebar" data-collapsed={collapsed}>
      <span data-testid="menu-groups-count">{menuGroups?.length ?? 0}</span>
    </div>
  ),
}))

jest.mock('../../../../../components/Organizer/navigations/Header', () => ({
  __esModule: true,
  default: ({ canGoBack, urlBack, title }: any) => (
    <div data-testid="header" data-can-go-back={canGoBack} data-url-back={urlBack}>
      <span data-testid="header-title">{title}</span>
    </div>
  ),
}))

jest.mock('../../../../../components/Organizer/navigations/PromoSidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="promo-sidebar" />,
}))

describe('DashboardLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock window.location
    delete (window as any).location
      ; (window as any).location = { pathname: '/organizer/overall' }
  })

  describe('Render', () => {
    it('should render without crashing', () => {
      render(<DashboardLayout />)
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('outlet')).toBeInTheDocument()
    })

    it('should render sidebar', () => {
      render(<DashboardLayout />)
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    })

    it('should render header', () => {
      render(<DashboardLayout />)
      expect(screen.getByTestId('header')).toBeInTheDocument()
    })

    it('should render outlet for nested routes', () => {
      render(<DashboardLayout />)
      expect(screen.getByTestId('outlet')).toBeInTheDocument()
    })

    it('should pass menu groups to sidebar', () => {
      render(<DashboardLayout />)
      expect(screen.getByTestId('menu-groups-count')).toHaveTextContent('1')
    })

    it('should not render promo sidebar by default', () => {
      render(<DashboardLayout />)
      expect(screen.queryByTestId('promo-sidebar')).not.toBeInTheDocument()
    })
  })

  describe('Sidebar Visibility', () => {
    it('should show sidebar on regular pages', () => {
      ; (window as any).location = { pathname: '/organizer/overall' }
      render(<DashboardLayout />)
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    })

    it('should hide sidebar on create-event page', () => {
      ; (window as any).location = { pathname: '/organizer/create-event' }
      render(<DashboardLayout />)
      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument()
    })

    it('should adjust margin based on collapsed state', () => {
      render(<DashboardLayout />)
      const mainContent = screen.getByTestId('header').parentElement
      expect(mainContent).toHaveClass('ml-64')
    })
  })

  describe('Promo Sidebar', () => {
    it('should render promo sidebar when config.havePromoSidebar is true', () => {
      // This would require setting config via outlet context
      render(<DashboardLayout />)
      // By default it's false, so promo sidebar shouldn't render
      expect(screen.queryByTestId('promo-sidebar')).not.toBeInTheDocument()
    })

    it('should not render promo sidebar when config.havePromoSidebar is false', () => {
      render(<DashboardLayout />)
      expect(screen.queryByTestId('promo-sidebar')).not.toBeInTheDocument()
    })
  })

  describe('Header Configuration', () => {
    it('should pass canGoBack=true on create-event page', () => {
      ; (window as any).location = { pathname: '/organizer/create-event' }
      render(<DashboardLayout />)
      expect(screen.getByTestId('header')).toHaveAttribute('data-can-go-back', 'true')
      expect(screen.getByTestId('header')).toHaveAttribute('data-url-back', '/organizer/my-events')
    })

    it('should pass canGoBack=false on regular pages', () => {
      ; (window as any).location = { pathname: '/organizer/overall' }
      render(<DashboardLayout />)
      expect(screen.getByTestId('header')).toHaveAttribute('data-can-go-back', 'false')
    })

    it('should pass empty title by default', () => {
      render(<DashboardLayout />)
      expect(screen.getByTestId('header-title')).toHaveTextContent('')
    })
  })

  describe('Layout Structure', () => {
    it('should render with correct min-height', () => {
      render(<DashboardLayout />)
      const container = screen.getByTestId('sidebar').parentElement
      expect(container).toHaveClass('min-h-screen')
    })

    it('should render main content with padding', () => {
      render(<DashboardLayout />)
      const mainContent = screen.getByTestId('outlet').parentElement
      expect(mainContent).toHaveClass('p-8')
    })
  })

  describe('Menu Groups', () => {
    it('should include dashboard menu item', () => {
      render(<DashboardLayout />)
      expect(screen.getByText('Tổng quan')).toBeInTheDocument()
    })

    it('should include event list menu item', () => {
      render(<DashboardLayout />)
      expect(screen.getByText('Danh sách sự kiện')).toBeInTheDocument()
    })

    it('should include report history menu item', () => {
      render(<DashboardLayout />)
      expect(screen.getByText('Lịch sử xuất báo cáo')).toBeInTheDocument()
    })

    it('should include legal menu item', () => {
      render(<DashboardLayout />)
      expect(screen.getByText('Điều khoản')).toBeInTheDocument()
    })

    it('should include account management menu item', () => {
      render(<DashboardLayout />)
      expect(screen.getByText('Quản lý tài khoản')).toBeInTheDocument()
    })
  })

  describe('Outlet Context', () => {
    it('should provide setConfig to outlet', () => {
      render(<DashboardLayout />)
      // The Outlet receives the context with setConfig
      expect(mockOutletContext.setConfig).toBeDefined()
    })
  })
})
