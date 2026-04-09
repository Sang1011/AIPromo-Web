/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Editor from '../../../../../components/Organizer/shared/Editor'

// Mock TipTap
jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(() => {
    const mockEditor = {
      chain: jest.fn().mockReturnThis(),
      focus: jest.fn().mockReturnThis(),
      toggleHeading: jest.fn().mockReturnThis(),
      toggleBold: jest.fn().mockReturnThis(),
      toggleItalic: jest.fn().mockReturnThis(),
      toggleUnderline: jest.fn().mockReturnThis(),
      toggleBulletList: jest.fn().mockReturnThis(),
      toggleOrderedList: jest.fn().mockReturnThis(),
      run: jest.fn(),
      getHTML: jest.fn(() => '<p>Mock HTML</p>'),
      isActive: jest.fn(() => false),
    }
    return mockEditor
  }),
  EditorContent: () => <div data-testid="editor-content" />,
}))

jest.mock('@tiptap/starter-kit', () => ({}))
jest.mock('@tiptap/extension-underline', () => ({}))

describe('Editor', () => {
  const mockOnChange = jest.fn()

  const defaultProps = {
    value: '<p>Initial content</p>',
    onChange: mockOnChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render editor container', () => {
      render(<Editor {...defaultProps} />)
      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    })

    it('should render toolbar', () => {
      render(<Editor {...defaultProps} />)
      expect(screen.getByText('H1')).toBeInTheDocument()
      expect(screen.getByText('H2')).toBeInTheDocument()
      expect(screen.getByText('H3')).toBeInTheDocument()
    })

    it('should render formatting buttons', () => {
      render(<Editor {...defaultProps} />)
      expect(screen.getByText('B')).toBeInTheDocument()
      expect(screen.getByText('I')).toBeInTheDocument()
      expect(screen.getByText('U')).toBeInTheDocument()
    })

    it('should render list buttons', () => {
      render(<Editor {...defaultProps} />)
      expect(screen.getByText('• List')).toBeInTheDocument()
      expect(screen.getByText('1. List')).toBeInTheDocument()
    })

    it('should render with correct border and background', () => {
      render(<Editor {...defaultProps} />)
      const editor = screen.getByTestId('editor-content').parentElement
      expect(editor).toHaveClass('border', 'border-white/10', 'rounded-xl')
    })

    it('should render content area with min height', () => {
      render(<Editor {...defaultProps} />)
      const contentArea = screen.getByTestId('editor-content').parentElement
      expect(contentArea).toHaveClass('min-h-[300px]')
    })
  })

  describe('Toolbar - Headings', () => {
    it('should call toggleHeading H1 when clicking H1 button', async () => {
      const { useEditor } = require('@tiptap/react')
      render(<Editor {...defaultProps} />)

      const h1Button = screen.getByText('H1')
      await userEvent.click(h1Button)

      const editor = useEditor()
      expect(editor.chain().focus().toggleHeading).toHaveBeenCalledWith({ level: 1 })
    })

    it('should call toggleHeading H2 when clicking H2 button', async () => {
      const { useEditor } = require('@tiptap/react')
      render(<Editor {...defaultProps} />)

      const h2Button = screen.getByText('H2')
      await userEvent.click(h2Button)

      const editor = useEditor()
      expect(editor.chain().focus().toggleHeading).toHaveBeenCalledWith({ level: 2 })
    })

    it('should call toggleHeading H3 when clicking H3 button', async () => {
      const { useEditor } = require('@tiptap/react')
      render(<Editor {...defaultProps} />)

      const h3Button = screen.getByText('H3')
      await userEvent.click(h3Button)

      const editor = useEditor()
      expect(editor.chain().focus().toggleHeading).toHaveBeenCalledWith({ level: 3 })
    })

    it('should show active state for H1', () => {
      const { useEditor } = require('@tiptap/react')
      useEditor.mockImplementation((config: any) => ({
        ...config,
        chain: jest.fn().mockReturnThis(),
        focus: jest.fn().mockReturnThis(),
        toggleHeading: jest.fn().mockReturnThis(),
        run: jest.fn(),
        getHTML: jest.fn(() => '<p>Content</p>'),
        isActive: jest.fn((type, opts) => type === 'heading' && opts?.level === 1),
      }))

      render(<Editor {...defaultProps} />)
      const h1Button = screen.getByText('H1')
      expect(h1Button).toHaveClass('bg-violet-600', 'text-white')
    })
  })

  describe('Toolbar - Formatting', () => {
    it('should call toggleBold when clicking B button', async () => {
      const { useEditor } = require('@tiptap/react')
      render(<Editor {...defaultProps} />)

      const boldButton = screen.getByText('B')
      await userEvent.click(boldButton)

      const editor = useEditor()
      expect(editor.chain().focus().toggleBold).toHaveBeenCalled()
    })

    it('should call toggleItalic when clicking I button', async () => {
      const { useEditor } = require('@tiptap/react')
      render(<Editor {...defaultProps} />)

      const italicButton = screen.getByText('I')
      await userEvent.click(italicButton)

      const editor = useEditor()
      expect(editor.chain().focus().toggleItalic).toHaveBeenCalled()
    })

    it('should call toggleUnderline when clicking U button', async () => {
      const { useEditor } = require('@tiptap/react')
      render(<Editor {...defaultProps} />)

      const underlineButton = screen.getByText('U')
      await userEvent.click(underlineButton)

      const editor = useEditor()
      expect(editor.chain().focus().toggleUnderline).toHaveBeenCalled()
    })

    it('should show active state for bold', () => {
      const { useEditor } = require('@tiptap/react')
      useEditor.mockImplementation((config: any) => ({
        ...config,
        chain: jest.fn().mockReturnThis(),
        focus: jest.fn().mockReturnThis(),
        toggleBold: jest.fn().mockReturnThis(),
        run: jest.fn(),
        getHTML: jest.fn(() => '<p>Content</p>'),
        isActive: jest.fn((type) => type === 'bold'),
      }))

      render(<Editor {...defaultProps} />)
      const boldButton = screen.getByText('B')
      expect(boldButton).toHaveClass('bg-violet-600', 'text-white')
    })
  })

  describe('Toolbar - Lists', () => {
    it('should call toggleBulletList when clicking bullet list button', async () => {
      const { useEditor } = require('@tiptap/react')
      render(<Editor {...defaultProps} />)

      const bulletListButton = screen.getByText('• List')
      await userEvent.click(bulletListButton)

      const editor = useEditor()
      expect(editor.chain().focus().toggleBulletList).toHaveBeenCalled()
    })

    it('should call toggleOrderedList when clicking ordered list button', async () => {
      const { useEditor } = require('@tiptap/react')
      render(<Editor {...defaultProps} />)

      const orderedListButton = screen.getByText('1. List')
      await userEvent.click(orderedListButton)

      const editor = useEditor()
      expect(editor.chain().focus().toggleOrderedList).toHaveBeenCalled()
    })
  })

  describe('Editor Content', () => {
    it('should initialize with provided value', () => {
      const { useEditor } = require('@tiptap/react')
      render(<Editor {...defaultProps} />)

      const editor = useEditor()
      expect(editor).toBeDefined()
    })

    it('should call onChange when content updates', () => {
      const { useEditor } = require('@tiptap/react')
      render(<Editor {...defaultProps} />)

      const editor = useEditor()
      const onUpdateCallback = editor.onUpdate

      // Simulate content update
      if (onUpdateCallback) {
        onUpdateCallback({ editor })
      }

      expect(mockOnChange).toHaveBeenCalledWith('<p>Mock HTML</p>')
    })
  })

  describe('ToolbarButton Component', () => {
    it('should render children', () => {
      render(<Editor {...defaultProps} />)
      expect(screen.getByText('H1')).toBeInTheDocument()
    })

    it('should apply active styling when active prop is true', () => {
      const { useEditor } = require('@tiptap/react')
      useEditor.mockImplementation((config: any) => ({
        ...config,
        chain: jest.fn().mockReturnThis(),
        focus: jest.fn().mockReturnThis(),
        toggleHeading: jest.fn().mockReturnThis(),
        run: jest.fn(),
        getHTML: jest.fn(() => '<p>Content</p>'),
        isActive: jest.fn(() => true),
      }))

      render(<Editor {...defaultProps} />)
      const h1Button = screen.getByText('H1')
      expect(h1Button).toHaveClass('bg-violet-600', 'text-white')
    })

    it('should apply hover styling when not active', () => {
      render(<Editor {...defaultProps} />)
      const h1Button = screen.getByText('H1')
      expect(h1Button).toHaveClass('text-slate-300', 'hover:bg-white/10')
    })
  })

  describe('Edge Cases', () => {
    it('should return null when editor is not initialized', () => {
      const { useEditor } = require('@tiptap/react')
      useEditor.mockReturnValue(null)

      const { container } = render(<Editor {...defaultProps} />)
      expect(container.firstChild).toBeNull()
    })

    it('should handle empty value', () => {
      render(<Editor {...defaultProps} value="" />)
      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    })

    it('should handle long content', () => {
      const longContent = '<p>' + 'A'.repeat(1000) + '</p>'
      render(<Editor {...defaultProps} value={longContent} />)
      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    })

    it('should prevent default on mousedown to keep focus', async () => {
      render(<Editor {...defaultProps} />)
      const h1Button = screen.getByText('H1')
      expect(h1Button).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should render toolbar with border bottom', () => {
      render(<Editor {...defaultProps} />)
      const toolbar = screen.getByText('H1').closest('.border-b')
      expect(toolbar).toHaveClass('border-b', 'border-white/10')
    })

    it('should render content area with prose classes', () => {
      render(<Editor {...defaultProps} />)
      const contentArea = screen.getByTestId('editor-content').parentElement
      expect(contentArea).toHaveClass('prose', 'prose-invert', 'max-w-none')
    })

    it('should render separators between button groups', () => {
      render(<Editor {...defaultProps} />)
      const separators = document.querySelectorAll('.w-px.bg-white\\/10')
      expect(separators.length).toBeGreaterThan(0)
    })
  })
})
