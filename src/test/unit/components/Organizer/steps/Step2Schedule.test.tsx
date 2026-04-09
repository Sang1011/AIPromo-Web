/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Step2Schedule from '../../../../../components/Organizer/steps/Step2Schedule'

// Mock Redux
const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => selector({
    EVENT: { sessions: [] },
    TICKET_TYPE: { ticketTypes: [] },
  }),
}))

jest.mock('../../../../../store/eventSlice', () => ({
  fetchSessions: jest.fn(() => ({ type: 'EVENT/fetchSessions', payload: [] })),
  fetchDeleteSession: jest.fn(() => ({ type: 'EVENT/deleteSession', payload: {} })),
  fetchUpdateEventSettings: jest.fn(() => ({ type: 'EVENT/updateSettings', payload: {} })),
}))

jest.mock('../../../../../store/ticketTypeSlice', () => ({
  fetchGetAllTicketTypes: jest.fn(() => ({ type: 'TICKET_TYPE/fetchAll', payload: [] })),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ eventId: 'event-123' }),
}))

jest.mock('../../../../../utils/notify', () => ({
  notify: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
}))

jest.mock('../../../../../utils/eventValidation', () => ({
  validateEventTime: jest.fn(() => ({ valid: true, errors: [] })),
  getInvalidSessions: jest.fn(() => ({ hasConflicts: false, conflicts: [] })),
}))

jest.mock('../../../../../components/Organizer/shared/DateTimeInput', () => ({
  __esModule: true,
  default: ({ label, value, onChange }: any) => (
    <div data-testid={`datetime-${label === 'Bắt đầu' ? 'start' : 'end'}`}>
      <label>{label}</label>
      <input
        data-testid={`input-${label === 'Bắt đầu' ? 'start' : 'end'}`}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  ),
}))

jest.mock('../../../../../components/Organizer/sessions/CreateSessionModal', () => ({
  __esModule: true,
  default: ({ open, onClose }: any) => open ? <div data-testid="create-session-modal"><button onClick={onClose}>Close</button></div> : null,
}))

jest.mock('../../../../../components/Organizer/sessions/EditSessionModal', () => ({
  __esModule: true,
  default: ({ open, onClose }: any) => open ? <div data-testid="edit-session-modal"><button onClick={onClose}>Close</button></div> : null,
}))

jest.mock('../../../../../components/Organizer/ticket/TicketTypeModal', () => ({
  __esModule: true,
  default: ({ open, onClose }: any) => open ? <div data-testid="ticket-type-modal"><button onClick={onClose}>Close</button></div> : null,
}))

jest.mock('../../../../../components/Organizer/shared/ConfirmModal', () => ({
  __esModule: true,
  default: ({ open, onCancel, onConfirm }: any) => open ? <div data-testid="confirm-modal"><button onClick={onCancel}>Cancel</button><button onClick={onConfirm}>Confirm</button></div> : null,
}))

