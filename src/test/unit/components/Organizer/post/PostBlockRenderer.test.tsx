/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import type { ContentBlock } from '../../../../../types/post/post'

import PostBlockRenderer from '../../../../../components/Organizer/post/PostBlockRenderer'

// Mock the usePostFont hook
jest.mock('../../../../../hooks/usePostFont', () => ({
  usePostFont: jest.fn(),
}))

describe('PostBlockRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render without crashing', () => {
      const { container } = render(<PostBlockRenderer blocks={[]} />)
      expect(container).toBeInTheDocument()
    })

    it('should render empty container for empty blocks array', () => {
      const { container } = render(<PostBlockRenderer blocks={[]} />)
      expect(container.firstChild).toHaveClass('space-y-3')
    })

    it('should apply custom className when provided', () => {
      const { container } = render(<PostBlockRenderer blocks={[]} className="custom-class" />)
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should render with DM Sans font family', () => {
      const { container } = render(<PostBlockRenderer blocks={[]} />)
      expect(container.firstChild).toHaveStyle({ fontFamily: "'DM Sans', sans-serif" })
    })
  })

  describe('BlockItem - Heading', () => {
    it('should render h1 heading for level 1', () => {
      const blocks: ContentBlock[] = [{ type: 'heading', level: 1, text: 'Main Title' }]
      render(<PostBlockRenderer blocks={blocks} />)

      expect(screen.getByText('Main Title')).toBeInTheDocument()
      expect(screen.getByText('Main Title').tagName).toBe('H1')
    })

    it('should render h2 heading for level 2', () => {
      const blocks: ContentBlock[] = [{ type: 'heading', level: 2, text: 'Section Title' }]
      render(<PostBlockRenderer blocks={blocks} />)

      expect(screen.getByText('Section Title')).toBeInTheDocument()
      expect(screen.getByText('Section Title').tagName).toBe('H2')
    })

    it('should render h3 heading for level 3 or default', () => {
      const blocks: ContentBlock[] = [{ type: 'heading', level: 3, text: 'Subsection Title' }]
      render(<PostBlockRenderer blocks={blocks} />)

      expect(screen.getByText('Subsection Title')).toBeInTheDocument()
      expect(screen.getByText('Subsection Title').tagName).toBe('H3')
    })

    it('should render h1 with Playfair Display font', () => {
      const blocks: ContentBlock[] = [{ type: 'heading', level: 1, text: 'Main Title' }]
      render(<PostBlockRenderer blocks={blocks} />)

      const heading = screen.getByText('Main Title')
      expect(heading).toHaveStyle({ fontFamily: "'Playfair Display', serif" })
    })

    it('should render h2 with left border accent', () => {
      const blocks: ContentBlock[] = [{ type: 'heading', level: 2, text: 'Section Title' }]
      render(<PostBlockRenderer blocks={blocks} />)

      const heading = screen.getByText('Section Title')
      expect(heading).toHaveClass('border-l-[3px]', 'border-primary')
    })
  })

  describe('BlockItem - Paragraph', () => {
    it('should render paragraph text', () => {
      const blocks: ContentBlock[] = [{ type: 'paragraph', text: 'This is a paragraph.' }]
      render(<PostBlockRenderer blocks={blocks} />)

      expect(screen.getByText('This is a paragraph.')).toBeInTheDocument()
    })

    it('should render paragraph with correct styling', () => {
      const blocks: ContentBlock[] = [{ type: 'paragraph', text: 'Paragraph text' }]
      render(<PostBlockRenderer blocks={blocks} />)

      const paragraph = screen.getByText('Paragraph text')
      expect(paragraph.tagName).toBe('P')
      expect(paragraph).toHaveClass('text-slate-400')
    })

    it('should handle long paragraph text', () => {
      const longText = 'A'.repeat(500)
      const blocks: ContentBlock[] = [{ type: 'paragraph', text: longText }]
      render(<PostBlockRenderer blocks={blocks} />)

      expect(screen.getByText(longText)).toBeInTheDocument()
    })
  })

  describe('BlockItem - Image', () => {
    it('should render image with src and alt', () => {
      const blocks: ContentBlock[] = [
        { type: 'image', src: 'https://example.com/image.jpg', alt: 'Image description' }
      ]
      render(<PostBlockRenderer blocks={blocks} />)

      const img = screen.getByAltText('Image description')
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
    })

    it('should render image caption when alt is provided', () => {
      const blocks: ContentBlock[] = [
        { type: 'image', src: 'https://example.com/image.jpg', alt: 'Caption text' }
      ]
      render(<PostBlockRenderer blocks={blocks} />)

      expect(screen.getByText('Caption text')).toBeInTheDocument()
    })

    it('should not render anything when src is missing', () => {
      const blocks: ContentBlock[] = [{ type: 'image' }]
      const { container } = render(<PostBlockRenderer blocks={blocks} />)

      expect(container.firstChild?.childNodes.length).toBe(1)
    })

    it('should render image with rounded corners and border', () => {
      const blocks: ContentBlock[] = [
        { type: 'image', src: 'https://example.com/image.jpg' }
      ]
      const { container } = render(<PostBlockRenderer blocks={blocks} />)

      const figure = container.querySelector('figure')
      expect(figure).toHaveClass('rounded-2xl', 'overflow-hidden', 'border')
    })
  })

  describe('BlockItem - Button', () => {
    it('should render button with label', () => {
      const blocks: ContentBlock[] = [
        { type: 'button', label: 'Click Me', href: 'https://example.com' }
      ]
      render(<PostBlockRenderer blocks={blocks} />)

      expect(screen.getByText('Click Me')).toBeInTheDocument()
    })

    it('should render button with default label when not provided', () => {
      const blocks: ContentBlock[] = [{ type: 'button' }]
      render(<PostBlockRenderer blocks={blocks} />)

      expect(screen.getByText('Xem thêm')).toBeInTheDocument()
    })

    it('should render button as link with correct href', () => {
      const blocks: ContentBlock[] = [
        { type: 'button', label: 'Link Button', href: 'https://example.com' }
      ]
      render(<PostBlockRenderer blocks={blocks} />)

      const link = screen.getByText('Link Button')
      expect(link.tagName).toBe('A')
      expect(link).toHaveAttribute('href', 'https://example.com')
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('should render button with gradient background', () => {
      const blocks: ContentBlock[] = [{ type: 'button', label: 'Gradient Button' }]
      render(<PostBlockRenderer blocks={blocks} />)

      const button = screen.getByText('Gradient Button')
      expect(button).toHaveStyle({
        background: 'linear-gradient(135deg, #7c3bed, #a855f7)'
      })
    })
  })

  describe('BlockItem - List', () => {
    it('should render unordered list items', () => {
      const blocks: ContentBlock[] = [
        { type: 'list', items: ['Item 1', 'Item 2', 'Item 3'] }
      ]
      render(<PostBlockRenderer blocks={blocks} />)

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('should render ordered list with numbers', () => {
      const blocks: ContentBlock[] = [
        { type: 'list', ordered: true, items: ['First', 'Second'] }
      ]
      render(<PostBlockRenderer blocks={blocks} />)

      expect(screen.getByText('1.')).toBeInTheDocument()
      expect(screen.getByText('2.')).toBeInTheDocument()
    })

    it('should render list items with bullet points', () => {
      const blocks: ContentBlock[] = [
        { type: 'list', items: ['Bullet item'] }
      ]
      render(<PostBlockRenderer blocks={blocks} />)

      expect(screen.getByText('Bullet item')).toBeInTheDocument()
    })

    it('should handle empty list', () => {
      const blocks: ContentBlock[] = [{ type: 'list', items: [] }]
      const { container } = render(<PostBlockRenderer blocks={blocks} />)

      // Should render but with no items
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('BlockItem - Divider', () => {
    it('should render horizontal rule', () => {
      const blocks: ContentBlock[] = [{ type: 'divider' }]
      const { container } = render(<PostBlockRenderer blocks={blocks} />)

      const hr = container.querySelector('hr')
      expect(hr).toBeInTheDocument()
    })

    it('should render divider with gradient background', () => {
      const blocks: ContentBlock[] = [{ type: 'divider' }]
      const { container } = render(<PostBlockRenderer blocks={blocks} />)

      const hr = container.querySelector('hr')
      expect(hr).toHaveStyle({
        background: 'linear-gradient(90deg, transparent, #2d1f6e, transparent)'
      })
    })
  })

  describe('BlockItem - Highlight/Quote', () => {
    it('should render highlight content', () => {
      const blocks: ContentBlock[] = [
        { type: 'highlight', content: 'This is a highlighted quote.' }
      ]
      render(<PostBlockRenderer blocks={blocks} />)

      expect(screen.getByText('This is a highlighted quote.')).toBeInTheDocument()
    })

    it('should render as blockquote with styling', () => {
      const blocks: ContentBlock[] = [
        { type: 'highlight', content: 'Quote text' }
      ]
      render(<PostBlockRenderer blocks={blocks} />)

      const blockquote = screen.getByText('Quote text')
      expect(blockquote.tagName).toBe('BLOCKQUOTE')
      expect(blockquote).toHaveClass('border-l-[3px]', 'border-primary', 'italic')
    })

    it('should render highlight with violet text color', () => {
      const blocks: ContentBlock[] = [
        { type: 'highlight', content: 'Violet quote' }
      ]
      render(<PostBlockRenderer blocks={blocks} />)

      const blockquote = screen.getByText('Violet quote')
      expect(blockquote).toHaveClass('text-violet-300')
    })
  })

  describe('Multiple Blocks', () => {
    it('should render multiple blocks in sequence', () => {
      const blocks: ContentBlock[] = [
        { type: 'heading', level: 1, text: 'Title' },
        { type: 'paragraph', text: 'Paragraph 1' },
        { type: 'paragraph', text: 'Paragraph 2' },
      ]
      render(<PostBlockRenderer blocks={blocks} />)

      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument()
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument()
    })

    it('should render different block types together', () => {
      const blocks: ContentBlock[] = [
        { type: 'heading', level: 2, text: 'Section' },
        { type: 'paragraph', text: 'Content' },
        { type: 'divider' },
        { type: 'highlight', content: 'Quote' },
      ]
      const { container } = render(<PostBlockRenderer blocks={blocks} />)

      expect(screen.getByText('Section')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Quote')).toBeInTheDocument()
      expect(container.querySelector('hr')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle unknown block type', () => {
      const blocks: ContentBlock[] = [{ type: 'unknown' as any }]
      const { container } = render(<PostBlockRenderer blocks={blocks} />)

      // Should render nothing for unknown blocks
      expect(container.firstChild?.childNodes.length).toBe(1)
    })

    it('should handle blocks with missing text', () => {
      const blocks: ContentBlock[] = [
        { type: 'paragraph' },
        { type: 'heading', level: 1 }
      ]
      const { container } = render(<PostBlockRenderer blocks={blocks} />)

      // Should not crash
      expect(container).toBeInTheDocument()
    })

    it('should handle blocks with empty text', () => {
      const blocks: ContentBlock[] = [
        { type: 'paragraph', text: '' },
        { type: 'heading', level: 1, text: '' }
      ]
      const { container } = render(<PostBlockRenderer blocks={blocks} />)

      expect(container).toBeInTheDocument()
    })

    it('should handle very long content', () => {
      const longText = 'A'.repeat(1000)
      const blocks: ContentBlock[] = [{ type: 'paragraph', text: longText }]
      render(<PostBlockRenderer blocks={blocks} />)

      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('should handle special characters in content', () => {
      expect(screen.getByText('Special: <script>alert("xss")</script>')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should apply spacing between blocks', () => {
      const blocks: ContentBlock[] = [
        { type: 'paragraph', text: 'Block 1' },
        { type: 'paragraph', text: 'Block 2' },
      ]
      const { container } = render(<PostBlockRenderer blocks={blocks} />)

      expect(container.firstChild).toHaveClass('space-y-3')
    })

    it('should use sans-serif font family', () => {
      const blocks: ContentBlock[] = [{ type: 'paragraph', text: 'Text' }]
      const { container } = render(<PostBlockRenderer blocks={blocks} />)

      expect(container.firstChild).toHaveClass('font-sans')
    })
  })
})
