/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import BankSelect from '../../../../../components/Organizer/bank/BankSelect'

describe('BankSelect', () => {
  const mockBanks = [
    { code: 'VCB', name: 'Vietcombank' },
    { code: 'TCB', name: 'Techcombank' },
    { code: 'ACB', name: 'ACB Bank' },
    { code: 'VPB', name: 'VPBank' },
  ]

  const mockOnChange = jest.fn()

  const defaultProps = {
    label: 'Select Bank',
    banks: mockBanks,
    value: '',
    onChange: mockOnChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render label', () => {
      render(<BankSelect {...defaultProps} />)
      expect(screen.getByText('Select Bank')).toBeInTheDocument()
    })

    it('should render with required indicator when required prop is true', () => {
      render(<BankSelect {...defaultProps} required />)
      expect(screen.getByText('*')).toHaveClass('text-red-500')
    })

    it('should show placeholder text when no value selected', () => {
      render(<BankSelect {...defaultProps} />)
      expect(screen.getByText('Chọn ngân hàng')).toBeInTheDocument()
    })

    it('should show selected bank name when value is provided', () => {
      render(<BankSelect {...defaultProps} value="VCB" />)
      expect(screen.getByText('Vietcombank')).toBeInTheDocument()
    })

    it('should render dropdown trigger with chevron icon', () => {
      render(<BankSelect {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngân hàng')
      expect(trigger).toBeInTheDocument()

      const chevron = document.querySelector('.rotate-180')
      expect(chevron).toBeInTheDocument()
    })

    it('should apply error styling when error prop is true', () => {
      render(<BankSelect {...defaultProps} error={true} />)
      const trigger = screen.getByText('Chọn ngân hàng').parentElement
      expect(trigger).toHaveClass('border-red-500')
    })

    it('should apply normal styling when error prop is false', () => {
      render(<BankSelect {...defaultProps} error={false} />)
      const trigger = screen.getByText('Chọn ngân hàng').parentElement
      expect(trigger).toHaveClass('border-white/10')
    })
  })

  describe('User Interactions', () => {
    it('should open dropdown when clicking trigger', async () => {
      render(<BankSelect {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngân hàng')

      await userEvent.click(trigger)

      expect(screen.getByPlaceholderText('Tìm ngân hàng...')).toBeInTheDocument()
    })

    it('should show all banks in dropdown when opened', async () => {
      render(<BankSelect {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngân hàng')

      await userEvent.click(trigger)

      expect(screen.getByText('Vietcombank')).toBeInTheDocument()
      expect(screen.getByText('Techcombank')).toBeInTheDocument()
      expect(screen.getByText('ACB Bank')).toBeInTheDocument()
      expect(screen.getByText('VPBank')).toBeInTheDocument()
    })

    it('should filter banks when searching', async () => {
      render(<BankSelect {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngân hàng')

      await userEvent.click(trigger)

      const searchInput = screen.getByPlaceholderText('Tìm ngân hàng...')
      await userEvent.type(searchInput, 'Viet')

      expect(screen.getByText('Vietcombank')).toBeInTheDocument()
      expect(screen.getByText('Techcombank')).toBeInTheDocument()
      expect(screen.queryByText('ACB Bank')).not.toBeInTheDocument()
      expect(screen.queryByText('VPBank')).not.toBeInTheDocument()
    })

    it('should call onChange with bank code when selecting a bank', async () => {
      render(<BankSelect {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngân hàng')

      await userEvent.click(trigger)

      const bankOption = screen.getByText('Vietcombank')
      await userEvent.click(bankOption)

      expect(mockOnChange).toHaveBeenCalledWith('VCB')
    })

    it('should close dropdown after selecting a bank', async () => {
      render(<BankSelect {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngân hàng')

      await userEvent.click(trigger)
      const bankOption = screen.getByText('Vietcombank')
      await userEvent.click(bankOption)

      expect(screen.queryByPlaceholderText('Tìm ngân hàng...')).not.toBeInTheDocument()
    })

    it('should update trigger text after selecting a bank', async () => {
      render(<BankSelect {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngân hàng')

      await userEvent.click(trigger)
      const bankOption = screen.getByText('Vietcombank')
      await userEvent.click(bankOption)

      expect(screen.getByText('Vietcombank')).toBeInTheDocument()
    })

    it('should toggle dropdown when clicking trigger multiple times', async () => {
      render(<BankSelect {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngân hàng')

      // Open
      await userEvent.click(trigger)
      expect(screen.getByPlaceholderText('Tìm ngân hàng...')).toBeInTheDocument()

      // Close
      await userEvent.click(trigger)
      expect(screen.queryByPlaceholderText('Tìm ngân hàng...')).not.toBeInTheDocument()

      // Open again
      await userEvent.click(trigger)
      expect(screen.getByPlaceholderText('Tìm ngân hàng...')).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('should filter banks case-insensitively', async () => {
      render(<BankSelect {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngân hàng')

      await userEvent.click(trigger)

      const searchInput = screen.getByPlaceholderText('Tìm ngân hàng...')
      await userEvent.type(searchInput, 'viet')

      expect(screen.getByText('Vietcombank')).toBeInTheDocument()
      expect(screen.getByText('Techcombank')).toBeInTheDocument()
    })

    it('should show empty state when no banks match search', async () => {
      render(<BankSelect {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngân hàng')

      await userEvent.click(trigger)

      const searchInput = screen.getByPlaceholderText('Tìm ngân hàng...')
      await userEvent.type(searchInput, 'xyz')

      expect(screen.queryByText('Vietcombank')).not.toBeInTheDocument()
      expect(screen.queryByText('Techcombank')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty banks array', async () => {
      render(<BankSelect {...defaultProps} banks={[]} />)
      const trigger = screen.getByText('Chọn ngân hàng')

      await userEvent.click(trigger)

      expect(screen.getByPlaceholderText('Tìm ngân hàng...')).toBeInTheDocument()
    })

    it('should handle very long bank names', async () => {
      const longNameBanks = [
        { code: 'LONG', name: 'A'.repeat(100) },
      ]

      render(<BankSelect {...defaultProps} banks={longNameBanks} />)
      const trigger = screen.getByText('Chọn ngân hàng')

      await userEvent.click(trigger)

      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument()
    })

    it('should handle special characters in search', async () => {
      render(<BankSelect {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngân hàng')

      await userEvent.click(trigger)

      const searchInput = screen.getByPlaceholderText('Tìm ngân hàng...')
      await userEvent.type(searchInput, '!@#$%')

      expect(screen.queryByText('Vietcombank')).not.toBeInTheDocument()
    })
  })

  describe('Label Component', () => {
    it('should render label without required indicator by default', () => {
      render(<BankSelect {...defaultProps} />)
      expect(screen.getByText('Select Bank')).toBeInTheDocument()
      expect(screen.queryByText('*')).not.toBeInTheDocument()
    })

    it('should render label with required indicator', () => {
      render(<BankSelect {...defaultProps} required />)
      const label = screen.getByText(/Select Bank/)
      expect(label).toHaveTextContent('*')
    })
  })
})
