/// <reference types="jest" />
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CreateSessionModal from '../../../../../components/Organizer/sessions/CreateSessionModal'

// Mock Redux
const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../../../../store/eventSlice', () => ({
  fetchCreateEventSessions: jest.fn(({ eventId, data }) => ({
    type: 'EVENT/createSessions',
    payload: { eventId, data },
  })),
}))

// Mock utils
jest.mock('../../../../../utils/notify', () => ({
  notify: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
}))

jest.mock('../../../../../utils/eventValidation', () => ({
  validateSession: jest.fn((session, event) => {
    const errors: any[] = []
    if (!session.title?.trim()) errors.push({ field: 'title', message: 'Tiêu đề không được để trống' })
    if (!session.startTime) errors.push({ field: 'startTime', message: 'Vui lòng chọn thời gian bắt đầu' })
    if (!session.endTime) errors.push({ field: 'endTime', message: 'Vui lòng chọn thời gian kết thúc' })
    if (session.startTime && session.endTime && new Date(session.startTime) >= new Date(session.endTime)) {
      errors.push({ field: 'endTime', message: 'Thời gian kết thúc phải sau thời gian bắt đầu' })
    }
    if (event.eventStartAt && session.startTime && new Date(session.startTime) < new Date(event.eventStartAt)) {
      errors.push({ field: 'startTime', message: `Suất diễn phải bắt đầu từ ${event.eventStartAt} trở đi` })
    }
    if (event.eventEndAt && session.endTime && new Date(session.endTime) > new Date(event.eventEndAt)) {
      errors.push({ field: 'endTime', message: `Suất diễn phải kết thúc trước ${event.eventEndAt}` })
    }
    return { valid: errors.length === 0, errors }
  }),
  errorsToFieldMap: jest.fn((errors: any[]) => {
    const map: Record<string, string> = {}
    errors.forEach(e => { map[e.field] = e.message })
    return map
  }),
}))

jest.mock('../../../../../utils/dateTimeVN', () => ({
  localToIso: jest.fn((local) => `${local}:00.000Z`),
}))

// Mock DateTimeInput component
jest.mock('../../../../../components/Organizer/shared/DateTimeInput', () => ({
  __esModule: true,
  default: ({ label, value, onChange, disabled }: any) => (
    <div data-testid={`datetime-${label === 'Bắt đầu' ? 'start' : 'end'}`}>
      <label>{label}</label>
      <input
        data-testid={`input-${label === 'Bắt đầu' ? 'start' : 'end'}`}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={`Input ${label}`}
      />
    </div>
  ),
}))

