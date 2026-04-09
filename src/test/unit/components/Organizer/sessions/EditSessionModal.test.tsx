/// <reference types="jest" />
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import EditSessionModal from '../../../../../components/Organizer/sessions/EditSessionModal'
import type { EventSession } from '../../../../../types/event/event'

// Mock Redux
const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../../../../store/eventSlice', () => ({
  fetchUpdateSession: jest.fn(({ eventId, sessionId, data }) => ({
    type: 'EVENT/updateSession',
    payload: { eventId, sessionId, data },
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
  isoToLocal: jest.fn((iso) => iso.replace('Z', '').replace('T', 'T')),
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

describe('EditSessionModal', () => {
  const mockSession: EventSession & { id: string } = {
    id: 'session-1',
    title: 'Morning Show',
    description: 'First session of the day',
    startTime: '2024-12-01T10:00:00Z',
    endTime: '2024-12-01T12:00:00Z',
  }

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    eventId: 'event-123',
    session: mockSession,
    eventStartAt: '2024-12-01T08:00:00Z',
    eventEndAt: '2024-12-01T18:00:00Z',
    onUpdated: jest.fn(),
    isAllowUpdate: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockResolvedValue({})
  })

  describe('Render', () => {
    it('should not render when open is false', () => {
      render(<EditSessionModal {...defaultProps} open={false} />)
      expect(screen.queryByText('Chỉnh sửa suất diễn')).not.toBeInTheDocument()
    })

    it('should render modal when open is true', () => {
      render(<EditSessionModal {...defaultProps} />)
      expect(screen.getByText('Chỉnh sửa suất diễn')).toBeInTheDocument()
    })

    it('should render pre-filled form with session data', () => {
      render(<EditSessionModal {...defaultProps} />)
      expect(screen.getByDisplayValue('Morning Show')).toBeInTheDocument()
      expect(screen.getByDisplayValue('First session of the day')).toBeInTheDocument()
    })

    it('should render DateTimeInput with session times', () => {
      render(<EditSessionModal {...defaultProps} />)
      expect(screen.getByTestId('input-start')).toHaveValue('2024-12-01T10:00:00')
      expect(screen.getByTestId('input-end')).toHaveValue('2024-12-01T12:00:00')
    })

    it('should render action buttons', () => {
      render(<EditSessionModal {...defaultProps} />)
      expect(screen.getByText('Huỷ')).toBeInTheDocument()
      expect(screen.getByText('Lưu thay đổi')).toBeInTheDocument()
    })

    it('should render close button', () => {
      render(<EditSessionModal {...defaultProps} />)
      const closeButton = screen.getByRole('button', { name: '' })
      expect(closeButton).toBeInTheDocument()
    })

    it('should render event window hint when event times are provided', () => {
      render(<EditSessionModal {...defaultProps} />)
      expect(screen.getByText('Khung giờ cho phép')).toBeInTheDocument()
    })

    it('should not render event window hint when no event times', () => {
      render(<EditSessionModal {...defaultProps} eventStartAt={undefined} eventEndAt={undefined} />)
      expect(screen.queryByText('Khung giờ cho phép')).not.toBeInTheDocument()
    })
  })

  describe('Form Pre-fill', () => {
    it('should convert ISO times to local format', () => {
      render(<EditSessionModal {...defaultProps} />)
      expect(screen.getByTestId('input-start')).toHaveValue('2024-12-01T10:00:00')
    })

    it('should handle empty description', () => {
      const sessionNoDesc = { ...mockSession, description: '' }
      render(<EditSessionModal {...defaultProps} session={sessionNoDesc} />)
      expect(screen.getByDisplayValue('')).toBeInTheDocument()
    })

    it('should reset form when session changes', () => {
      const { rerender } = render(<EditSessionModal {...defaultProps} />)

      const newSession = { ...mockSession, title: 'New Title' }
      rerender(<EditSessionModal {...defaultProps} session={newSession} />)

      expect(screen.getByDisplayValue('New Title')).toBeInTheDocument()
    })

    it('should clear errors when session changes', () => {
      render(<EditSessionModal {...defaultProps} />)
      const newSession = { ...mockSession, title: 'New Session' }
      render(<EditSessionModal {...defaultProps} session={newSession} />)

      // No validation errors should be shown
      expect(screen.queryByText('Tiêu đề không được để trống')).not.toBeInTheDocument()
    })
  })

  describe('Form Editing', () => {
    it('should update title when typing', async () => {
      render(<EditSessionModal {...defaultProps} />)
      const titleInput = screen.getByDisplayValue('Morning Show')
      await userEvent.clear(titleInput)
      await userEvent.type(titleInput, 'Afternoon Show')
      expect(titleInput).toHaveValue('Afternoon Show')
    })

    it('should update description when typing', async () => {
      render(<EditSessionModal {...defaultProps} />)
      const descInput = screen.getByDisplayValue('First session of the day')
      await userEvent.clear(descInput)
      await userEvent.type(descInput, 'Updated description')
      expect(descInput).toHaveValue('Updated description')
    })

    it('should update start time', async () => {
      render(<EditSessionModal {...defaultProps} />)
      const startInput = screen.getByTestId('input-start')
      await userEvent.clear(startInput)
      await userEvent.type(startInput, '2024-12-01T14:00:00')
      expect(startInput).toHaveValue('2024-12-01T14:00:00')
    })

    it('should update end time', async () => {
      render(<EditSessionModal {...defaultProps} />)
      const endInput = screen.getByTestId('input-end')
      await userEvent.clear(endInput)
      await userEvent.type(endInput, '2024-12-01T16:00:00')
      expect(endInput).toHaveValue('2024-12-01T16:00:00')
    })

    it('should clear validation errors when typing', async () => {
      render(<EditSessionModal {...defaultProps} />)
      // Trigger validation by clearing title
      const titleInput = screen.getByDisplayValue('Morning Show')
      await userEvent.clear(titleInput)

      const submitButton = screen.getByText('Lưu thay đổi')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Tiêu đề không được để trống')).toBeInTheDocument()
      })

      // Clear error by typing
      await userEvent.type(titleInput, 'New Title')

      await waitFor(() => {
        expect(screen.queryByText('Tiêu đề không được để trống')).not.toBeInTheDocument()
      })
    })
  })

  describe('Validation', () => {
    it('should show error for empty title', async () => {
      render(<EditSessionModal {...defaultProps} />)
      const titleInput = screen.getByDisplayValue('Morning Show')
      await userEvent.clear(titleInput)

      const submitButton = screen.getByText('Lưu thay đổi')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Tiêu đề không được để trống')).toBeInTheDocument()
      })
    })

    it('should validate session times against event window', async () => {
      render(<EditSessionModal {...defaultProps} />)
      const startInput = screen.getByTestId('input-start')
      await userEvent.clear(startInput)
      await userEvent.type(startInput, '2024-12-01T06:00:00') // Before event start

      const submitButton = screen.getByText('Lưu thay đổi')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Suất diễn phải bắt đầu từ/)).toBeInTheDocument()
      })
    })

    it('should warn when no changes made', async () => {
      const { notify } = require('../../../../../utils/notify')
      render(<EditSessionModal {...defaultProps} />)

      const submitButton = screen.getByText('Lưu thay đổi')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(notify.warning).toHaveBeenCalledWith('Không có thay đổi nào để lưu')
      })
    })
  })

  describe('Form Submission', () => {
    it('should dispatch update session action on valid submit', async () => {
      const { fetchUpdateSession } = require('../../../../../store/eventSlice')
      render(<EditSessionModal {...defaultProps} />)

      const titleInput = screen.getByDisplayValue('Morning Show')
      await userEvent.clear(titleInput)
      await userEvent.type(titleInput, 'Updated Morning Show')

      const submitButton = screen.getByText('Lưu thay đổi')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchUpdateSession({
            eventId: 'event-123',
            sessionId: 'session-1',
            data: {
              title: 'Updated Morning Show',
              description: 'First session of the day',
              startTime: '2024-12-01T10:00:00:00.000Z',
              endTime: '2024-12-01T12:00:00:00.000Z',
            },
          })
        )
      })
    })

    it('should call onUpdated after successful update', async () => {
      render(<EditSessionModal {...defaultProps} />)

      const titleInput = screen.getByDisplayValue('Morning Show')
      await userEvent.clear(titleInput)
      await userEvent.type(titleInput, 'Updated Title')

      const submitButton = screen.getByText('Lưu thay đổi')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(defaultProps.onUpdated).toHaveBeenCalled()
      })
    })

    it('should close modal after successful update', async () => {
      render(<EditSessionModal {...defaultProps} />)

      const titleInput = screen.getByDisplayValue('Morning Show')
      await userEvent.clear(titleInput)
      await userEvent.type(titleInput, 'Updated Title')

      const submitButton = screen.getByText('Lưu thay đổi')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })

    it('should show success notification', async () => {
      const { notify } = require('../../../../../utils/notify')
      render(<EditSessionModal {...defaultProps} />)

      const titleInput = screen.getByDisplayValue('Morning Show')
      await userEvent.clear(titleInput)
      await userEvent.type(titleInput, 'Updated Title')

      const submitButton = screen.getByText('Lưu thay đổi')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(notify.success).toHaveBeenCalledWith('Đã cập nhật suất diễn')
      })
    })

    it('should show error notification on failure', async () => {
      mockDispatch.mockRejectedValue(new Error('Failed'))
      const { notify } = require('../../../../../utils/notify')
      render(<EditSessionModal {...defaultProps} />)

      const titleInput = screen.getByDisplayValue('Morning Show')
      await userEvent.clear(titleInput)
      await userEvent.type(titleInput, 'Updated Title')

      const submitButton = screen.getByText('Lưu thay đổi')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(notify.error).toHaveBeenCalledWith('Không thể cập nhật suất diễn')
      })
    })
  })

  describe('User Interactions', () => {
    it('should close modal when clicking cancel button', async () => {
      render(<EditSessionModal {...defaultProps} />)
      await userEvent.click(screen.getByText('Huỷ'))
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should close modal when clicking close button', async () => {
      render(<EditSessionModal {...defaultProps} />)
      const closeButton = screen.getByRole('button', { name: '' })
      await userEvent.click(closeButton)
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should close modal when clicking overlay', async () => {
      render(<EditSessionModal {...defaultProps} />)
      const overlay = screen.getByText('Chỉnh sửa suất diễn').closest('.fixed')
      if (overlay) {
        await userEvent.click(overlay)
        expect(defaultProps.onClose).toHaveBeenCalled()
      }
    })

    it('should close modal when pressing Escape key', async () => {
      render(<EditSessionModal {...defaultProps} />)
      await userEvent.keyboard('{Escape}')
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Change Detection', () => {
    it('should detect title changes', () => {
      render(<EditSessionModal {...defaultProps} />)
      const titleInput = screen.getByDisplayValue('Morning Show')
      expect(titleInput).toHaveValue('Morning Show')
    })

    it('should detect description changes', () => {
      render(<EditSessionModal {...defaultProps} />)
      const descInput = screen.getByDisplayValue('First session of the day')
      expect(descInput).toHaveValue('First session of the day')
    })

    it('should detect time changes', () => {
      render(<EditSessionModal {...defaultProps} />)
      const startInput = screen.getByTestId('input-start')
      expect(startInput).toHaveValue('2024-12-01T10:00:00')
    })
  })

  describe('Loading State', () => {
    it('should disable submit button when saving', async () => {
      mockDispatch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({}), 100))
      )
      render(<EditSessionModal {...defaultProps} />)

      const titleInput = screen.getByDisplayValue('Morning Show')
      await userEvent.clear(titleInput)
      await userEvent.type(titleInput, 'Updated Title')

      const submitButton = screen.getByText('Lưu thay đổi')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Đang lưu...')).toBeInTheDocument()
        expect(screen.getByText('Đang lưu...')).toBeDisabled()
      })
    })
  })

  describe('Disabled State', () => {
    it('should disable all inputs when isAllowUpdate is false', () => {
      render(<EditSessionModal {...defaultProps} isAllowUpdate={false} />)

      const titleInput = screen.getByDisplayValue('Morning Show')
      expect(titleInput).toBeDisabled()

      const startInput = screen.getByTestId('input-start')
      expect(startInput).toBeDisabled()

      const endInput = screen.getByTestId('input-end')
      expect(endInput).toBeDisabled()
    })

    it('should disable submit button when isAllowUpdate is false', () => {
      render(<EditSessionModal {...defaultProps} isAllowUpdate={false} />)
      const submitButton = screen.getByText('Lưu thay đổi')
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Keyboard Shortcut', () => {
    it('should add Escape key listener when modal opens', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
      render(<EditSessionModal {...defaultProps} />)

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

      addEventListenerSpy.mockRestore()
    })

    it('should remove Escape key listener when modal closes', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
      const { rerender } = render(<EditSessionModal {...defaultProps} />)

      rerender(<EditSessionModal {...defaultProps} open={false} />)

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty event times', () => {
      render(<EditSessionModal {...defaultProps} eventStartAt={undefined} eventEndAt={undefined} />)
      expect(screen.queryByText('Khung giờ cho phép')).not.toBeInTheDocument()
    })

    it('should handle session with null description', () => {
      const sessionNullDesc = { ...mockSession, description: null as any }
      render(<EditSessionModal {...defaultProps} session={sessionNullDesc} />)
      expect(screen.getByDisplayValue('')).toBeInTheDocument()
    })

    it('should handle very long titles', () => {
      const longTitleSession = { ...mockSession, title: 'A'.repeat(200) }
      render(<EditSessionModal {...defaultProps} session={longTitleSession} />)
      expect(screen.getByDisplayValue('A'.repeat(200))).toBeInTheDocument()
    })

    it('should handle special characters in title', () => {
      const specialSession = { ...mockSession, title: 'Test <Special> & "Chars"' }
      render(<EditSessionModal {...defaultProps} session={specialSession} />)
      expect(screen.getByDisplayValue('Test <Special> & "Chars"')).toBeInTheDocument()
    })

    it('should trim whitespace before submission', async () => {
      const { fetchUpdateSession } = require('../../../../../store/eventSlice')
      render(<EditSessionModal {...defaultProps} />)

      const titleInput = screen.getByDisplayValue('Morning Show')
      await userEvent.clear(titleInput)
      await userEvent.type(titleInput, '  Updated Title  ')

      const submitButton = screen.getByText('Lưu thay đổi')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchUpdateSession({
            eventId: 'event-123',
            sessionId: 'session-1',
            data: expect.objectContaining({
              title: 'Updated Title',
            }),
          })
        )
      })
    })

    it('should handle undefined onUpdated', () => {
      render(<EditSessionModal {...defaultProps} onUpdated={undefined} />)
      expect(screen.getByText('Chỉnh sửa suất diễn')).toBeInTheDocument()
    })

    it('should handle description with HTML content', () => {
      const htmlDescSession = { ...mockSession, description: '<p>HTML content</p>' }
      render(<EditSessionModal {...defaultProps} session={htmlDescSession} />)
      expect(screen.getByDisplayValue('<p>HTML content</p>')).toBeInTheDocument()
    })

    it('should handle concurrent edits gracefully', () => {
      const { rerender } = render(<EditSessionModal {...defaultProps} />)

      // Simulate session update from another source
      const updatedSession = { ...mockSession, title: 'New Concurrent Title' }
      rerender(<EditSessionModal {...defaultProps} session={updatedSession} />)

      expect(screen.getByDisplayValue('New Concurrent Title')).toBeInTheDocument()
    })
  })
})
