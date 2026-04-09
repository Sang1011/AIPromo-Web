/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ConfirmModal from '../../../../../components/Organizer/shared/ConfirmModal'

describe('ConfirmModal', () => {
  const mockOnConfirm = jest.fn()
  const mockOnCancel = jest.fn()

  const defaultProps = {
    open: true,
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render when open is true', () => {
      render(<ConfirmModal {...defaultProps} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should not render when open is false', () => {
      render(<ConfirmModal {...defaultProps} open={false} />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render with default title', () => {
      render(<ConfirmModal {...defaultProps} />)
      expect(screen.getByText('Xác nhận')).toBeInTheDocument()
    })

    it('should render with custom title', () => {
      render(<ConfirmModal {...defaultProps} title="Delete Item" />)
      expect(screen.getByText('Delete Item')).toBeInTheDocument()
    })

    it('should render with description', () => {
      render(<ConfirmModal {...defaultProps} description="Are you sure?" />)
      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    })

    it('should render with ReactNode description', () => {
      render(
        <ConfirmModal
          {...defaultProps}
          description={<span data-testid="custom-desc">Custom description</span>}
        />
      )
      expect(screen.getByTestId('custom-desc')).toBeInTheDocument()
    })

    it('should render with default confirm text', () => {
      render(<ConfirmModal {...defaultProps} />)
      expect(screen.getByText('Xác nhận')).toBeInTheDocument()
    })

    it('should render with custom confirm text', () => {
      render(<ConfirmModal {...defaultProps} confirmText="Delete" />)
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should render with default cancel text', () => {
      render(<ConfirmModal {...defaultProps} />)
      expect(screen.getByText('Hủy')).toBeInTheDocument()
    })

    it('should render with custom cancel text', () => {
      render(<ConfirmModal {...defaultProps} cancelText="Cancel" />)
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onConfirm when clicking confirm button', async () => {
      render(<ConfirmModal {...defaultProps} />)
      const confirmButton = screen.getByText('Xác nhận')
      await userEvent.click(confirmButton)
      expect(mockOnConfirm).toHaveBeenCalled()
    })

    it('should call onCancel when clicking cancel button', async () => {
      render(<ConfirmModal {...defaultProps} />)
      const cancelButton = screen.getByText('Hủy')
      await userEvent.click(cancelButton)
      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('should disable confirm button when loading', () => {
      render(<ConfirmModal {...defaultProps} loading={true} />)
      const confirmButton = screen.getByText('Xác nhận')
      expect(confirmButton).toBeDisabled()
    })

    it('should show spinner when loading', () => {
      render(<ConfirmModal {...defaultProps} loading={true} />)
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should enable confirm button when not loading', () => {
      render(<ConfirmModal {...defaultProps} loading={false} />)
      const confirmButton = screen.getByText('Xác nhận')
      expect(confirmButton).not.toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty description', () => {
      render(<ConfirmModal {...defaultProps} description="" />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should handle very long description', () => {
      const longDesc = 'A'.repeat(500)
      render(<ConfirmModal {...defaultProps} description={longDesc} />)
      expect(screen.getByText(longDesc)).toBeInTheDocument()
    })

    it('should handle special characters in title', () => {
      render(<ConfirmModal {...defaultProps} title="Delete <script>alert('xss')</script>" />)
      expect(screen.getByText(/Delete/)).toBeInTheDocument()
    })
  })
})
