/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Step3Settings from '../../../../../components/Organizer/steps/Step3Settings'

// Mock Redux
const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('../../../../../store/eventSlice', () => ({
  fetchEventById: jest.fn(() => ({ type: 'EVENT/fetchById', payload: { data: { sessions: [] } } })),
  fetchUpdateEventSettings: jest.fn(() => ({ type: 'EVENT/updateSettings', payload: {} })),
  fetchUpload: jest.fn(() => ({ type: 'EVENT/upload', payload: 'https://example.com/image.jpg' })),
}))

jest.mock('../../../../../store/seatMapSlice', () => ({
  fetchGetSeatMap: jest.fn(() => ({ type: 'SEATMAP/fetch', payload: null })),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ eventId: 'event-123' }),
  useNavigate: () => jest.fn(),
}))

jest.mock('../../../../../utils/notify', () => ({
  notify: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
}))

jest.mock('../../../../../components/Organizer/shared/ImagePreview', () => ({
  __esModule: true,
  default: ({ url, onClose }: any) => (
    <div data-testid="image-viewer">
      <span>{url}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
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

describe('Step3Settings', () => {
  const mockOnNext = jest.fn()
  const mockOnBack = jest.fn()
  const mockReloadEvent = jest.fn()

  const mockEventData = {
    id: 'event-123',
    urlPath: 'test-event',
    isEmailReminderEnabled: false,
    specImage: 'https://example.com/spec.jpg',
    title: 'Test Event',
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
    it('should render seatmap section', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      expect(screen.getByText(/Sơ đồ chỗ ngồi/)).toBeInTheDocument()
    })

    it('should render spec image section', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      expect(screen.getByText(/Ảnh sơ đồ/)).toBeInTheDocument()
    })

    it('should render email reminder toggle', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      expect(screen.getByText(/email nhắc nhở/)).toBeInTheDocument()
    })

    it('should render custom URL section', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      expect(screen.getByText(/Đường dẫn tuỳ chỉnh/)).toBeInTheDocument()
    })

    it('should render action buttons', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      expect(screen.getByText('Quay lại')).toBeInTheDocument()
      expect(screen.getByText(/Tiếp theo/)).toBeInTheDocument()
    })
  })

  describe('Seatmap Section', () => {
    it('should show loading state when checking seatmap', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      // Should show loading initially
      expect(screen.getByText(/Đang tải/)).toBeInTheDocument()
    })

    it('should show "no seatmap" state when no seatmap exists', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      await waitFor(() => {
        expect(screen.getByText(/Chưa có sơ đồ/)).toBeInTheDocument()
      })
    })

    it('should navigate to seatmap editor when clicking add button', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      await waitFor(() => {
        const addButton = screen.getByText(/Thêm sơ đồ/)
        expect(addButton).toBeInTheDocument()
      })
    })

    it('should show seatmap exists state when seatmap is available', async () => {
      mockDispatch.mockResolvedValue({ data: { sessions: [{ id: 'session-1' }] } })
      jest.mock('../../../../../store/seatMapSlice', () => ({
        fetchGetSeatMap: jest.fn(() => ({ type: 'SEATMAP/fetch', payload: '{"areas":[]}' })),
      }))
      await act(async () => render(<Step3Settings {...defaultProps} />))
      await waitFor(() => {
        expect(screen.getByText(/Sơ đồ trực quan đã được thiết lập/)).toBeInTheDocument()
      })
    })
  })

  describe('Spec Image Upload', () => {
    it('should show upload area when no image exists', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} eventData={{ ...mockEventData, specImage: '' }} />))
      expect(screen.getByText(/Chưa có ảnh/)).toBeInTheDocument()
    })

    it('should show current image when image exists', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      expect(screen.getByText(/Ảnh sơ đồ hiện tại/)).toBeInTheDocument()
    })

    it('should open image viewer when clicking thumbnail', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      const thumbnail = screen.getByAltText('Spec')
      await userEvent.click(thumbnail)
      await waitFor(() => {
        expect(screen.getByTestId('image-viewer')).toBeInTheDocument()
      })
    })

    it('should allow removing image', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      const removeButton = screen.getByRole('button', { name: /×/ })
      await userEvent.click(removeButton)
    })
  })

  describe('Email Reminder Toggle', () => {
    it('should show toggle for email reminder', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      const toggle = screen.getByRole('checkbox')
      expect(toggle).toBeInTheDocument()
    })

    it('should toggle email reminder setting', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      const toggle = screen.getByRole('checkbox')
      await userEvent.click(toggle)
      expect(toggle).toBeChecked()
    })
  })

  describe('Custom URL Path', () => {
    it('should show current URL path', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      const urlInput = screen.getByDisplayValue('test-event')
      expect(urlInput).toBeInTheDocument()
    })

    it('should allow editing URL path', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      const urlInput = screen.getByDisplayValue('test-event')
      await userEvent.clear(urlInput)
      await userEvent.type(urlInput, 'new-event-path')
      expect(urlInput).toHaveValue('new-event-path')
    })

    it('should generate URL from event title', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      const generateButton = screen.getByText('Tạo')
      await userEvent.click(generateButton)
      // Should generate slug from title
      expect(screen.getByDisplayValue('test-event')).toBeInTheDocument()
    })

    it('should validate URL format', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      const urlInput = screen.getByDisplayValue('test-event')
      await userEvent.clear(urlInput)
      await userEvent.type(urlInput, 'INVALID_URL')
      // Validation error should appear
    })

    it('should show error for empty URL', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      const nextButton = screen.getByText(/Tiếp theo/)
      await userEvent.click(nextButton)
      // Should show validation error
    })
  })

  describe('Form Submission', () => {
    it('should call onNext when clicking continue', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      const nextButton = screen.getByText(/Tiếp theo/)
      await userEvent.click(nextButton)
      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalled()
      })
    })

    it('should call onBack when clicking back', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} />))
      const backButton = screen.getByText('Quay lại')
      await userEvent.click(backButton)
      expect(mockOnBack).toHaveBeenCalled()
    })

    it('should dispatch update settings when form changed', async () => {
      const { fetchUpdateEventSettings } = require('../../../../../store/eventSlice')
      await act(async () => render(<Step3Settings {...defaultProps} />))
      const nextButton = screen.getByText(/Tiếp theo/)
      await userEvent.click(nextButton)
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchUpdateEventSettings(expect.any(Object)))
      })
    })
  })

  describe('Disabled State', () => {
    it('should disable inputs when isAllowUpdate is false', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} isAllowUpdate={false} />))
      const urlInput = screen.getByDisplayValue('test-event')
      expect(urlInput).toBeDisabled()
    })

    it('should disable buttons when isAllowUpdate is false', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} isAllowUpdate={false} />))
      const nextButton = screen.getByText(/Tiếp theo/)
      expect(nextButton).toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle null eventData', async () => {
      await act(async () => render(<Step3Settings {...defaultProps} eventData={null} />))
      expect(screen.getByText('Quay lại')).toBeInTheDocument()
    })

    it('should handle empty URL path', async () => {
      const emptyUrlData = { ...mockEventData, urlPath: '' }
      await act(async () => render(<Step3Settings {...defaultProps} eventData={emptyUrlData} />))
      const urlInput = screen.getByDisplayValue('')
      expect(urlInput).toBeInTheDocument()
    })

    it('should handle missing specImage', async () => {
      const noImageData = { ...mockEventData, specImage: '' }
      await act(async () => render(<Step3Settings {...defaultProps} eventData={noImageData} />))
      expect(screen.getByText(/Chưa có ảnh/)).toBeInTheDocument()
    })
  })
})
