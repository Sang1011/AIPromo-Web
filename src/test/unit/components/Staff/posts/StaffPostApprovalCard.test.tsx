/// <reference types="jest" />

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StaffPostApprovalCard from '../../../../../components/Staff/posts/StaffPostApprovalCard'

// ============================================================================
// TEST DATA
// ============================================================================

const createMockProps = (overrides = {}) => ({
  id: 'post-1',
  title: 'Test Post Title',
  description: 'This is a test post description for unit testing.',
  imageUrl: 'https://example.com/image.jpg',
  date: '10:30, 13/04/2026',
  status: 'pending' as const,
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('StaffPostApprovalCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render without crashing', () => {
      render(<StaffPostApprovalCard {...createMockProps()} />)

      expect(screen.getByText('Test Post Title')).toBeInTheDocument()
    })

    it('should render post title', () => {
      render(<StaffPostApprovalCard {...createMockProps()} />)

      expect(screen.getByText('Test Post Title')).toBeInTheDocument()
    })

    it('should render post description', () => {
      render(<StaffPostApprovalCard {...createMockProps()} />)

      expect(
        screen.getByText('This is a test post description for unit testing.')
      ).toBeInTheDocument()
    })

    it('should render post image with correct alt text', () => {
      render(<StaffPostApprovalCard {...createMockProps()} />)

      const img = screen.getByAltText('Test Post Title')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
    })

    it('should render post date', () => {
      render(<StaffPostApprovalCard {...createMockProps()} />)

      expect(screen.getByText('10:30, 13/04/2026')).toBeInTheDocument()
    })
  })

  describe('Status Display', () => {
    it('should show "Chờ duyệt" badge for pending status', () => {
      render(<StaffPostApprovalCard {...createMockProps({ status: 'pending' })} />)

      expect(screen.getByText('Chờ duyệt')).toBeInTheDocument()
    })

    it('should show "Đã duyệt" badge for approved status', () => {
      render(
        <StaffPostApprovalCard {...createMockProps({ status: 'approved' })} />
      )

      // Use getAllByText since there are multiple elements with "Đã duyệt" (badge + disabled button)
      const badges = screen.getAllByText('Đã duyệt')
      expect(badges.length).toBeGreaterThanOrEqual(1)
    })

    it('should show "Đã đăng" badge for published status', () => {
      render(
        <StaffPostApprovalCard {...createMockProps({ status: 'published' })} />
      )

      expect(screen.getByText('Đã đăng')).toBeInTheDocument()
    })

    it('should show "Bị từ chối" badge for rejected status', () => {
      render(
        <StaffPostApprovalCard {...createMockProps({ status: 'rejected' })} />
      )

      expect(screen.getByText('Bị từ chối')).toBeInTheDocument()
    })
  })

  describe('Rejection Reason', () => {
    it('should show rejection reason when status is rejected and reason is provided', () => {
      render(
        <StaffPostApprovalCard
          {...createMockProps({
            status: 'rejected',
            rejectionReason: 'Nội dung không phù hợp',
          })}
        />
      )

      expect(screen.getByText('Lý do từ chối:')).toBeInTheDocument()
      expect(screen.getByText('Nội dung không phù hợp')).toBeInTheDocument()
    })

    it('should NOT show rejection reason when status is not rejected', () => {
      render(
        <StaffPostApprovalCard
          {...createMockProps({
            status: 'pending',
            rejectionReason: 'Some reason',
          })}
        />
      )

      expect(screen.queryByText('Lý do từ chối:')).not.toBeInTheDocument()
    })

    it('should NOT show rejection reason when rejectionReason is undefined', () => {
      render(
        <StaffPostApprovalCard
          {...createMockProps({
            status: 'rejected',
            rejectionReason: undefined,
          })}
        />
      )

      expect(screen.queryByText('Lý do từ chối:')).not.toBeInTheDocument()
    })
  })

  describe('Pending Status Actions', () => {
    it('should show "Duyệt bài", "Từ chối", and "View" buttons for pending status', () => {
      render(<StaffPostApprovalCard {...createMockProps({ status: 'pending' })} />)

      expect(screen.getByText('Duyệt bài')).toBeInTheDocument()
      expect(screen.getByText('Từ chối')).toBeInTheDocument()
      // View button is the third button (no accessible name, just icon)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(3)
    })

    it('should call onApprove with correct id when "Duyệt bài" is clicked', async () => {
      const onApprove = jest.fn()
      render(
        <StaffPostApprovalCard
          {...createMockProps({ status: 'pending', onApprove })}
        />
      )

      await userEvent.click(screen.getByText('Duyệt bài'))

      expect(onApprove).toHaveBeenCalledWith('post-1')
    })

    it('should call onReject with correct id when "Từ chối" is clicked', async () => {
      const onReject = jest.fn()
      render(
        <StaffPostApprovalCard
          {...createMockProps({ status: 'pending', onReject })}
        />
      )

      await userEvent.click(screen.getByText('Từ chối'))

      expect(onReject).toHaveBeenCalledWith('post-1')
    })

    it('should call onView with correct id when View button is clicked', async () => {
      const onView = jest.fn()
      render(
        <StaffPostApprovalCard
          {...createMockProps({ status: 'pending', onView })}
        />
      )

      const viewButtons = screen.getAllByRole('button')
      // Find by the eye icon button - last button in the row
      await userEvent.click(viewButtons[viewButtons.length - 1])

      expect(onView).toHaveBeenCalledWith('post-1')
    })
  })

  describe('Approved Status Actions', () => {
    it('should show disabled "Đã duyệt" button and View button for approved status', () => {
      render(
        <StaffPostApprovalCard {...createMockProps({ status: 'approved' })} />
      )

      const disabledBtn = screen.getByRole('button', { name: 'Đã duyệt' })
      expect(disabledBtn).toBeDisabled()
    })

    it('should call onView with correct id when View button is clicked for approved status', async () => {
      const onView = jest.fn()
      render(
        <StaffPostApprovalCard
          {...createMockProps({ status: 'approved', onView })}
        />
      )

      const buttons = screen.getAllByRole('button')
      await userEvent.click(buttons[buttons.length - 1])

      expect(onView).toHaveBeenCalledWith('post-1')
    })
  })

  describe('Published Status Actions', () => {
    it('should show disabled "Đã duyệt" button and View button for published status', () => {
      render(
        <StaffPostApprovalCard {...createMockProps({ status: 'published' })} />
      )

      const disabledBtn = screen.getByRole('button', { name: 'Đã duyệt' })
      expect(disabledBtn).toBeDisabled()
    })
  })

  describe('Rejected Status Actions', () => {
    it('should show "Xem lại yêu cầu" and View buttons for rejected status', () => {
      render(
        <StaffPostApprovalCard {...createMockProps({ status: 'rejected' })} />
      )

      expect(screen.getByText('Xem lại yêu cầu')).toBeInTheDocument()
    })

    it('should call onReReview with correct id when "Xem lại yêu cầu" is clicked', async () => {
      const onReReview = jest.fn()
      render(
        <StaffPostApprovalCard
          {...createMockProps({ status: 'rejected', onReReview })}
        />
      )

      await userEvent.click(screen.getByText('Xem lại yêu cầu'))

      expect(onReReview).toHaveBeenCalledWith('post-1')
    })
  })

  describe('Callback Functions', () => {
    it('should not crash when callbacks are undefined', () => {
      expect(() => {
        render(
          <StaffPostApprovalCard
            {...createMockProps({
              status: 'pending',
              onApprove: undefined,
              onReject: undefined,
              onView: undefined,
              onReReview: undefined,
            })}
          />
        )
      }).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should render with empty title', () => {
      render(<StaffPostApprovalCard {...createMockProps({ title: '' })} />)

      // Empty title means the h3 element is still rendered but empty
      // We can check that the component renders without errors
      const cardElement = document.querySelector('.rounded-2xl')
      expect(cardElement).toBeInTheDocument()
    })

    it('should render with very long description', () => {
      const longDesc = 'A'.repeat(500)
      render(
        <StaffPostApprovalCard {...createMockProps({ description: longDesc })} />
      )

      expect(screen.getByText(longDesc)).toBeInTheDocument()
    })

    it('should render with missing image URL gracefully', () => {
      // Use null instead of empty string to avoid browser warning
      expect(() => {
        render(
          <StaffPostApprovalCard {...createMockProps({ imageUrl: null as any })} />
        )
      }).not.toThrow()
    })
  })
})
