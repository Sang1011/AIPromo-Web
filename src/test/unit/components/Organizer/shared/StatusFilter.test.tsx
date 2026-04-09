/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import StatusFilters from '../../../../../components/Organizer/shared/StatusFilters'

describe('StatusFilters', () => {
  const mockOnFilterChange = jest.fn()

  const defaultProps = {
    activeFilter: 'Draft' as const,
    onFilterChange: mockOnFilterChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render all filter buttons', () => {
      render(<StatusFilters {...defaultProps} />)
      expect(screen.getByText('Đang diễn ra')).toBeInTheDocument()
      expect(screen.getByText('Trì hoãn')).toBeInTheDocument()
      expect(screen.getByText('Đã qua')).toBeInTheDocument()
      expect(screen.getByText('Chờ duyệt')).toBeInTheDocument()
      expect(screen.getByText('Nháp')).toBeInTheDocument()
    })

    it('should highlight active filter', () => {
      render(<StatusFilters {...defaultProps} activeFilter="Upcoming" />)
      const upcomingButton = screen.getByText('Đang diễn ra')
      expect(upcomingButton).toHaveClass('bg-primary')
    })

    it('should highlight Draft filter by default', () => {
      render(<StatusFilters {...defaultProps} />)
      const draftButton = screen.getByText('Nháp')
      expect(draftButton).toHaveClass('bg-primary')
    })
  })

  describe('User Interactions', () => {
    it('should call onFilterChange when clicking a filter', async () => {
      render(<StatusFilters {...defaultProps} />)
      await userEvent.click(screen.getByText('Đang diễn ra'))
      expect(mockOnFilterChange).toHaveBeenCalledWith('Upcoming')
    })

    it('should call onFilterChange with correct filter value', async () => {
      render(<StatusFilters {...defaultProps} />)
      await userEvent.click(screen.getByText('Nháp'))
      expect(mockOnFilterChange).toHaveBeenCalledWith('Draft')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined activeFilter', () => {
      render(<StatusFilters onFilterChange={mockOnFilterChange} />)
      expect(screen.getByText('Nháp')).toHaveClass('bg-primary')
    })

    it('should handle undefined onFilterChange', () => {
      render(<StatusFilters activeFilter="Upcoming" />)
      expect(screen.getByText('Đang diễn ra')).toBeInTheDocument()
    })
  })
})