describe('CreateSessionModal', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    eventId: 'event-123',
    eventStartAt: '2024-12-01T10:00:00Z',
    eventEndAt: '2024-12-01T18:00:00Z',
    onCreated: jest.fn(),
    isAllowUpdate: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockResolvedValue({})
  })

  describe('Render', () => {
    it('should not render when open is false', () => {
      render(<CreateSessionModal {...defaultProps} open={false} />)
      expect(screen.queryByText('Tạo suất diễn')).not.toBeInTheDocument()
    })

    it('should render modal when open is true', () => {
      render(<CreateSessionModal {...defaultProps} />)
      expect(screen.getByText('Tạo suất diễn')).toBeInTheDocument()
      expect(screen.getByText('Điền thông tin chi tiết cho suất diễn mới của bạn.')).toBeInTheDocument()
    })

    it('should render form fields', () => {
      render(<CreateSessionModal {...defaultProps} />)
      expect(screen.getByPlaceholderText('VD: Buổi sáng - Khai mạc')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Nhập nội dung tóm tắt...')).toBeInTheDocument()
    })

    it('should render DateTimeInput components', () => {
      render(<CreateSessionModal {...defaultProps} />)
      expect(screen.getByTestId('datetime-start')).toBeInTheDocument()
      expect(screen.getByTestId('datetime-end')).toBeInTheDocument()
    })

    it('should render action buttons', () => {
      render(<CreateSessionModal {...defaultProps} />)
      expect(screen.getByText('Hủy')).toBeInTheDocument()
      expect(screen.getByText('Tạo ngay')).toBeInTheDocument()
    })

    it('should render event window hint when event times are provided', () => {
      render(<CreateSessionModal {...defaultProps} />)
      expect(screen.getByText('Khung giờ cho phép')).toBeInTheDocument()
      expect(screen.getByText('Từ')).toBeInTheDocument()
      expect(screen.getByText('Đến')).toBeInTheDocument()
    })

    it('should not render event window hint when no event times', () => {
      render(<CreateSessionModal {...defaultProps} eventStartAt={undefined} eventEndAt={undefined} />)
      expect(screen.queryByText('Khung giờ cho phép')).not.toBeInTheDocument()
    })

    it('should render event start date in hint', () => {
      render(<CreateSessionModal {...defaultProps} />)
      expect(screen.getByText(/10:00/)).toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('should show error for empty title', async () => {
      render(<CreateSessionModal {...defaultProps} />)
      const submitButton = screen.getByText('Tạo ngay')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Tiêu đề không được để trống')).toBeInTheDocument()
      })
    })

    it('should show error for missing start time', async () => {
      render(<CreateSessionModal {...defaultProps} />)
      await userEvent.type(screen.getByPlaceholderText('VD: Buổi sáng - Khai mạc'), 'Test Session')

      const startInput = screen.getByTestId('input-start')
      await userEvent.type(startInput, '2024-12-01T09:00')

      const submitButton = screen.getByText('Tạo ngay')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Vui lòng chọn thời gian kết thúc')).toBeInTheDocument()
      })
    })

    it('should clear errors when typing', async () => {
      render(<CreateSessionModal {...defaultProps} />)

      // Trigger validation
      const submitButton = screen.getByText('Tạo ngay')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Tiêu đề không được để trống')).toBeInTheDocument()
      })

      // Clear error
      const titleInput = screen.getByPlaceholderText('VD: Buổi sáng - Khai mạc')
      await userEvent.type(titleInput, 'Test')

      await waitFor(() => {
        expect(screen.queryByText('Tiêu đề không được để trống')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should dispatch create session action on valid submit', async () => {
      const { fetchCreateEventSessions } = require('../../../../../store/eventSlice')
      render(<CreateSessionModal {...defaultProps} />)

      await userEvent.type(screen.getByPlaceholderText('VD: Buổi sáng - Khai mạc'), 'Test Session')

      const startInput = screen.getByTestId('input-start')
      await userEvent.type(startInput, '2024-12-01T12:00')

      const endInput = screen.getByTestId('input-end')
      await userEvent.type(endInput, '2024-12-01T14:00')

      const submitButton = screen.getByText('Tạo ngay')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchCreateEventSessions({
            eventId: 'event-123',
            data: {
              sessions: [{
                title: 'Test Session',
                description: '',
                startTime: '2024-12-01T12:00:00.000Z',
                endTime: '2024-12-01T14:00:00.000Z',
              }],
            },
          })
        )
      })
    })

    it('should call onCreated after successful creation', async () => {
      render(<CreateSessionModal {...defaultProps} />)

      await userEvent.type(screen.getByPlaceholderText('VD: Buổi sáng - Khai mạc'), 'Test Session')

      const startInput = screen.getByTestId('input-start')
      await userEvent.type(startInput, '2024-12-01T12:00')

      const endInput = screen.getByTestId('input-end')
      await userEvent.type(endInput, '2024-12-01T14:00')

      const submitButton = screen.getByText('Tạo ngay')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(defaultProps.onCreated).toHaveBeenCalled()
      })
    })

    it('should close modal after successful creation', async () => {
      render(<CreateSessionModal {...defaultProps} />)

      await userEvent.type(screen.getByPlaceholderText('VD: Buổi sáng - Khai mạc'), 'Test Session')

      const startInput = screen.getByTestId('input-start')
      await userEvent.type(startInput, '2024-12-01T12:00')

      const endInput = screen.getByTestId('input-end')
      await userEvent.type(endInput, '2024-12-01T14:00')

      const submitButton = screen.getByText('Tạo ngay')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })

    it('should show success notification', async () => {
      const { notify } = require('../../../../../utils/notify')
      render(<CreateSessionModal {...defaultProps} />)

      await userEvent.type(screen.getByPlaceholderText('VD: Buổi sáng - Khai mạc'), 'Test Session')

      const startInput = screen.getByTestId('input-start')
      await userEvent.type(startInput, '2024-12-01T12:00')

      const endInput = screen.getByTestId('input-end')
      await userEvent.type(endInput, '2024-12-01T14:00')

      const submitButton = screen.getByText('Tạo ngay')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(notify.success).toHaveBeenCalledWith('Đã tạo suất diễn')
      })
    })

    it('should show error notification on failure', async () => {
      mockDispatch.mockRejectedValue(new Error('Failed'))
      const { notify } = require('../../../../../utils/notify')
      render(<CreateSessionModal {...defaultProps} />)

      await userEvent.type(screen.getByPlaceholderText('VD: Buổi sáng - Khai mạc'), 'Test Session')

      const startInput = screen.getByTestId('input-start')
      await userEvent.type(startInput, '2024-12-01T12:00')

      const endInput = screen.getByTestId('input-end')
      await userEvent.type(endInput, '2024-12-01T14:00')

      const submitButton = screen.getByText('Tạo ngay')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(notify.error).toHaveBeenCalledWith('Không thể tạo suất diễn')
      })
    })
  })

  describe('User Interactions', () => {
    it('should close modal when clicking cancel button', async () => {
      render(<CreateSessionModal {...defaultProps} />)
      await userEvent.click(screen.getByText('Hủy'))
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should update title when typing', async () => {
      render(<CreateSessionModal {...defaultProps} />)
      const titleInput = screen.getByPlaceholderText('VD: Buổi sáng - Khai mạc')
      await userEvent.type(titleInput, 'Morning Show')
      expect(titleInput).toHaveValue('Morning Show')
    })

    it('should update description when typing', async () => {
      render(<CreateSessionModal {...defaultProps} />)
      const descInput = screen.getByPlaceholderText('Nhập nội dung tóm tắt...')
      await userEvent.type(descInput, 'Test description')
      expect(descInput).toHaveValue('Test description')
    })

    it('should update start time', async () => {
      render(<CreateSessionModal {...defaultProps} />)
      const startInput = screen.getByTestId('input-start')
      await userEvent.type(startInput, '2024-12-01T12:00')
      expect(startInput).toHaveValue('2024-12-01T12:00')
    })

    it('should update end time', async () => {
      render(<CreateSessionModal {...defaultProps} />)
      const endInput = screen.getByTestId('input-end')
      await userEvent.type(endInput, '2024-12-01T14:00')
      expect(endInput).toHaveValue('2024-12-01T14:00')
    })
  })

  describe('Loading State', () => {
    it('should disable submit button when saving', async () => {
      mockDispatch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({}), 100))
      )
      render(<CreateSessionModal {...defaultProps} />)

      await userEvent.type(screen.getByPlaceholderText('VD: Buổi sáng - Khai mạc'), 'Test Session')

      const startInput = screen.getByTestId('input-start')
      await userEvent.type(startInput, '2024-12-01T12:00')

      const endInput = screen.getByTestId('input-end')
      await userEvent.type(endInput, '2024-12-01T14:00')

      const submitButton = screen.getByText('Tạo ngay')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Đang tạo...')).toBeInTheDocument()
        expect(screen.getByText('Đang tạo...')).toBeDisabled()
      })
    })
  })

  describe('Disabled State', () => {
    it('should disable all inputs when isAllowUpdate is false', () => {
      render(<CreateSessionModal {...defaultProps} isAllowUpdate={false} />)

      const titleInput = screen.getByPlaceholderText('VD: Buổi sáng - Khai mạc')
      expect(titleInput).toBeDisabled()

      const startInput = screen.getByTestId('input-start')
      expect(startInput).toBeDisabled()

      const endInput = screen.getByTestId('input-end')
      expect(endInput).toBeDisabled()
    })

    it('should disable submit button when isAllowUpdate is false', () => {
      render(<CreateSessionModal {...defaultProps} isAllowUpdate={false} />)
      const submitButton = screen.getByText('Tạo ngay')
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty event times', () => {
      render(<CreateSessionModal {...defaultProps} eventStartAt={undefined} eventEndAt={undefined} />)
      expect(screen.queryByText('Khung giờ cho phép')).not.toBeInTheDocument()
    })

    it('should handle only event start time', () => {
      render(<CreateSessionModal {...defaultProps} eventEndAt={undefined} />)
      expect(screen.getByText('Từ')).toBeInTheDocument()
      expect(screen.queryByText('Đến')).not.toBeInTheDocument()
    })

    it('should handle only event end time', () => {
      render(<CreateSessionModal {...defaultProps} eventStartAt={undefined} />)
      expect(screen.queryByText('Từ')).not.toBeInTheDocument()
      expect(screen.getByText('Đến')).toBeInTheDocument()
    })

    it('should trim whitespace from title', async () => {
      const { fetchCreateEventSessions } = require('../../../../../store/eventSlice')
      render(<CreateSessionModal {...defaultProps} />)

      await userEvent.type(screen.getByPlaceholderText('VD: Buổi sáng - Khai mạc'), '  Test Session  ')

      const startInput = screen.getByTestId('input-start')
      await userEvent.type(startInput, '2024-12-01T12:00')

      const endInput = screen.getByTestId('input-end')
      await userEvent.type(endInput, '2024-12-01T14:00')

      const submitButton = screen.getByText('Tạo ngay')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchCreateEventSessions({
            eventId: 'event-123',
            data: {
              sessions: [{
                title: 'Test Session',
                description: '',
                startTime: '2024-12-01T12:00:00.000Z',
                endTime: '2024-12-01T14:00:00.000Z',
              }],
            },
          })
        )
      })
    })

    it('should handle undefined onCreated', () => {
      render(<CreateSessionModal {...defaultProps} onCreated={undefined} />)
      expect(screen.getByText('Tạo suất diễn')).toBeInTheDocument()
    })

    it('should handle special characters in title', async () => {
      render(<CreateSessionModal {...defaultProps} />)
      const titleInput = screen.getByPlaceholderText('VD: Buổi sáng - Khai mạc')
      await userEvent.type(titleInput, 'Test <Special> & "Chars"')
      expect(titleInput).toHaveValue('Test <Special> & "Chars"')
    })
  })
})
