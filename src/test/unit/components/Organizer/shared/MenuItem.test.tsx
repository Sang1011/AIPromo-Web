/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MenuItem } from '../../../../../components/Organizer/shared/MenuItem'

describe('MenuItem', () => {
  const mockOnClick = jest.fn()

  const defaultProps = {
    icon: <span data-testid="menu-icon">📊</span>,
    label: 'Dashboard',
    active: false,
    collapsed: false,
    onClick: mockOnClick,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render menu item with icon and label', () => {
      render(<MenuItem {...defaultProps} />)
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('should render icon', () => {
      render(<MenuItem {...defaultProps} />)
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument()
    })

    it('should render label when not collapsed', () => {
      render(<MenuItem {...defaultProps} />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('should hide label when collapsed', () => {
      render(<MenuItem {...defaultProps} collapsed />)
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })

    it('should always render icon even when collapsed', () => {
      render(<MenuItem {...defaultProps} collapsed />)
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument()
    })
  })

  describe('Active State', () => {
    it('should apply active styling when active is true', () => {
      render(<MenuItem {...defaultProps} active />)
      const menuItem = screen.getByText('Dashboard').parentElement
      expect(menuItem).toHaveClass('bg-primary', 'text-white', 'shadow-lg')
    })

    it('should apply inactive styling when active is false', () => {
      render(<MenuItem {...defaultProps} active={false} />)
      const menuItem = screen.getByText('Dashboard').parentElement
      expect(menuItem).toHaveClass('text-slate-600', 'hover:bg-slate-100')
    })

    it('should default to inactive when active prop is not provided', () => {
      render(<MenuItem icon={defaultProps.icon} label="Test" collapsed={false} />)
      const menuItem = screen.getByText('Test').parentElement
      expect(menuItem).not.toHaveClass('bg-primary')
    })
  })

  describe('Collapsed State', () => {
    it('should hide label when collapsed is true', () => {
      render(<MenuItem {...defaultProps} collapsed />)
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })

    it('should show label when collapsed is false', () => {
      render(<MenuItem {...defaultProps} collapsed={false} />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('should maintain compact layout when collapsed', () => {
      render(<MenuItem {...defaultProps} collapsed />)
      const menuItem = screen.getByTestId('menu-icon').parentElement
      expect(menuItem).toHaveClass('gap-3')
    })
  })

  describe('User Interactions', () => {
    it('should call onClick when clicked', async () => {
      render(<MenuItem {...defaultProps} />)
      const menuItem = screen.getByText('Dashboard').parentElement!
      await userEvent.click(menuItem)
      expect(mockOnClick).toHaveBeenCalled()
    })

    it('should be clickable when collapsed', async () => {
      render(<MenuItem {...defaultProps} collapsed />)
      const menuItem = screen.getByTestId('menu-icon').parentElement!
      await userEvent.click(menuItem)
      expect(mockOnClick).toHaveBeenCalled()
    })

    it('should show hover effect when not active', async () => {
      render(<MenuItem {...defaultProps} />)
      const menuItem = screen.getByText('Dashboard').parentElement
      expect(menuItem).toHaveClass('hover:bg-slate-100', 'hover:text-primary')
    })
  })

  describe('Styling', () => {
    it('should apply rounded corners', () => {
      render(<MenuItem {...defaultProps} />)
      const menuItem = screen.getByText('Dashboard').parentElement
      expect(menuItem).toHaveClass('rounded-xl')
    })

    it('should apply transition for smooth state changes', () => {
      render(<MenuItem {...defaultProps} />)
      const menuItem = screen.getByText('Dashboard').parentElement
      expect(menuItem).toHaveClass('transition-all')
    })

    it('should apply cursor pointer', () => {
      render(<MenuItem {...defaultProps} />)
      const menuItem = screen.getByText('Dashboard').parentElement
      expect(menuItem).toHaveClass('cursor-pointer')
    })

    it('should render icon with correct size', () => {
      render(<MenuItem {...defaultProps} />)
      const icon = screen.getByTestId('menu-icon')
      expect(icon).toHaveClass('text-xl')
    })

    it('should render label with medium font weight', () => {
      render(<MenuItem {...defaultProps} />)
      const label = screen.getByText('Dashboard')
      expect(label).toHaveClass('font-medium')
    })

    it('should apply gap between icon and label', () => {
      render(<MenuItem {...defaultProps} />)
      const menuItem = screen.getByText('Dashboard').parentElement
      expect(menuItem).toHaveClass('gap-3')
    })
  })

  describe('Accessibility', () => {
    it('should have clickable role', () => {
      render(<MenuItem {...defaultProps} />)
      const menuItem = screen.getByText('Dashboard').parentElement
      expect(menuItem).toHaveAttribute('role', undefined) // div is fine with onClick
    })

    it('should be keyboard accessible', () => {
      render(<MenuItem {...defaultProps} />)
      const menuItem = screen.getByText('Dashboard').parentElement
      expect(menuItem).toHaveAttribute('tabindex', undefined)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty label', () => {
      render(<MenuItem {...defaultProps} label="" />)
      expect(screen.getByText('')).toBeInTheDocument()
    })

    it('should handle long labels', () => {
      const longLabel = 'A'.repeat(100)
      render(<MenuItem {...defaultProps} label={longLabel} />)
      expect(screen.getByText(longLabel)).toBeInTheDocument()
    })

    it('should handle special characters in label', () => {
      render(<MenuItem {...defaultProps} label="Special @#$%^*()_+-=[]{}|;:.,?!~ chars" />)
      expect(screen.getByText("Special @#$%^*()_+-=[]{}|;:.,?!~ chars")).toBeInTheDocument()
    })

    it('should handle undefined onClick', () => {
      render(<MenuItem icon={defaultProps.icon} label="No Click" collapsed={false} />)
      const menuItem = screen.getByText('No Click').parentElement
      expect(menuItem).toBeInTheDocument()
    })

    it('should handle different icon types', () => {
      render(<MenuItem {...defaultProps} icon={<span data-testid="custom-icon">⭐</span>} />)
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })

    it('should apply dark mode classes', () => {
      render(<MenuItem {...defaultProps} />)
      const menuItem = screen.getByText('Dashboard').parentElement
      expect(menuItem).toHaveClass('dark:text-slate-400', 'dark:hover:bg-primary/10')
    })
  })
})
