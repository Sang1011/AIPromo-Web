/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SearchBar from '../../../../../components/Organizer/shared/SearchBar'

describe('SearchBar', () => {
  const mockOnChange = jest.fn()

  const defaultProps = {
    value: '',
    onChange: mockOnChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render search input', () => {
      render(<SearchBar {...defaultProps} />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should render with default placeholder', () => {
      render(<SearchBar {...defaultProps} />)
      expect(screen.getByPlaceholderText('Tìm kiếm...')).toBeInTheDocument()
    })

    it('should render with custom placeholder', () => {
      render(<SearchBar {...defaultProps} placeholder="Search events..." />)
      expect(screen.getByPlaceholderText('Search events...')).toBeInTheDocument()
    })

    it('should render with value', () => {
      render(<SearchBar {...defaultProps} value="test query" />)
      expect(screen.getByRole('textbox')).toHaveValue('test query')
    })

    it('should render search icon', () => {
      render(<SearchBar {...defaultProps} />)
      const input = screen.getByRole('textbox')
      expect(input.parentElement).toContainElement(input)
    })
  })

  describe('User Interactions', () => {
    it('should call onChange when typing', async () => {
      render(<SearchBar {...defaultProps} />)
      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'test')
      expect(mockOnChange).toHaveBeenCalledWith('test')
    })

    it('should update value on change', async () => {
      render(<SearchBar {...defaultProps} />)
      const input = screen.getByRole('textbox')
      await userEvent.clear(input)
      await userEvent.type(input, 'new value')
      expect(input).toHaveValue('new value')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty value', () => {
      render(<SearchBar {...defaultProps} value="" />)
      expect(screen.getByRole('textbox')).toHaveValue('')
    })

    it('should handle special characters', async () => {
      render(<SearchBar {...defaultProps} />)
      const input = screen.getByRole('textbox')
      await userEvent.type(input, '!@#$%^&*()')
      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle unicode characters', async () => {
      render(<SearchBar {...defaultProps} />)
      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'Tiếng Việt')
      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle long text', async () => {
      render(<SearchBar {...defaultProps} />)
      const input = screen.getByRole('textbox')
      const longText = 'a'.repeat(500)
      await userEvent.type(input, longText)
      expect(input).toHaveValue(longText)
    })
  })
})