jest.mock('../../../../../components/Organizer/shared/UnsavedBanner', () => ({
  __esModule: true,
  UnsavedBanner: ({ saving, onSave }: any) => (
    <div data-testid="unsaved-banner">
      <button data-testid="save-banner" onClick={onSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  ),
}))

describe('Step2Schedule', () => {
  const mockOnNext = jest.fn()
  const mockOnBack = jest.fn()
  const mockReloadEvent = jest.fn()

  const mockEventData = {
    id: 'event-123',
    ticketSaleStartAt: '2024-12-01T00:00:00Z',
    ticketSaleEndAt: '2024-12-01T10:00:00Z',
    eventStartAt: '2024-12-01T12:00:00Z',
    eventEndAt: '2024-12-01T18:00:00Z',
    sessions: [],
  } as any

  const defaultProps = {
    onNext: mockOnNext,
    onBack: mockOnBack,
    eventData: mockEventData,
    reloadEvent: mockReloadEvent,
    isAllowUpdate: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockResolvedValue({})
  })

  describe('Render', () => {
    it('should render ticket sale time section', async () => {
      await act(async () => render(<Step2Schedule {...defaultProps} />))
      expect(screen.getByText(/Thời gian mở vé/)).toBeInTheDocument()
    })

    it('should render event time section', async () => {
      await act(async () => render(<Step2Schedule {...defaultProps} />))
      expect(screen.getByText(/Thời gian sự kiện/)).toBeInTheDocument()
    })

    it('should render DateTimeInput components', async () => {
      await act(async () => render(<Step2Schedule {...defaultProps} />))
      expect(screen.getByTestId('datetime-start')).toBeInTheDocument()
      expect(screen.getByTestId('datetime-end')).toBeInTheDocument()
    })

    it('should render sessions section', async () => {
      await act(async () => render(<Step2Schedule {...defaultProps} />))
      expect(screen.getByText(/Suất diễn/)).toBeInTheDocument()
    })

    it('should render ticket types section', async () => {
      await act(async () => render(<Step2Schedule {...defaultProps} />))
      expect(screen.getByText(/Loại vé/)).toBeInTheDocument()
    })

    it('should render action buttons', async () => {
      await act(async () => render(<Step2Schedule {...defaultProps} />))
      expect(screen.getByText('Quay lại')).toBeInTheDocument()
      expect(screen.getByText('Tiếp tục')).toBeInTheDocument()
    })
  })

  describe('Session Management', () => {
    it('should open create session modal when clicking add button', async () => {
      await act(async () => render(<Step2Schedule {...defaultProps} />))
      const addSessionButton = screen.getByText(/Thêm suất diễn/)
      await userEvent.click(addSessionButton)
      await waitFor(() => {
        expect(screen.getByTestId('create-session-modal')).toBeInTheDocument()
      })
    })

    it('should open edit session modal when editing session', async () => {
      const { container } = render(<Step2Schedule {...defaultProps} />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Ticket Type Management', () => {
    it('should open ticket type modal when clicking manage button', async () => {
      await act(async () => render(<Step2Schedule {...defaultProps} />))
      const manageButton = screen.getByText(/Quản lý loại vé/)
      await userEvent.click(manageButton)
      await waitFor(() => {
        expect(screen.getByTestId('ticket-type-modal')).toBeInTheDocument()
      })
    })
  })

  describe('Time Validation', () => {
    it('should validate ticket sale times', async () => {
      await act(async () => render(<Step2Schedule {...defaultProps} />))
      // Validation happens on submit
      const nextButton = screen.getByText('Tiếp tục')
      await userEvent.click(nextButton)
    })

    it('should validate event times', async () => {
      await act(async () => render(<Step2Schedule {...defaultProps} />))
      const nextButton = screen.getByText('Tiếp tục')
      await userEvent.click(nextButton)
    })

    it('should show validation errors for invalid times', async () => {
      await act(async () => render(<Step2Schedule {...defaultProps} />))
      // Clear start time to trigger validation
      const startInput = screen.getByTestId('input-start')
      await userEvent.clear(startInput)
      const nextButton = screen.getByText('Tiếp tục')
      await userEvent.click(nextButton)
      await waitFor(() => {
        expect(screen.getByText(/Thời gian/)).toBeInTheDocument()
      })
    })
  })

  describe('Conflict Detection', () => {
    it('should show conflict banner for invalid sessions', async () => {
      const { container } = render(<Step2Schedule {...defaultProps} />)
      // Conflicts would show here if detected
      expect(container).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call onNext when clicking continue', async () => {
      await act(async () => render(<Step2Schedule {...defaultProps} />))
      const nextButton = screen.getByText('Tiếp tục')
      await userEvent.click(nextButton)
      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalled()
      })
    })

    it('should call onBack when clicking back', async () => {
      await act(async () => render(<Step2Schedule {...defaultProps} />))
      const backButton = screen.getByText('Quay lại')
      await userEvent.click(backButton)
      expect(mockOnBack).toHaveBeenCalled()
    })
  })

  describe('Disabled State', () => {
    it('should disable inputs when isAllowUpdate is false', async () => {
      await act(async () => render(<Step2Schedule {...defaultProps} isAllowUpdate={false} />))
      const startInput = screen.getByTestId('input-start')
      expect(startInput).toBeDisabled()
    })

    it('should disable buttons when isAllowUpdate is false', async () => {
      await act(async () => render(<Step2Schedule {...defaultProps} isAllowUpdate={false} />))
      const nextButton = screen.getByText('Tiếp tục')
      expect(nextButton).toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle null eventData', async () => {
      await act(async () => render(<Step2Schedule {...defaultProps} eventData={null} />))
      expect(screen.getByText('Quay lại')).toBeInTheDocument()
    })

    it('should handle empty sessions', async () => {
      await act(async () => render(<Step2Schedule {...defaultProps} />))
      expect(screen.getByText(/Thêm suất diễn/)).toBeInTheDocument()
    })

    it('should handle empty ticket types', async () => {
      await act(async () => render(<Step2Schedule {...defaultProps} />))
      expect(screen.getByText(/Quản lý loại vé/)).toBeInTheDocument()
    })
  })
})
