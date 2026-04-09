/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Pagination from '../../../../../components/Organizer/shared/Pagination'

describe('Pagination', () => {
  const mockOnPageChange = jest.fn()

  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    onPageChange: mockOnPageChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render with correct current page', () => {
      render(<Pagination {...defaultProps} />)
      expect(screen.getByText('1')).toHaveClass('bg-primary')
    })

    it('should render all page numbers', () => {
      render(<Pagination {...defaultProps} />)
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByText(String(i))).toBeInTheDocument()
      }
    })

    it('should highlight current page', () => {
      render(<Pagination {...defaultProps} currentPage={3} />)
      expect(screen.getByText('3')).toHaveClass('bg-primary')
    })

    it('should render previous button', () => {
      render(<Pagination {...defaultProps} currentPage={2} />)
      expect(screen.getByText('Trước')).toBeInTheDocument()
    })

    it('should render next button', () => {
      render(<Pagination {...defaultProps} currentPage={1} />)
      expect(screen.getByText('Sau')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onPageChange when clicking a page number', async () => {
      render(<Pagination {...defaultProps} />)
      await userEvent.click(screen.getByText('3'))
      expect(mockOnPageChange).toHaveBeenCalledWith(3)
    })

    it('should call onPageChange when clicking next button', async () => {
      render(<Pagination {...defaultProps} />)
      await userEvent.click(screen.getByText('Sau'))
      expect(mockOnPageChange).toHaveBeenCalledWith(2)
    })

    it('should call onPageChange when clicking previous button', async () => {
      render(<Pagination {...defaultProps} currentPage={3} />)
      await userEvent.click(screen.getByText('Trước'))
      expect(mockOnPageChange).toHaveBeenCalledWith(2)
    })
  })

  describe('Edge Cases', () => {
    it('should disable previous button on first page', () => {
      render(<Pagination {...defaultProps} currentPage={1} />)
      const prevButton = screen.getByText('Trước')
      expect(prevButton).toBeDisabled()
    })

    it('should disable next button on last page', () => {
      render(<Pagination {...defaultProps} currentPage={5} />)
      const nextButton = screen.getByText('Sau')
      expect(nextButton).toBeDisabled()
    })

    it('should handle single page', () => {
      render(<Pagination {...defaultProps} totalPages={1} />)
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('Trước')).toBeDisabled()
      expect(screen.getByText('Sau')).toBeDisabled()
    })

    it('should handle large number of pages', () => {
      render(<Pagination {...defaultProps} totalPages={100} currentPage={50} />)
      expect(screen.getByText('50')).toHaveClass('bg-primary')
    })

    it('should handle currentPage greater than totalPages', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalPages={5} />)
      expect(screen.queryByText('10')).not.toBeInTheDocument()
    })
  })
})
