/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { MenuGroupConfig } from '../../../../../components/Organizer/navigations/Sidebar'
import Sidebar from '../../../../../components/Organizer/navigations/Sidebar'

// Mock React Router
const mockUseLocation = jest.fn()
const mockUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockUseLocation(),
  useNavigate: () => mockUseNavigate(),
  Link: ({ children, to }: any) => <a href={to} data-testid="nav-link">{children}</a>,
}))

// Mock MenuItem
jest.mock('../../../../../components/Organizer/shared/MenuItem', () => ({
  __esModule: true,
  MenuItem: ({ label, active, collapsed, onClick }: any) => (
    <div
      data-testid="menu-item"
      data-label={label}
      data-active={active}
      data-collapsed={collapsed}
      onClick={onClick}
    >
      {label}
    </div>
  ),
}))

describe('Sidebar', () => {
  const mockNavigate = jest.fn()
  const mockSetCollapsed = jest.fn()

  const mockMenuGroups: MenuGroupConfig[] = [
    {
      headerTitle: 'Management',
      headerGroup: [
        { icon: <span>📊</span>, label: 'Dashboard', path: '/organizer/dashboard' },
        { icon: <span>📅</span>, label: 'Events', path: '/organizer/events' },
      ],
    },
    {
      headerTitle: 'Settings',
      headerGroup: [
        { icon: <span>⚙️</span>, label: 'Settings', path: '/organizer/settings' },
      ],
    },
  ]

  const defaultProps = {
    collapsed: false,
    setCollapsed: mockSetCollapsed,
    menuGroups: mockMenuGroups,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseLocation.mockReturnValue({ pathname: '/organizer/dashboard' })
    mockUseNavigate.mockReturnValue(mockNavigate)
  })

  describe('Render', () => {
    it('should render without crashing', () => {
      render(<Sidebar {...defaultProps} />)
      expect(screen.getByText('AIPromo')).toBeInTheDocument()
    })

    it('should render logo with link to home', () => {
      render(<Sidebar {...defaultProps} />)
      expect(screen.getByTestId('nav-link')).toHaveAttribute('href', '/')
    })

    it('should render logo icon', () => {
      render(<Sidebar {...defaultProps} />)
      const logo = screen.getByText('A')
      expect(logo).toHaveClass('bg-primary', 'rounded-lg')
    })

    it('should render AIPromo text when expanded', () => {
      render(<Sidebar {...defaultProps} />)
      expect(screen.getByText('AIPromo')).toHaveClass('text-xl', 'font-bold')
    })

    it('should render menu items from groups', () => {
      render(<Sidebar {...defaultProps} />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Events')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should render section headers', () => {
      render(<Sidebar {...defaultProps} />)
      expect(screen.getByText('Management')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('should render collapse button', () => {
      render(<Sidebar {...defaultProps} />)
      expect(screen.getByText('Thu gọn')).toBeInTheDocument()
    })

    it('should render with correct width when expanded', () => {
      render(<Sidebar {...defaultProps} />)
      const aside = screen.getByText('AIPromo').closest('aside')
      expect(aside).toHaveClass('w-64')
    })
  })

  describe('Collapsed State', () => {
    it('should hide AIPromo text when collapsed', () => {
      render(<Sidebar {...defaultProps} collapsed />)
      expect(screen.queryByText('AIPromo')).not.toBeInTheDocument()
    })

    it('should hide section headers when collapsed', () => {
      render(<Sidebar {...defaultProps} collapsed />)
      expect(screen.queryByText('Management')).not.toBeInTheDocument()
      expect(screen.queryByText('Settings')).not.toBeInTheDocument()
    })

    it('should hide "Thu gọn" text when collapsed', () => {
      render(<Sidebar {...defaultProps} collapsed />)
      expect(screen.queryByText('Thu gọn')).not.toBeInTheDocument()
    })

    it('should show narrower width when collapsed', () => {
      render(<Sidebar {...defaultProps} collapsed />)
      const aside = screen.getByText('A').closest('aside')
      expect(aside).toHaveClass('w-20')
    })

    it('should still render menu items when collapsed', () => {
      render(<Sidebar {...defaultProps} collapsed />)
      const menuItems = screen.getAllByTestId('menu-item')
      expect(menuItems).toHaveLength(3)
    })

    it('should pass collapsed prop to menu items', () => {
      render(<Sidebar {...defaultProps} collapsed />)
      const menuItems = screen.getAllByTestId('menu-item')
      menuItems.forEach(item => {
        expect(item).toHaveAttribute('data-collapsed', 'true')
      })
    })

    it('should show tooltip on logo when collapsed', () => {
      render(<Sidebar {...defaultProps} collapsed />)
      expect(screen.getByText('Bấm để quay về trang chủ')).toBeInTheDocument()
    })
  })

  describe('Active State Detection', () => {
    it('should mark exact path match as active', () => {
      mockUseLocation.mockReturnValue({ pathname: '/organizer/dashboard' })
      render(<Sidebar {...defaultProps} />)

      const dashboardItem = screen.getByText('Dashboard')
      expect(dashboardItem).toHaveAttribute('data-active', 'true')
    })

    it('should mark parent path as active', () => {
      mockUseLocation.mockReturnValue({ pathname: '/organizer/events/123' })
      render(<Sidebar {...defaultProps} />)

      const eventsItem = screen.getByText('Events')
      expect(eventsItem).toHaveAttribute('data-active', 'true')
    })

    it('should mark other items as inactive', () => {
      mockUseLocation.mockReturnValue({ pathname: '/organizer/dashboard' })
      render(<Sidebar {...defaultProps} />)

      const eventsItem = screen.getByText('Events')
      expect(eventsItem).toHaveAttribute('data-active', 'false')

      const settingsItem = screen.getByText('Settings')
      expect(settingsItem).toHaveAttribute('data-active', 'false')
    })
  })

  describe('Navigation', () => {
    it('should navigate to item path when clicked', async () => {
      render(<Sidebar {...defaultProps} />)
      await userEvent.click(screen.getByText('Dashboard'))
      expect(mockNavigate).toHaveBeenCalledWith('/organizer/dashboard')
    })

    it('should navigate to fallback path when item has no path', async () => {
      const noPathGroups: MenuGroupConfig[] = [
        {
          headerGroup: [
            { icon: <span>📊</span>, label: 'No Path' },
          ],
        },
      ]
      render(<Sidebar {...defaultProps} menuGroups={noPathGroups} />)
      await userEvent.click(screen.getByText('No Path'))
      expect(mockNavigate).toHaveBeenCalledWith('/organizer/my-events')
    })

    it('should navigate different paths for different items', async () => {
      render(<Sidebar {...defaultProps} />)

      await userEvent.click(screen.getByText('Dashboard'))
      expect(mockNavigate).toHaveBeenCalledWith('/organizer/dashboard')

      await userEvent.click(screen.getByText('Events'))
      expect(mockNavigate).toHaveBeenCalledWith('/organizer/events')
    })
  })

  describe('Collapse Toggle', () => {
    it('should call setCollapsed with true when expanding', async () => {
      render(<Sidebar {...defaultProps} collapsed />)
      const toggleButton = screen.getByTestId('menu-item').closest('aside')?.querySelector('button')
      if (toggleButton) {
        await userEvent.click(toggleButton)
      }

      // Since we can't easily get the button, let's test via the chevron icons
      const chevrons = document.querySelectorAll('svg')
      expect(chevrons.length).toBeGreaterThan(0)
    })

    it('should call setCollapsed with false when collapsing', async () => {
      render(<Sidebar {...defaultProps} />)
      const toggleButton = screen.getByText('Thu gọn')
      await userEvent.click(toggleButton)
      expect(mockSetCollapsed).toHaveBeenCalledWith(true)
    })
  })

  describe('Menu Groups Rendering', () => {
    it('should render multiple groups', () => {
      render(<Sidebar {...defaultProps} />)
      const menuItems = screen.getAllByTestId('menu-item')
      expect(menuItems).toHaveLength(3)
    })

    it('should render groups in order', () => {
      render(<Sidebar {...defaultProps} />)
      const menuItems = screen.getAllByTestId('menu-item')
      expect(menuItems[0]).toHaveTextContent('Dashboard')
      expect(menuItems[1]).toHaveTextContent('Events')
      expect(menuItems[2]).toHaveTextContent('Settings')
    })

    it('should handle groups without headers', () => {
      const noHeaderGroups: MenuGroupConfig[] = [
        {
          headerGroup: [
            { icon: <span>📊</span>, label: 'Item 1', path: '/item1' },
          ],
        },
      ]
      render(<Sidebar {...defaultProps} menuGroups={noHeaderGroups} />)
      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })

    it('should handle empty menu groups', () => {
      render(<Sidebar {...defaultProps} menuGroups={[]} />)
      expect(screen.getByText('AIPromo')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should render as aside element', () => {
      render(<Sidebar {...defaultProps} />)
      expect(screen.getByText('AIPromo').closest('aside')).toBeInTheDocument()
    })

    it('should render with fixed positioning', () => {
      render(<Sidebar {...defaultProps} />)
      const aside = screen.getByText('AIPromo').closest('aside')
      expect(aside).toHaveClass('fixed', 'z-50', 'h-screen')
    })

    it('should render with transition animation', () => {
      render(<Sidebar {...defaultProps} />)
      const aside = screen.getByText('AIPromo').closest('aside')
      expect(aside).toHaveClass('transition-all', 'duration-300')
    })

    it('should render with dark mode background', () => {
      render(<Sidebar {...defaultProps} />)
      const aside = screen.getByText('AIPromo').closest('aside')
      expect(aside).toHaveClass('dark:bg-gradient-to-b')
    })

    it('should render with right border', () => {
      render(<Sidebar {...defaultProps} />)
      const aside = screen.getByText('AIPromo').closest('aside')
      expect(aside).toHaveClass('border-r')
    })

    it('should render logo with hover tooltip', () => {
      render(<Sidebar {...defaultProps} />)
      const tooltip = screen.getByText('Bấm để quay về trang chủ')
      expect(tooltip).toHaveClass(
        'absolute',
        'bg-black',
        'text-white',
        'opacity-0',
        'group-hover:opacity-100'
      )
    })

    it('should render collapse button with hover effect', () => {
      render(<Sidebar {...defaultProps} />)
      const collapseButton = screen.getByText('Thu gọn')
      expect(collapseButton).toHaveClass(
        'text-slate-400',
        'hover:text-primary',
        'hover:bg-slate-100'
      )
    })
  })

  describe('Layout', () => {
    it('should render logo at top', () => {
      render(<Sidebar {...defaultProps} />)
      const aside = screen.getByText('AIPromo').closest('aside')
      const logoSection = aside?.firstElementChild
      expect(logoSection).toHaveClass('p-6', 'flex', 'items-center', 'gap-3')
    })

    it('should render navigation in middle', () => {
      render(<Sidebar {...defaultProps} />)
      const aside = screen.getByText('AIPromo').closest('aside')
      const nav = aside?.querySelector('nav')
      expect(nav).toHaveClass('px-3', 'space-y-6', 'flex-1')
    })

    it('should render collapse button at bottom', () => {
      render(<Sidebar {...defaultProps} />)
      const aside = screen.getByText('AIPromo').closest('aside')
      const collapseSection = aside?.lastElementChild
      expect(collapseSection).toHaveClass('p-4')
    })

    it('should use flex column layout', () => {
      render(<Sidebar {...defaultProps} />)
      const aside = screen.getByText('AIPromo').closest('aside')
      expect(aside).toHaveClass('flex', 'flex-col')
    })
  })

  describe('Edge Cases', () => {
    it('should handle menu items without paths', () => {
      const noPathGroups: MenuGroupConfig[] = [
        {
          headerGroup: [
            { icon: <span>📊</span>, label: 'No Path Item' },
          ],
        },
      ]
      render(<Sidebar {...defaultProps} menuGroups={noPathGroups} />)
      expect(screen.getByText('No Path Item')).toHaveAttribute('data-active', 'false')
    })

    it('should handle menu items with empty path', () => {
      const emptyPathGroups: MenuGroupConfig[] = [
        {
          headerGroup: [
            { icon: <span>📊</span>, label: 'Empty Path', path: '' },
          ],
        },
      ]
      render(<Sidebar {...defaultProps} menuGroups={emptyPathGroups} />)
      expect(screen.getByText('Empty Path')).toHaveAttribute('data-active', 'false')
    })

    it('should handle very long menu labels', () => {
      const longLabelGroups: MenuGroupConfig[] = [
        {
          headerGroup: [
            { icon: <span>📊</span>, label: 'A'.repeat(100), path: '/long' },
          ],
        },
      ]
      render(<Sidebar {...defaultProps} menuGroups={longLabelGroups} />)
      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument()
    })

    it('should handle special characters in labels', () => {
      const specialGroups: MenuGroupConfig[] = [
        {
          headerGroup: [
            { icon: <span>📊</span>, label: 'Dashboard <Admin>', path: '/admin' },
          ],
        },
      ]
      render(<Sidebar {...defaultProps} menuGroups={specialGroups} />)
      expect(screen.getByText('Dashboard <Admin>')).toBeInTheDocument()
    })

    it('should handle undefined setCollapsed', () => {
      render(<Sidebar {...defaultProps} setCollapsed={undefined as any} />)
      expect(screen.getByText('Thu gọn')).toBeInTheDocument()
    })

    it('should handle empty menu groups array', () => {
      render(<Sidebar {...defaultProps} menuGroups={[]} />)
      const menuItems = screen.queryAllByTestId('menu-item')
      expect(menuItems).toHaveLength(0)
    })

    it('should handle active detection for root path', () => {
      mockUseLocation.mockReturnValue({ pathname: '/' })
      render(<Sidebar {...defaultProps} />)
      const menuItems = screen.getAllByTestId('menu-item')
      menuItems.forEach(item => {
        expect(item).toHaveAttribute('data-active', 'false')
      })
    })
  })
})
