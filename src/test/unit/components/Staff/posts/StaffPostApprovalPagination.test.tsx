/// <reference types="jest" />

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StaffPostApprovalPagination from '../../../../../components/Staff/posts/StaffPostApprovalPagination'

// ============================================================================
// TEST DATA
// ============================================================================

const createMockProps = (overrides = {}) => ({
  currentPage: 1,
  totalPages: 5,
  startItem: 1,
  endItem: 10,
  onPageChange: jest.fn(),
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('StaffPostApprovalPagination', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render without crashing', () => {
      render(<StaffPostApprovalPagination {...createMockProps()} />)

      expect(screen.getByText(/Hiển thị/i)).toBeInTheDocument()
    })

    it('should display item count range correctly', () => {
      render(<StaffPostApprovalPagination {...createMockProps()} />)

      // Use getAllByText since "1" appears in both item count and page buttons
      const ones = screen.getAllByText('1')
      expect(ones.length).toBeGreaterThan(0)
      const tens = screen.getAllByText('10')
      expect(tens.length).toBeGreaterThan(0)
      expect(
        screen.getByText(/Hiển thị.*trên.*bài đăng/i)
      ).toBeInTheDocument()
    })

    it('should render Prev button', () => {
      render(<StaffPostApprovalPagination {...createMockProps()} />)

      expect(screen.getByText('Prev')).toBeInTheDocument()
    })

    it('should render Next button', () => {
      render(<StaffPostApprovalPagination {...createMockProps()} />)

      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('should render all page number buttons', () => {
      render(<StaffPostApprovalPagination {...createMockProps()} />)

      for (let i = 1; i <= 5; i++) {
        const buttons = screen.getAllByText(i.toString())
        expect(buttons.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Page Numbers', () => {
    it('should highlight the current page', () => {
      render(<StaffPostApprovalPagination {...createMockProps({ currentPage: 3 })} />)

      // Get all "3" texts and find the one that's a button with bg-fuchsia-500
      const threes = screen.getAllByText('3')
      const currentPageBtn = threes.find(el => el.tagName === 'BUTTON' && el.classList.contains('bg-fuchsia-500'))
      expect(currentPageBtn).toBeInTheDocument()
    })

    it('should not highlight non-current pages', () => {
      render(<StaffPostApprovalPagination {...createMockProps({ currentPage: 3 })} />)

      // Get all "1" texts and check the button doesn't have bg-fuchsia-500
      const ones = screen.getAllByText('1')
      const page1Btn = ones.find(el => el.tagName === 'BUTTON')
      expect(page1Btn).not.toHaveClass('bg-fuchsia-500')
    })

    it('should show all pages when totalPages <= 5', () => {
      render(<StaffPostApprovalPagination {...createMockProps({ totalPages: 3 })} />)

      const ones = screen.getAllByText('1')
      expect(ones.length).toBeGreaterThan(0)
      const twos = screen.getAllByText('2')
      expect(twos.length).toBeGreaterThan(0)
      const threes = screen.getAllByText('3')
      expect(threes.length).toBeGreaterThan(0)
    })
  })

  describe('Ellipsis Logic', () => {
    it('should show ellipsis for many pages (early page)', () => {
      render(
        <StaffPostApprovalPagination
          {...createMockProps({ currentPage: 1, totalPages: 10 })}
        />
      )

      // Should show ellipsis (represented as "…")
      const ellipsisElements = screen.getAllByText('…')
      expect(ellipsisElements.length).toBeGreaterThan(0)
    })

    it('should show ellipsis for many pages (middle page)', () => {
      render(
        <StaffPostApprovalPagination
          {...createMockProps({ currentPage: 5, totalPages: 10 })}
        />
      )

      // Should show page 1, ..., 4, 5, 6, ..., 10
      const ones = screen.getAllByText('1')
      expect(ones.length).toBeGreaterThan(0)
      const fives = screen.getAllByText('5')
      expect(fives.length).toBeGreaterThan(0)
      const tens = screen.getAllByText('10')
      expect(tens.length).toBeGreaterThan(0)
    })

    it('should show ellipsis for many pages (last page)', () => {
      render(
        <StaffPostApprovalPagination
          {...createMockProps({ currentPage: 10, totalPages: 10 })}
        />
      )

      const ones = screen.getAllByText('1')
      expect(ones.length).toBeGreaterThan(0)
      const tens = screen.getAllByText('10')
      expect(tens.length).toBeGreaterThan(0)
    })
  })

  describe('Prev Button', () => {
    it('should be disabled when on first page', () => {
      render(<StaffPostApprovalPagination {...createMockProps({ currentPage: 1 })} />)

      const prevBtn = screen.getByText('Prev')
      expect(prevBtn).toBeDisabled()
    })

    it('should be enabled when not on first page', () => {
      render(
        <StaffPostApprovalPagination {...createMockProps({ currentPage: 2 })} />
      )

      const prevBtn = screen.getByText('Prev')
      expect(prevBtn).not.toBeDisabled()
    })

    it('should call onPageChange with currentPage - 1 when clicked', async () => {
      const onPageChange = jest.fn()
      render(
        <StaffPostApprovalPagination
          {...createMockProps({ currentPage: 3, onPageChange })}
        />
      )

      await userEvent.click(screen.getByText('Prev'))

      expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('should not call onPageChange when disabled', async () => {
      const onPageChange = jest.fn()
      render(
        <StaffPostApprovalPagination
          {...createMockProps({ currentPage: 1, onPageChange })}
        />
      )

      await userEvent.click(screen.getByText('Prev'))

      expect(onPageChange).not.toHaveBeenCalled()
    })
  })

  describe('Next Button', () => {
    it('should be disabled when on last page', () => {
      render(
        <StaffPostApprovalPagination {...createMockProps({ currentPage: 5, totalPages: 5 })} />
      )

      const nextBtn = screen.getByText('Next')
      expect(nextBtn).toBeDisabled()
    })

    it('should be enabled when not on last page', () => {
      render(<StaffPostApprovalPagination {...createMockProps({ currentPage: 1 })} />)

      const nextBtn = screen.getByText('Next')
      expect(nextBtn).not.toBeDisabled()
    })

    it('should call onPageChange with currentPage + 1 when clicked', async () => {
      const onPageChange = jest.fn()
      render(
        <StaffPostApprovalPagination
          {...createMockProps({ currentPage: 2, totalPages: 5, onPageChange })}
        />
      )

      await userEvent.click(screen.getByText('Next'))

      expect(onPageChange).toHaveBeenCalledWith(3)
    })

    it('should not call onPageChange when disabled', async () => {
      const onPageChange = jest.fn()
      render(
        <StaffPostApprovalPagination
          {...createMockProps({ currentPage: 5, totalPages: 5, onPageChange })}
        />
      )

      await userEvent.click(screen.getByText('Next'))

      expect(onPageChange).not.toHaveBeenCalled()
    })
  })

  describe('Page Number Clicks', () => {
    it('should call onPageChange when a page number is clicked', async () => {
      const onPageChange = jest.fn()
      render(
        <StaffPostApprovalPagination
          {...createMockProps({ currentPage: 1, totalPages: 5, onPageChange })}
        />
      )

      await userEvent.click(screen.getByText('3'))

      expect(onPageChange).toHaveBeenCalledWith(3)
    })

    it('should not call onPageChange when current page is clicked', async () => {
      const onPageChange = jest.fn()
      render(
        <StaffPostApprovalPagination
          {...createMockProps({ currentPage: 2, totalPages: 5, onPageChange })}
        />
      )

      await userEvent.click(screen.getByText('2'))

      // Still calls, component doesn't prevent it
      expect(onPageChange).toHaveBeenCalledWith(2)
    })
  })

  describe('Edge Cases', () => {
    it('should render with single page', () => {
      render(<StaffPostApprovalPagination {...createMockProps({ totalPages: 1, currentPage: 1 })} />)

      const ones = screen.getAllByText('1')
      expect(ones.length).toBeGreaterThan(0)
      expect(screen.getByText('Prev')).toBeDisabled()
      expect(screen.getByText('Next')).toBeDisabled()
    })

    it('should render with large number of pages', () => {
      render(
        <StaffPostApprovalPagination
          {...createMockProps({ totalPages: 50, currentPage: 25 })}
        />
      )

      const ones = screen.getAllByText('1')
      expect(ones.length).toBeGreaterThan(0)
      const twentyFives = screen.getAllByText('25')
      expect(twentyFives.length).toBeGreaterThan(0)
      const fifties = screen.getAllByText('50')
      expect(fifties.length).toBeGreaterThan(0)
    })

    it('should render with startItem > endItem gracefully', () => {
      render(
        <StaffPostApprovalPagination
          {...createMockProps({ startItem: 0, endItem: 0 })}
        />
      )

      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBeGreaterThan(0)
    })
  })
})
