/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { UnsavedBanner } from '../../../../../components/Organizer/shared/UnsavedBanner'

describe('UnsavedBanner', () => {
  const mockOnSave = jest.fn()

  const defaultProps = {
    saving: false,
    onSave: mockOnSave,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render warning icon', () => {
      const { container } = render(<UnsavedBanner {...defaultProps} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('should render warning message', () => {
      render(<UnsavedBanner {...defaultProps} />)
      expect(screen.getByText('Bạn có thay đổi thông tin sự kiện chưa được lưu')).toBeInTheDocument()
    })

    it('should render save button', () => {
      render(<UnsavedBanner {...defaultProps} />)
      expect(screen.getByText('Lưu ngay')).toBeInTheDocument()
    })

    it('should render with sticky positioning', () => {
      render(<UnsavedBanner {...defaultProps} />)
      const banner = screen.getByText('Lưu ngay').closest('.sticky')
      expect(banner).toHaveClass('top-20', 'z-40')
    })

    it('should render with warning color scheme', () => {
      render(<UnsavedBanner {...defaultProps} />)
      const banner = screen.getByText('Lưu ngay').closest('.border-amber-500\\/25')
      expect(banner).toHaveClass('bg-amber-950/60')
    })

    it('should render text in amber color', () => {
      render(<UnsavedBanner {...defaultProps} />)
      const warningText = screen.getByText('Bạn có thay đổi thông tin sự kiện chưa được lưu')
      expect(warningText).toHaveClass('text-amber-200')
    })
  })

  describe('User Interactions', () => {
    it('should call onSave when clicking save button', async () => {
      render(<UnsavedBanner {...defaultProps} />)
      const saveButton = screen.getByText('Lưu ngay')
      await userEvent.click(saveButton)
      expect(mockOnSave).toHaveBeenCalled()
    })

    it('should disable save button when saving', () => {
      render(<UnsavedBanner {...defaultProps} saving={true} />)
      const saveButton = screen.getByText('Đang lưu...')
      expect(saveButton).toBeDisabled()
    })

    it('should enable save button when not saving', () => {
      render(<UnsavedBanner {...defaultProps} saving={false} />)
      const saveButton = screen.getByText('Lưu ngay')
      expect(saveButton).not.toBeDisabled()
    })
  })

  describe('Loading State', () => {
    it('should show "Đang lưu..." text when saving', () => {
      render(<UnsavedBanner {...defaultProps} saving={true} />)
      expect(screen.getByText('Đang lưu...')).toBeInTheDocument()
    })

    it('should show "Lưu ngay" text when not saving', () => {
      render(<UnsavedBanner {...defaultProps} saving={false} />)
      expect(screen.getByText('Lưu ngay')).toBeInTheDocument()
    })

    it('should apply disabled styling when saving', () => {
      render(<UnsavedBanner {...defaultProps} saving={true} />)
      const saveButton = screen.getByText('Đang lưu...')
      expect(saveButton).toHaveClass('disabled:opacity-60')
      expect(saveButton).toBeDisabled()
    })
  })

  describe('Styling', () => {
    it('should render with backdrop blur', () => {
      render(<UnsavedBanner {...defaultProps} />)
      const banner = screen.getByText('Lưu ngay').closest('.backdrop-blur-md')
      expect(banner).toHaveClass('backdrop-blur-md')
    })

    it('should render with shadow', () => {
      render(<UnsavedBanner {...defaultProps} />)
      const banner = screen.getByText('Lưu ngay').closest('.shadow-lg')
      expect(banner).toHaveClass('shadow-lg')
    })

    it('should render with amber border', () => {
      render(<UnsavedBanner {...defaultProps} />)
      const banner = screen.getByText('Lưu ngay').closest('.border-amber-500\\/25')
      expect(banner).toHaveClass('border-amber-500/25')
    })

    it('should render with amber background', () => {
      render(<UnsavedBanner {...defaultProps} />)
      const banner = screen.getByText('Lưu ngay').closest('.bg-amber-950\\/60')
      expect(banner).toHaveClass('bg-amber-950/60')
    })

    it('should render save button with amber background', () => {
      render(<UnsavedBanner {...defaultProps} />)
      const saveButton = screen.getByText('Lưu ngay')
      expect(saveButton).toHaveClass('bg-amber-500')
    })

    it('should render save button with hover state', () => {
      render(<UnsavedBanner {...defaultProps} />)
      const saveButton = screen.getByText('Lưu ngay')
      expect(saveButton).toHaveClass('hover:bg-amber-400')
    })

    it('should render icon with amber color', () => {
      const { container } = render(<UnsavedBanner {...defaultProps} />)
      const svgIcon = container.querySelector('svg.text-amber-400')
      expect(svgIcon).toBeInTheDocument()
    })

    it('should render with flex layout and gap', () => {
      render(<UnsavedBanner {...defaultProps} />)
      const banner = screen.getByText('Lưu ngay').closest('.flex')
      expect(banner).toHaveClass('items-center', 'justify-between', 'gap-4')
    })

    it('should render icon container with shrink-0', () => {
      const { container } = render(<UnsavedBanner {...defaultProps} />)
      const svgIcon = container.querySelector('svg.shrink-0')
      expect(svgIcon).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should render warning text with medium font weight', () => {
      render(<UnsavedBanner {...defaultProps} />)
      const warningText = screen.getByText('Bạn có thay đổi thông tin sự kiện chưa được lưu')
      expect(warningText).toHaveClass('font-medium')
    })

    it('should render save button with bold text', () => {
      render(<UnsavedBanner {...defaultProps} />)
      const saveButton = screen.getByText('Lưu ngay')
      expect(saveButton).toHaveClass('font-bold')
    })

    it('should render with proper spacing', () => {
      render(<UnsavedBanner {...defaultProps} />)
      const banner = screen.getByText('Lưu ngay').closest('.px-4')
      expect(banner).toHaveClass('px-4', 'py-3')
    })

    it('should render save button with proper padding', () => {
      render(<UnsavedBanner {...defaultProps} />)
      const saveButton = screen.getByText('Lưu ngay')
      expect(saveButton).toHaveClass('px-4', 'py-1.5')
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid save clicks', async () => {
      render(<UnsavedBanner {...defaultProps} />)
      const saveButton = screen.getByText('Lưu ngay')

      await userEvent.click(saveButton)
      await userEvent.click(saveButton)
      await userEvent.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledTimes(3)
    })

    it('should handle saving state transition', async () => {
      const { rerender } = render(<UnsavedBanner {...defaultProps} />)

      expect(screen.getByText('Lưu ngay')).toBeInTheDocument()
      expect(screen.getByText('Lưu ngay')).not.toBeDisabled()

      // Transition to saving state
      rerender(<UnsavedBanner saving={true} onSave={mockOnSave} />)

      expect(screen.getByText('Đang lưu...')).toBeInTheDocument()
      expect(screen.getByText('Đang lưu...')).toBeDisabled()
    })

    it('should handle save completion', async () => {
      const { rerender } = render(<UnsavedBanner {...defaultProps} saving={true} />)

      expect(screen.getByText('Đang lưu...')).toBeInTheDocument()
      expect(screen.getByText('Đang lưu...')).toBeDisabled()

      // Transition back to not saving
      rerender(<UnsavedBanner saving={false} onSave={mockOnSave} />)

      expect(screen.getByText('Lưu ngay')).toBeInTheDocument()
      expect(screen.getByText('Lưu ngay')).not.toBeDisabled()
    })

    it('should maintain visibility in viewport', () => {
      render(<UnsavedBanner {...defaultProps} />)
      const banner = screen.getByText('Lưu ngay').closest('.sticky')
      expect(banner).toHaveClass('top-20')
    })

    it('should render with high z-index', () => {
      render(<UnsavedBanner {...defaultProps} />)
      const banner = screen.getByText('Lưu ngay').closest('.z-40')
      expect(banner).toHaveClass('z-40')
    })
  })

  describe('Accessibility', () => {
    it('should have visible warning text', () => {
      render(<UnsavedBanner {...defaultProps} />)
      const warningText = screen.getByText('Bạn có thay đổi thông tin sự kiện chưa được lưu')
      expect(warningText).toHaveClass('text-amber-200')
    })

    it('should have clear call-to-action button', () => {
      render(<UnsavedBanner {...defaultProps} />)
      const saveButton = screen.getByRole('button')
      expect(saveButton).toHaveTextContent('Lưu ngay')
    })
  })
})
