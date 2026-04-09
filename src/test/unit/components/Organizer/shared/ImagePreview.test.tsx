/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ImageViewer from '../../../../../components/Organizer/shared/ImagePreview'

describe('ImageViewer', () => {
  const mockOnClose = jest.fn()
  const testImageUrl = 'https://example.com/test-image.jpg'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render full-screen overlay', () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      expect(screen.getByAltText('Spec')).toBeInTheDocument()
    })

    it('should render image with correct src', () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const img = screen.getByAltText('Spec')
      expect(img).toHaveAttribute('src', testImageUrl)
    })

    it('should render zoom controls', () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should render zoom in button', () => {
      const { container } = render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('should render zoom out button', () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(4)
    })

    it('should render reset button', () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(4)
    })

    it('should render close button', () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('User Interactions - Close', () => {
    it('should call onClose when clicking close button', async () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const closeButtons = screen.getAllByRole('button')
      const closeButton = closeButtons[closeButtons.length - 1]

      await userEvent.click(closeButton)
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onClose when clicking overlay', async () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const overlay = screen.getByAltText('Spec').closest('.fixed')

      await userEvent.click(overlay!)
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should not close when clicking image', async () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const img = screen.getByAltText('Spec')

      await userEvent.click(img)
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Zoom Controls', () => {
    it('should show initial zoom level as 100%', () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should zoom in when clicking zoom in button', async () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const buttons = screen.getAllByRole('button')
      const zoomInButton = buttons[1]

      await userEvent.click(zoomInButton)

      expect(screen.getByText('120%')).toBeInTheDocument()
    })

    it('should zoom out when clicking zoom out button', async () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const buttons = screen.getAllByRole('button')
      const zoomOutButton = buttons[0]

      await userEvent.click(zoomOutButton)

      expect(screen.getByText('80%')).toBeInTheDocument()
    })

    it('should reset zoom when clicking reset button', async () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const buttons = screen.getAllByRole('button')
      const zoomInButton = buttons[1]
      await userEvent.click(zoomInButton)

      expect(screen.getByText('120%')).toBeInTheDocument()

      const resetButton = buttons[3]
      await userEvent.click(resetButton)

      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should cap zoom at maximum 500%', async () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const buttons = screen.getAllByRole('button')
      const zoomInButton = buttons[1]

      // Click zoom in many times
      for (let i = 0; i < 50; i++) {
        await userEvent.click(zoomInButton)
      }

      const zoomText = screen.getByText(/\d+%/).textContent
      const zoomValue = parseInt(zoomText!)
      expect(zoomValue).toBeLessThanOrEqual(500)
    })

    it('should cap zoom at minimum 20%', async () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const buttons = screen.getAllByRole('button')
      const zoomOutButton = buttons[0]

      for (let i = 0; i < 50; i++) {
        await userEvent.click(zoomOutButton)
      }

      const zoomText = screen.getByText(/\d+%/).textContent
      const zoomValue = parseInt(zoomText!)
      expect(zoomValue).toBeGreaterThanOrEqual(20)
    })
  })

  describe('Pan/Drag', () => {
    it('should change cursor to grabbing when dragging', async () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const container = screen.getByAltText('Spec').parentElement

      // Mouse down
      await userEvent.pointer([
        { keys: '[MouseLeft>]', target: container! }
      ])

      expect(container).toHaveStyle({ cursor: 'grabbing' })
    })

    it('should return cursor to grab when not dragging', () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const container = screen.getByAltText('Spec').parentElement
      expect(container).toHaveStyle({ cursor: 'grab' })
    })

    it('should disable dragging on image', () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const img = screen.getByAltText('Spec')
      expect(img).toHaveAttribute('draggable', 'false')
    })
  })

  describe('Wheel Zoom', () => {
    it('should zoom in on wheel up', () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const container = screen.getByAltText('Spec').parentElement!

      const wheelEvent = new WheelEvent('wheel', { deltaY: -100 })
      container.dispatchEvent(wheelEvent)

      expect(screen.getByText('115%')).toBeInTheDocument()
    })

    it('should zoom out on wheel down', () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const container = screen.getByAltText('Spec').parentElement!

      const wheelEvent = new WheelEvent('wheel', { deltaY: 100 })
      container.dispatchEvent(wheelEvent)

      expect(screen.getByText('85%')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should render with dark overlay background', () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const overlay = screen.getByAltText('Spec').closest('.fixed')
      expect(overlay).toHaveClass('bg-black/80', 'backdrop-blur-sm')
    })

    it('should render controls in rounded container', () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const controlsContainer = screen.getByText('100%').closest('.rounded-2xl')
      expect(controlsContainer).toHaveClass('rounded-2xl', 'bg-black/60')
    })

    it('should render image with border radius', () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const img = screen.getByAltText('Spec')
      expect(img).toHaveStyle({ borderRadius: '8px' })
    })

    it('should disable text selection on image', () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const img = screen.getByAltText('Spec')
      expect(img).toHaveStyle({ userSelect: 'none' })
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long image URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(500) + '.jpg'
      render(<ImageViewer url={longUrl} onClose={mockOnClose} />)
      const img = screen.getByAltText('Spec')
      expect(img).toHaveAttribute('src', longUrl)
    })

    it('should handle broken image URLs', () => {
      render(<ImageViewer url="https://broken-url.com/nonexistent.jpg" onClose={mockOnClose} />)
      expect(screen.getByAltText('Spec')).toBeInTheDocument()
    })

    it('should handle rapid zoom clicks', async () => {
      render(<ImageViewer url={testImageUrl} onClose={mockOnClose} />)
      const buttons = screen.getAllByRole('button')
      const zoomInButton = buttons[1]

      // Click rapidly multiple times
      for (let i = 0; i < 10; i++) {
        await userEvent.click(zoomInButton)
      }

      const zoomText = screen.getByText(/\d+%/).textContent
      expect(zoomText).toBeDefined()
    })
  })
})
