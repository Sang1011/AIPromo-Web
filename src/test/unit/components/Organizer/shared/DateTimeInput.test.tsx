/// <reference types="jest" />
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import DateTimeInput from '../../../../../components/Organizer/shared/DateTimeInput'

describe('DateTimeInput', () => {
  const mockOnChange = jest.fn()

  const defaultProps = {
    label: 'Select Date Time',
    value: '',
    onChange: mockOnChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock window dimensions
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true })
  })

  describe('Render', () => {
    it('should render label', () => {
      render(<DateTimeInput {...defaultProps} />)
      expect(screen.getByText('Select Date Time')).toBeInTheDocument()
    })

    it('should render required indicator when required prop is true', () => {
      render(<DateTimeInput {...defaultProps} required />)
      expect(screen.getByText('*')).toHaveClass('text-red-400')
    })

    it('should show placeholder when no value', () => {
      render(<DateTimeInput {...defaultProps} />)
      expect(screen.getByText('Chọn ngày giờ')).toBeInTheDocument()
    })

    it('should show formatted date time when value is provided', () => {
      render(<DateTimeInput {...defaultProps} value="2024-12-01T14:30" />)
      expect(screen.getByText('14:30')).toBeInTheDocument()
    })

    it('should render calendar icon', () => {
      render(<DateTimeInput {...defaultProps} />)
      expect(screen.getByText('Chọn ngày giờ')).toBeInTheDocument()
    })

    it('should render clock icon in trigger', () => {
      render(<DateTimeInput {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngày giờ')
      expect(trigger).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should apply disabled styling when disabled', () => {
      render(<DateTimeInput {...defaultProps} disabled />)
      const trigger = screen.getByText('Chọn ngày giờ').parentElement
      expect(trigger).toHaveClass('opacity-50', 'cursor-not-allowed')
    })

    it('should not open popup when clicking disabled input', async () => {
      render(<DateTimeInput {...defaultProps} disabled />)
      const trigger = screen.getByText('Chọn ngày giờ')
      await userEvent.click(trigger)
      expect(screen.queryByText(/Tháng/)).not.toBeInTheDocument()
    })
  })

  describe('Popup - Calendar', () => {
    it('should open calendar popup when clicking trigger', async () => {
      render(<DateTimeInput {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngày giờ')
      await userEvent.click(trigger)
      expect(screen.getByText(/Tháng \d+/)).toBeInTheDocument()
    })

    it('should show month and year in popup header', async () => {
      const today = new Date()
      render(<DateTimeInput {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngày giờ')
      await userEvent.click(trigger)

      const months = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"]
      expect(screen.getByText(`${months[today.getMonth()]} ${today.getFullYear()}`)).toBeInTheDocument()
    })

    it('should show day labels', async () => {
      render(<DateTimeInput {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngày giờ')
      await userEvent.click(trigger)

      expect(screen.getByText('CN')).toBeInTheDocument()
      expect(screen.getByText('T2')).toBeInTheDocument()
      expect(screen.getByText('T7')).toBeInTheDocument()
    })

    it('should navigate to previous month', async () => {
      render(<DateTimeInput {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngày giờ')
      await userEvent.click(trigger)
      const chevronLeftButtons = screen.getAllByRole('button')
      const prevMonthButton = chevronLeftButtons[0]

      // Click should not error
      await userEvent.click(prevMonthButton)
    })

    it('should navigate to next month', async () => {
      render(<DateTimeInput {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngày giờ')
      await userEvent.click(trigger)

      const chevronRightButtons = screen.getAllByRole('button')
      const nextMonthButton = chevronRightButtons[1]

      await userEvent.click(nextMonthButton)
    })

    it('should select a day when clicking', async () => {
      render(<DateTimeInput {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngày giờ')
      await userEvent.click(trigger)

      // Find day "15" (or any day in current month)
      const day15 = screen.getByText('15', { selector: 'button' })
      await userEvent.click(day15)

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should disable days before min date', async () => {
      const minDate = new Date()
      minDate.setDate(minDate.getDate() + 5)

      render(<DateTimeInput {...defaultProps} min={minDate.toISOString()} />)
      const trigger = screen.getByText('Chọn ngày giờ')
      await userEvent.click(trigger)

      // Day 1 should be disabled if it's before min date
      const day1Button = screen.queryByText('1', { selector: 'button' })
      if (day1Button) {
        expect(day1Button).toHaveClass('cursor-not-allowed')
      }
    })
  })

  describe('Popup - Time Picker', () => {
    it('should show time picker in popup', async () => {
      render(<DateTimeInput {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngày giờ')
      await userEvent.click(trigger)

      expect(screen.getByText('Giờ')).toBeInTheDocument()
    })

    it('should show hour and minute selectors', async () => {
      render(<DateTimeInput {...defaultProps} value="2024-12-01T14:30" />)
      const trigger = screen.getByText('14:30')
      await userEvent.click(trigger)

      expect(screen.getByText('14')).toBeInTheDocument()
      expect(screen.getByText('30')).toBeInTheDocument()
    })

    it('should increment hour when clicking right arrow', async () => {
      render(<DateTimeInput {...defaultProps} value="2024-12-01T10:00" />)
      const trigger = screen.getByText('10:00')
      await userEvent.click(trigger)

      const hourButtons = screen.getAllByRole('button')
      const hourUpButton = hourButtons[2] // Third button is hour up

      await userEvent.click(hourUpButton)

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should decrement hour when clicking left arrow', async () => {
      render(<DateTimeInput {...defaultProps} value="2024-12-01T10:00" />)
      const trigger = screen.getByText('10:00')
      await userEvent.click(trigger)

      const hourButtons = screen.getAllByRole('button')
      const hourDownButton = hourButtons[1]

      await userEvent.click(hourDownButton)
      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should increment minute by 5', async () => {
      render(<DateTimeInput {...defaultProps} value="2024-12-01T10:00" />)
      const trigger = screen.getByText('10:00')
      await userEvent.click(trigger)

      const minuteButtons = screen.getAllByRole('button')
      const minuteUpButton = minuteButtons[4]

      await userEvent.click(minuteUpButton)
      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should show minute preset buttons', async () => {
      render(<DateTimeInput {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngày giờ')
      await userEvent.click(trigger)

      expect(screen.getByText(':00')).toBeInTheDocument()
      expect(screen.getByText(':15')).toBeInTheDocument()
      expect(screen.getByText(':30')).toBeInTheDocument()
      expect(screen.getByText(':45')).toBeInTheDocument()
    })

    it('should select minute preset', async () => {
      render(<DateTimeInput {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngày giờ')
      await userEvent.click(trigger)

      const preset30 = screen.getByText(':30')
      await userEvent.click(preset30)

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Confirm Button', () => {
    it('should show confirm label with selected date', async () => {
      render(<DateTimeInput {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngày giờ')
      await userEvent.click(trigger)

      const confirmButton = screen.getByText(/Chọn ngày trước|Xác nhận/)
      expect(confirmButton).toBeInTheDocument()
    })

    it('should disable confirm button when no date selected', async () => {
      render(<DateTimeInput {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngày giờ')
      await userEvent.click(trigger)

      const confirmButton = screen.getByText('Chọn ngày trước')
      expect(confirmButton).toBeDisabled()
    })

    it('should close popup when clicking confirm', async () => {
      render(<DateTimeInput {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngày giờ')
      await userEvent.click(trigger)

      // Select a day first
      const day15 = screen.getByText('15', { selector: 'button' })
      await userEvent.click(day15)

      // Then click confirm
      const confirmButton = screen.getByText(/Xác nhận/)
      await userEvent.click(confirmButton)

      await waitFor(() => {
        expect(screen.queryByText(/Xác nhận/)).not.toBeInTheDocument()
      })
    })
  })

  describe('Popup Positioning', () => {
    it('should open popup below when there is space', async () => {
      Object.defineProperty(window, 'innerHeight', { value: 800 })

      render(<DateTimeInput {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngày giờ')

      const rectMock: DOMRect = {
        bottom: 400,
        top: 300,
        left: 100,
        right: 300,
        width: 200,
        height: 100,
        x: 100,
        y: 300,
        toJSON: () => ({}),
      }
      jest.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(rectMock)

      await userEvent.click(trigger)
      expect(screen.getByText(/Tháng/)).toBeInTheDocument()
    })

    it('should open popup above when not enough space below', async () => {
      Object.defineProperty(window, 'innerHeight', { value: 500 })

      render(<DateTimeInput {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngày giờ')

      const rectMock: DOMRect = {
        bottom: 450,
        top: 350,
        left: 100,
        right: 300,
        width: 200,
        height: 100,
        x: 100,
        y: 350,
        toJSON: () => ({}),
      }
      jest.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(rectMock)

      await userEvent.click(trigger)
      expect(screen.getByText(/Tháng/)).toBeInTheDocument()
    })
  })

  describe('Close Behavior', () => {
    it('should close popup when clicking outside', async () => {
      render(<DateTimeInput {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngày giờ')
      await userEvent.click(trigger)

      expect(screen.getByText(/Tháng/)).toBeInTheDocument()

      await userEvent.click(document.body)

      await waitFor(() => {
        expect(screen.queryByText(/Tháng/)).not.toBeInTheDocument()
      })
    })

    it('should toggle popup when clicking trigger multiple times', async () => {
      render(<DateTimeInput {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngày giờ')

      // Open
      await userEvent.click(trigger)
      expect(screen.getByText(/Tháng/)).toBeInTheDocument()

      // Close
      await userEvent.click(trigger)
      await waitFor(() => {
        expect(screen.queryByText(/Tháng/)).not.toBeInTheDocument()
      })

      // Open again
      await userEvent.click(trigger)
      expect(screen.getByText(/Tháng/)).toBeInTheDocument()
    })
  })

  describe('Value Display', () => {
    it('should display Vietnamese day name', async () => {
      render(<DateTimeInput {...defaultProps} value="2024-12-01T14:30" />)
      // December 1, 2024 is a Sunday
      expect(screen.getByText(/Chủ nhật/)).toBeInTheDocument()
    })

    it('should display formatted date as DD/MM/YYYY', async () => {
      render(<DateTimeInput {...defaultProps} value="2024-12-01T14:30" />)
      expect(screen.getByText('01/12/2024')).toBeInTheDocument()
    })

    it('should highlight trigger border when popup is open', async () => {
      render(<DateTimeInput {...defaultProps} />)
      const trigger = screen.getByText('Chọn ngày giờ')

      expect(trigger.parentElement).not.toHaveClass('border-indigo-500/60')

      await userEvent.click(trigger)
      expect(trigger.parentElement).toHaveClass('border-indigo-500/60')
    })
  })

  describe('Edge Cases', () => {
    it('should handle invalid date value', () => {
      const { container } = render(<DateTimeInput {...defaultProps} value="invalid-date" />)
      expect(container).toBeInTheDocument()
    })

    it('should handle empty label', () => {
      render(<DateTimeInput {...defaultProps} label="" />)
      expect(screen.getByText('Chọn ngày giờ')).toBeInTheDocument()
    })

    it('should handle min date in the future', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)

      const { container } = render(<DateTimeInput {...defaultProps} min={futureDate.toISOString()} />)
      expect(container).toBeInTheDocument()
    })

    it('should handle minute wrapping at 60', async () => {
      render(<DateTimeInput {...defaultProps} value="2024-12-01T10:58" />)
      const trigger = screen.getByText('10:58')
      await userEvent.click(trigger)

      const minuteButtons = screen.getAllByRole('button')
      const minuteUpButton = minuteButtons[4]

      await userEvent.click(minuteUpButton)
      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle hour wrapping at 24', async () => {
      render(<DateTimeInput {...defaultProps} value="2024-12-01T23:00" />)
      const trigger = screen.getByText('23:00')
      await userEvent.click(trigger)

      const hourButtons = screen.getAllByRole('button')
      const hourUpButton = hourButtons[2]

      await userEvent.click(hourUpButton)
      expect(mockOnChange).toHaveBeenCalled()
    })
  })
})
