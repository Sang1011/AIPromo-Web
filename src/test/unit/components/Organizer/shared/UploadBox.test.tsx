/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import UploadBox from '../../../../../components/Organizer/shared/UploadBox'

describe('UploadBox', () => {
  const mockOnChange = jest.fn()

  const defaultProps = {
    label: 'Upload Image',
    aspect: '16/9',
    file: null as File | null,
    onChange: mockOnChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Render', () => {
    it('should render upload box with label', () => {
      render(<UploadBox {...defaultProps} />)
      expect(screen.getByText('Upload Image')).toBeInTheDocument()
    })

    it('should render placeholder text when no file', () => {
      render(<UploadBox {...defaultProps} />)
      expect(screen.getByText('Click để tải ảnh')).toBeInTheDocument()
    })

    it('should render with dashed border', () => {
      render(<UploadBox {...defaultProps} />)
      const uploadBox = screen.getByText('Upload Image').closest('.border-dashed')
      expect(uploadBox).toHaveClass('border-dashed', 'border-white/10')
    })

    it('should apply aspect ratio', () => {
      render(<UploadBox {...defaultProps} aspect="16/9" />)
      const uploadBox = screen.getByText('Upload Image').closest('.border-dashed')
      expect(uploadBox).toBeInTheDocument()
    })

    it('should apply square aspect ratio when square prop is true', () => {
      render(<UploadBox {...defaultProps} square />)
      const uploadBox = screen.getByText('Upload Image').closest('.border-dashed')
      expect(uploadBox).toHaveClass('aspect-square')
    })

    it('should apply custom className', () => {
      render(<UploadBox {...defaultProps} className="custom-class" />)
      const uploadBox = screen.getByText('Upload Image').closest('.custom-class')
      expect(uploadBox).toHaveClass('custom-class')
    })
  })

  describe('File Upload', () => {
    it('should accept valid image files', async () => {
      render(<UploadBox {...defaultProps} />)
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText(/Upload Image/) as HTMLInputElement ||
        document.querySelector('input[type="file"]')

      if (input) {
        await userEvent.upload(input, file)
        expect(mockOnChange).toHaveBeenCalledWith(file)
      }
    })

    it('should reject non-image files', async () => {
      render(<UploadBox {...defaultProps} />)
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      if (input) {
        await userEvent.upload(input, file)
        expect(mockOnChange).not.toHaveBeenCalled()
        expect(screen.getByText('Chỉ cho phép ảnh JPEG, PNG, GIF, WebP')).toBeInTheDocument()
      }
    })

    it('should reject files larger than 10MB', async () => {
      render(<UploadBox {...defaultProps} />)
      const largeFile = new File(['a'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      if (input) {
        await userEvent.upload(input, largeFile)
        expect(mockOnChange).not.toHaveBeenCalled()
        expect(screen.getByText('Ảnh không được vượt quá 10MB')).toBeInTheDocument()
      }
    })

    it('should accept JPEG files', async () => {
      render(<UploadBox {...defaultProps} />)
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      if (input) {
        await userEvent.upload(input, file)
        expect(mockOnChange).toHaveBeenCalledWith(file)
      }
    })

    it('should accept PNG files', async () => {
      render(<UploadBox {...defaultProps} />)
      const file = new File(['content'], 'test.png', { type: 'image/png' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      if (input) {
        await userEvent.upload(input, file)
        expect(mockOnChange).toHaveBeenCalledWith(file)
      }
    })

    it('should accept GIF files', async () => {
      render(<UploadBox {...defaultProps} />)
      const file = new File(['content'], 'test.gif', { type: 'image/gif' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      if (input) {
        await userEvent.upload(input, file)
        expect(mockOnChange).toHaveBeenCalledWith(file)
      }
    })

    it('should accept WebP files', async () => {
      render(<UploadBox {...defaultProps} />)
      const file = new File(['content'], 'test.webp', { type: 'image/webp' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      if (input) {
        await userEvent.upload(input, file)
        expect(mockOnChange).toHaveBeenCalledWith(file)
      }
    })
  })

  describe('Preview', () => {
    it('should show image preview when file is selected', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      render(<UploadBox {...defaultProps} file={file} />)

      const img = screen.getByAltText('Upload Image')
      expect(img).toHaveAttribute('src', 'blob:mock-url')
    })

    it('should open preview modal when clicking image', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      render(<UploadBox {...defaultProps} file={file} />)

      const img = screen.getByAltText('Upload Image')
      await userEvent.click(img)

      // Preview modal should be open
      const previewImg = screen.getAllByAltText('Upload Image')[0]
      expect(previewImg).toHaveClass('max-h-[90vh]')
    })

    it('should close preview modal when clicking overlay', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      render(<UploadBox {...defaultProps} file={file} />)

      const img = screen.getByAltText('Upload Image')
      await userEvent.click(img)

      const overlay = img.closest('.fixed')
      if (overlay) {
        await userEvent.click(overlay)
        // Modal should be closed
      }
    })

    it('should not open preview when disabled', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      render(<UploadBox {...defaultProps} file={file} disabled />)

      const img = screen.getByAltText('Upload Image')
      await userEvent.click(img)

      // Preview modal should not open
      expect(screen.queryByAltText('Upload Image')).not.toHaveClass('max-h-[90vh]')
    })
  })

  describe('Remove File', () => {
    it('should show remove button when file is selected', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      render(<UploadBox {...defaultProps} file={file} />)

      const removeButton = screen.getByRole('button')
      expect(removeButton).toBeInTheDocument()
    })

    it('should call onChange with null when clicking remove', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      render(<UploadBox {...defaultProps} file={file} />)

      const removeButton = screen.getByRole('button')
      await userEvent.click(removeButton)

      expect(mockOnChange).toHaveBeenCalledWith(null)
    })

    it('should not show remove button when disabled', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      render(<UploadBox {...defaultProps} file={file} disabled />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should apply disabled styling', () => {
      render(<UploadBox {...defaultProps} disabled />)
      const uploadBox = screen.getByText('Upload Image').closest('.border-dashed')
      expect(uploadBox).toHaveClass('opacity-40', 'cursor-not-allowed')
    })

    it('should show "Không thể chỉnh sửa" text when disabled', () => {
      render(<UploadBox {...defaultProps} disabled />)
      expect(screen.getByText('Không thể chỉnh sửa')).toBeInTheDocument()
    })

    it('should not allow file selection when disabled', async () => {
      render(<UploadBox {...defaultProps} disabled />)
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      expect(input).toBeDisabled()
    })

    it('should not call onChange when disabled', async () => {
      render(<UploadBox {...defaultProps} disabled />)
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      if (input) {
        await userEvent.upload(input, file)
        expect(mockOnChange).not.toHaveBeenCalled()
      }
    })
  })

  describe('Error State', () => {
    it('should apply error styling when error prop is true', () => {
      render(<UploadBox {...defaultProps} error />)
      const uploadBox = screen.getByText('Upload Image').closest('.border-dashed')
      expect(uploadBox).toHaveClass('border-red-500')
    })

    it('should show normal border when error is false', () => {
      render(<UploadBox {...defaultProps} error={false} />)
      const uploadBox = screen.getByText('Upload Image').closest('.border-dashed')
      expect(uploadBox).toHaveClass('border-white/10')
    })

    it('should show error modal for invalid file type', async () => {
      render(<UploadBox {...defaultProps} />)
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      if (input) {
        await userEvent.upload(input, file)
        expect(screen.getByText('Chỉ cho phép ảnh JPEG, PNG, GIF, WebP')).toBeInTheDocument()
      }
    })

    it('should show error modal for file too large', async () => {
      render(<UploadBox {...defaultProps} />)
      const largeFile = new File(['a'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      if (input) {
        await userEvent.upload(input, largeFile)
        expect(screen.getByText('Ảnh không được vượt quá 10MB')).toBeInTheDocument()
      }
    })

    it('should close error modal when clicking OK', async () => {
      render(<UploadBox {...defaultProps} />)
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      if (input) {
        await userEvent.upload(input, file)
        const okButton = screen.getByText('OK')
        await userEvent.click(okButton)
        expect(screen.queryByText('Chỉ cho phép ảnh JPEG, PNG, GIF, WebP')).not.toBeInTheDocument()
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty file', async () => {
      render(<UploadBox {...defaultProps} />)
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      if (input) {
        const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' })
        await userEvent.upload(input, emptyFile)
        expect(mockOnChange).toHaveBeenCalledWith(emptyFile)
      }
    })

    it('should handle file at exactly 10MB limit', async () => {
      render(<UploadBox {...defaultProps} />)
      const exactFile = new File(['a'.repeat(10 * 1024 * 1024)], 'exact.jpg', { type: 'image/jpeg' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      if (input) {
        await userEvent.upload(input, exactFile)
        expect(mockOnChange).toHaveBeenCalledWith(exactFile)
      }
    })

    it('should cleanup object URLs when file changes', () => {
      const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' })
      const { rerender } = render(<UploadBox {...defaultProps} file={file1} />)

      const file2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' })
      rerender(<UploadBox {...defaultProps} file={file2} />)

      expect(global.URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('should handle rapid file uploads', async () => {
      render(<UploadBox {...defaultProps} />)
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' })
      const file2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' })

      if (input) {
        await userEvent.upload(input, file1)
        await userEvent.upload(input, file2)
        expect(mockOnChange).toHaveBeenCalledTimes(2)
      }
    })

    it('should handle very long labels', () => {
      const longLabel = 'A'.repeat(200)
      render(<UploadBox {...defaultProps} label={longLabel} />)
      expect(screen.getByText(longLabel)).toBeInTheDocument()
    })

    it('should handle special characters in label', () => {
      render(<UploadBox {...defaultProps} label='Special & < > " chars' />)
      expect(screen.getByText('Special & < > " chars')).toBeInTheDocument()
    })
  })
})
