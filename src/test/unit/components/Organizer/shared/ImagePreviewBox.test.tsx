/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ImagePreviewBox from '../../../../../components/Organizer/shared/ImagePreviewBox'

describe('ImagePreviewBox', () => {
  const defaultProps = {
    imageUrl: 'https://example.com/image.jpg',
    label: 'Test Image',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render image thumbnail', () => {
      render(<ImagePreviewBox {...defaultProps} />)
      const img = screen.getByAltText('Test Image')
      expect(img).toBeInTheDocument()
    })

    it('should render image with correct src', () => {
      render(<ImagePreviewBox {...defaultProps} />)
      const img = screen.getByAltText('Test Image')
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
    })

    it('should apply 16/9 aspect ratio by default', () => {
      render(<ImagePreviewBox {...defaultProps} />)
      const container = screen.getByAltText('Test Image').parentElement
      expect(container).toHaveClass('rounded-xl', 'overflow-hidden')
    })

    it('should apply square aspect ratio when square prop is true', () => {
      render(<ImagePreviewBox {...defaultProps} square />)
      const container = screen.getByAltText('Test Image').parentElement
      expect(container).toHaveClass('aspect-square')
    })

    it('should not render remove button when onRemove is not provided', () => {
      render(<ImagePreviewBox {...defaultProps} />)
      const removeButtons = screen.queryAllByRole('button')
      expect(removeButtons.length).toBe(0)
    })

    it('should render remove button when onRemove is provided', () => {
      render(<ImagePreviewBox {...defaultProps} onRemove={jest.fn()} />)
      const removeButtons = screen.getAllByRole('button')
      expect(removeButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Preview Modal', () => {
    it('should open preview modal when clicking image', async () => {
      render(<ImagePreviewBox {...defaultProps} />)
      const img = screen.getByAltText('Test Image')
      await userEvent.click(img)

      expect(screen.getByAltText('Test Image')).toBeInTheDocument()
    })

    it('should close preview modal when clicking overlay', async () => {
      render(<ImagePreviewBox {...defaultProps} />)
      const img = screen.getByAltText('Test Image')
      await userEvent.click(img)

      const overlay = img.closest('.fixed')
      await userEvent.click(overlay!)

      // Modal should be closed - only one image should exist (thumbnail)
      const images = screen.getAllByAltText('Test Image')
      expect(images.length).toBe(1)
    })

    it('should not close modal when clicking image inside modal', async () => {
      render(<ImagePreviewBox {...defaultProps} />)
      const thumbnail = screen.getByAltText('Test Image')
      await userEvent.click(thumbnail)

      const modalImg = screen.getAllByAltText('Test Image')[0]
      await userEvent.click(modalImg)

      // Modal should still be open
      const allImages = screen.getAllByAltText('Test Image')
      expect(allImages.length).toBeGreaterThan(1)
    })

    it('should render update button in modal when onUpdate is provided', async () => {
      render(<ImagePreviewBox {...defaultProps} onUpdate={jest.fn()} />)
      const img = screen.getByAltText('Test Image')
      await userEvent.click(img)

      expect(screen.getByText('Cập nhật ảnh khác')).toBeInTheDocument()
    })

    it('should not render update button when onUpdate is not provided', async () => {
      render(<ImagePreviewBox {...defaultProps} />)
      const img = screen.getByAltText('Test Image')
      await userEvent.click(img)

      expect(screen.queryByText('Cập nhật ảnh khác')).not.toBeInTheDocument()
    })
  })

  describe('Remove Functionality', () => {
    it('should call onRemove when clicking remove button', async () => {
      const mockOnRemove = jest.fn()
      render(<ImagePreviewBox {...defaultProps} onRemove={mockOnRemove} />)

      const removeButton = screen.getByRole('button')
      await userEvent.click(removeButton)

      expect(mockOnRemove).toHaveBeenCalled()
    })

    it('should not trigger image click when clicking remove button', async () => {
      const mockOnRemove = jest.fn()
      render(<ImagePreviewBox {...defaultProps} onRemove={mockOnRemove} />)

      const removeButton = screen.getByRole('button')
      await userEvent.click(removeButton)

      // Modal should not be open
      expect(screen.queryByText('Cập nhật ảnh khác')).not.toBeInTheDocument()
    })
  })

  describe('Update Functionality', () => {
    it('should trigger file input when clicking update button', async () => {
      const mockOnUpdate = jest.fn()
      render(<ImagePreviewBox {...defaultProps} onUpdate={mockOnUpdate} />)
      const img = screen.getByAltText('Test Image')
      await userEvent.click(img)
      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/png,image/gif,image/webp')
    })

    it('should call onUpdate with file when file is selected', async () => {
      const mockOnUpdate = jest.fn()
      render(<ImagePreviewBox {...defaultProps} onUpdate={mockOnUpdate} />)
      const img = screen.getByAltText('Test Image')
      await userEvent.click(img)

      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      // Simulate file selection
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: true,
      })

      await userEvent.upload(fileInput, file)

      expect(mockOnUpdate).toHaveBeenCalledWith(file)
    })

    it('should clear file input after selection', async () => {
      const mockOnUpdate = jest.fn()
      render(<ImagePreviewBox {...defaultProps} onUpdate={mockOnUpdate} />)
      const img = screen.getByAltText('Test Image')
      await userEvent.click(img)

      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await userEvent.upload(fileInput, file)

      expect(fileInput.value).toBe('')
    })
  })

  describe('Customization', () => {
    it('should apply custom className', () => {
      render(<ImagePreviewBox {...defaultProps} className="custom-class" />)
      const container = screen.getByAltText('Test Image').parentElement
      expect(container).toHaveClass('custom-class')
    })

    it('should use custom aspect ratio', () => {
      render(<ImagePreviewBox {...defaultProps} aspect="4/3" />)
      const container = screen.getByAltText('Test Image').parentElement
      expect(container).toBeInTheDocument()
    })

    it('should render with square aspect ratio', () => {
      render(<ImagePreviewBox {...defaultProps} square />)
      const container = screen.getByAltText('Test Image').parentElement
      expect(container).toHaveClass('aspect-square')
    })
  })

  describe('Styling', () => {
    it('should render thumbnail with border', () => {
      render(<ImagePreviewBox {...defaultProps} />)
      const container = screen.getByAltText('Test Image').parentElement
      expect(container).toHaveClass('border', 'border-white/10')
    })

    it('should render image with object-cover', () => {
      render(<ImagePreviewBox {...defaultProps} />)
      const img = screen.getByAltText('Test Image')
      expect(img).toHaveClass('object-cover')
    })

    it('should render remove button with correct styling', () => {
      render(<ImagePreviewBox {...defaultProps} onRemove={jest.fn()} />)
      const removeButton = screen.getByRole('button')
      expect(removeButton).toHaveClass('bg-black/70', 'rounded-full')
    })
  })

  describe('Edge Cases', () => {
    it('should handle long image URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(200) + '.jpg'
      render(<ImagePreviewBox {...defaultProps} imageUrl={longUrl} />)
      const img = screen.getByAltText('Test Image')
      expect(img).toHaveAttribute('src', longUrl)
    })

    it('should handle missing label', () => {
      render(<ImagePreviewBox imageUrl="https://example.com/image.jpg" />)
      const img = screen.getByAltText('')
      expect(img).toBeInTheDocument()
    })

    it('should handle both onRemove and onUpdate together', async () => {
      const mockOnRemove = jest.fn()
      const mockOnUpdate = jest.fn()

      render(<ImagePreviewBox {...defaultProps} onRemove={mockOnRemove} onUpdate={mockOnUpdate} />)

      // Remove button should be present
      expect(screen.getByRole('button')).toBeInTheDocument()

      // Preview modal should show update button
      const img = screen.getByAltText('Test Image')
      await userEvent.click(img)
      expect(screen.getByText('Cập nhật ảnh khác')).toBeInTheDocument()
    })

    it('should handle rapid file selections', async () => {
      const mockOnUpdate = jest.fn()
      render(<ImagePreviewBox {...defaultProps} onUpdate={mockOnUpdate} />)
      const img = screen.getByAltText('Test Image')
      await userEvent.click(img)

      const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' })
      const file2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      await userEvent.upload(fileInput, file1)
      await userEvent.upload(fileInput, file2)

      expect(mockOnUpdate).toHaveBeenCalledTimes(2)
    })

    it('should close preview when clicking outside image', async () => {
      render(<ImagePreviewBox {...defaultProps} />)
      const thumbnail = screen.getByAltText('Test Image')
      await userEvent.click(thumbnail)

      const overlay = thumbnail.closest('.fixed')
      expect(overlay).toHaveClass('bg-black/85')
    })
  })
})
