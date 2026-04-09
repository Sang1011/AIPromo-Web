/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Header from '../../../../../components/Organizer/navigations/Header'

// Mock Redux
const mockDispatch = jest.fn()
let mockEventState: any = {}
let mockAuthState: any = {}
let mockOrganizerState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    EVENT: mockEventState,
    AUTH: mockAuthState,
    ORGANIZER_PROFILE: mockOrganizerState,
  }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../../../../store/eventSlice', () => ({
  fetchEventById: jest.fn((eventId) => ({ type: 'EVENT/fetchById', payload: eventId })),
  fetchRequestCancelEvent: jest.fn(({ eventId, reason }) => ({
    type: 'EVENT/cancel',
    payload: { eventId, reason },
  })),
}))

jest.mock('../../../../../store/authSlice', () => ({
  fetchMe: jest.fn(() => ({ type: 'AUTH/fetchMe' })),
}))

jest.mock('../../../../../store/organizerProfileSlice', () => ({
  fetchGetOrganizerProfileDetailById: jest.fn((userId) => ({
    type: 'ORGANIZER/fetchProfile',
    payload: userId,
  })),
}))

// Mock React Router
const mockUseParams = jest.fn()
const mockUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
  useNavigate: () => mockUseNavigate(),
}))

// Mock notify
jest.mock('../../../../../utils/notify', () => ({
  notify: { success: jest.fn(), error: jest.fn() },
}))

describe('Header', () => {
  const mockNavigate = jest.fn()

  const defaultProps = {
    title: 'Test Page',
    canGoBack: false,
    haveTitle: false,
    urlBack: undefined,
    onBack: undefined,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ eventId: undefined })
    mockUseNavigate.mockReturnValue(mockNavigate)

    mockEventState = { currentEvent: null }
    mockAuthState = { currentInfor: { roles: ['Organizer'] } }
    mockOrganizerState = { profileDetail: null }

    mockDispatch.mockResolvedValue({})

    // Mock localStorage
    Storage.prototype.removeItem = jest.fn()
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => render(<Header {...defaultProps} />))
      expect(screen.getByText('Test Page')).toBeInTheDocument()
    })

    it('should render header element', async () => {
      await act(async () => render(<Header {...defaultProps} />))
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should render action buttons for Organizer role', async () => {
      await act(async () => render(<Header {...defaultProps} />))
      expect(screen.getByText('Tạo sự kiện mới')).toBeInTheDocument()
      expect(screen.getByText('Subscription')).toBeInTheDocument()
      expect(screen.getByText('Đăng xuất')).toBeInTheDocument()
    })

    it('should not show Organizer buttons for non-Organizer role', async () => {
      mockAuthState = { currentInfor: { roles: ['Member'] } }

      await act(async () => render(<Header {...defaultProps} />))

      expect(screen.queryByText('Tạo sự kiện mới')).not.toBeInTheDocument()
      expect(screen.queryByText('Subscription')).not.toBeInTheDocument()
      expect(screen.getByText('Đăng xuất')).toBeInTheDocument()
    })
  })

  describe('Back Navigation', () => {
    it('should show back button when canGoBack is true', async () => {
      await act(async () => render(<Header {...defaultProps} canGoBack />))
      expect(screen.getByText('Trở về')).toBeInTheDocument()
    })

    it('should not show back button when canGoBack is false', async () => {
      await act(async () => render(<Header {...defaultProps} canGoBack={false} />))
      expect(screen.queryByText('Trở về')).not.toBeInTheDocument()
    })

    it('should call custom onBack when provided', async () => {
      const mockOnBack = jest.fn()
      await act(async () => render(<Header {...defaultProps} canGoBack onBack={mockOnBack} />))
      await userEvent.click(screen.getByText('Trở về'))
      expect(mockOnBack).toHaveBeenCalled()
    })

    it('should navigate to urlBack when provided', async () => {
      await act(async () => render(<Header {...defaultProps} canGoBack urlBack="/custom-back" />))
      await userEvent.click(screen.getByText('Trở về'))
      expect(mockNavigate).toHaveBeenCalledWith('/custom-back')
    })

    it('should navigate(-1) when no custom handler', async () => {
      await act(async () => render(<Header {...defaultProps} canGoBack />))
      await userEvent.click(screen.getByText('Trở về'))
      expect(mockNavigate).toHaveBeenCalledWith(-1)
    })
  })

  describe('Event Title', () => {
    it('should show custom title when not event header', async () => {
      await act(async () => render(<Header {...defaultProps} title="Custom Title" />))
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('should show event title when haveTitle and eventId present', async () => {
      mockUseParams.mockReturnValue({ eventId: 'event-123' })
      mockEventState = { currentEvent: { title: 'My Event' } }

      await act(async () => render(<Header {...defaultProps} haveTitle />))

      expect(screen.getByText('Sự kiện My Event')).toBeInTheDocument()
    })

    it('should show loading text when event not loaded', async () => {
      mockUseParams.mockReturnValue({ eventId: 'event-123' })
      mockEventState = { currentEvent: null }

      await act(async () => render(<Header {...defaultProps} haveTitle />))

      expect(screen.getByText('Sự kiện Đang tải...')).toBeInTheDocument()
    })

    it('should fetch event when eventId present', async () => {
      const { fetchEventById } = require('../../../../../store/eventSlice')
      mockUseParams.mockReturnValue({ eventId: 'event-123' })

      await act(async () => render(<Header {...defaultProps} />))

      expect(mockDispatch).toHaveBeenCalledWith(fetchEventById('event-123'))
    })

    it('should not fetch event when no eventId', async () => {
      mockUseParams.mockReturnValue({ eventId: undefined })

      await act(async () => render(<Header {...defaultProps} />))

      expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'EVENT/fetchById' }))
    })
  })

  describe('Cancel Event', () => {
    it('should show cancel button for Published events', async () => {
      mockUseParams.mockReturnValue({ eventId: 'event-123' })
      mockEventState = { currentEvent: { title: 'My Event', status: 'Published' } }

      await act(async () => render(<Header {...defaultProps} haveTitle />))

      expect(screen.getByText('Huỷ sự kiện')).toBeInTheDocument()
    })

    it('should show cancel button for Suspended events', async () => {
      mockUseParams.mockReturnValue({ eventId: 'event-123' })
      mockEventState = { currentEvent: { title: 'My Event', status: 'Suspended' } }

      await act(async () => render(<Header {...defaultProps} haveTitle />))

      expect(screen.getByText('Huỷ sự kiện')).toBeInTheDocument()
    })

    it('should not show cancel button for Draft events', async () => {
      mockUseParams.mockReturnValue({ eventId: 'event-123' })
      mockEventState = { currentEvent: { title: 'My Event', status: 'Draft' } }

      await act(async () => render(<Header {...defaultProps} haveTitle />))

      expect(screen.queryByText('Huỷ sự kiện')).not.toBeInTheDocument()
    })

    it('should open cancel modal when clicking cancel button', async () => {
      mockUseParams.mockReturnValue({ eventId: 'event-123' })
      mockEventState = { currentEvent: { title: 'My Event', status: 'Published' } }

      await act(async () => render(<Header {...defaultProps} haveTitle />))
      await userEvent.click(screen.getByText('Huỷ sự kiện'))

      expect(screen.getByText('Huỷ sự kiện')).toBeInTheDocument()
      expect(screen.getByText('Lý do huỷ')).toBeInTheDocument()
    })

    it('should require reason before submitting', async () => {
      mockUseParams.mockReturnValue({ eventId: 'event-123' })
      mockEventState = { currentEvent: { title: 'My Event', status: 'Published' } }

      await act(async () => render(<Header {...defaultProps} haveTitle />))
      await userEvent.click(screen.getByText('Huỷ sự kiện'))

      const submitButton = screen.getByText('Gửi yêu cầu huỷ')
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit when reason is provided', async () => {
      mockUseParams.mockReturnValue({ eventId: 'event-123' })
      mockEventState = { currentEvent: { title: 'My Event', status: 'Published' } }

      await act(async () => render(<Header {...defaultProps} haveTitle />))
      await userEvent.click(screen.getByText('Huỷ sự kiện'))

      const textarea = screen.getByPlaceholderText(/Ví dụ:/)
      await userEvent.type(textarea, 'Cannot attend due to unforeseen circumstances')

      const submitButton = screen.getByText('Gửi yêu cầu huỷ')
      expect(submitButton).not.toBeDisabled()
    })

    it('should close modal when clicking close button', async () => {
      mockUseParams.mockReturnValue({ eventId: 'event-123' })
      mockEventState = { currentEvent: { title: 'My Event', status: 'Published' } }

      await act(async () => render(<Header {...defaultProps} haveTitle />))
      await userEvent.click(screen.getByText('Huỷ sự kiện'))
      await userEvent.click(screen.getByText('Đóng'))

      await waitFor(() => {
        expect(screen.queryByText('Lý do huỷ')).not.toBeInTheDocument()
      })
    })

    it('should close modal when clicking overlay', async () => {
      mockUseParams.mockReturnValue({ eventId: 'event-123' })
      mockEventState = { currentEvent: { title: 'My Event', status: 'Published' } }

      await act(async () => render(<Header {...defaultProps} haveTitle />))
      await userEvent.click(screen.getByText('Huỷ sự kiện'))

      const overlay = screen.getByText('Huỷ sự kiện').closest('.fixed')
      if (overlay) {
        await userEvent.click(overlay)
        await waitFor(() => {
          expect(screen.queryByText('Lý do huỷ')).not.toBeInTheDocument()
        })
      }
    })

    it('should submit cancel request with reason', async () => {
      const { fetchRequestCancelEvent } = require('../../../../../store/eventSlice')
      mockUseParams.mockReturnValue({ eventId: 'event-123' })
      mockEventState = { currentEvent: { title: 'My Event', status: 'Published' } }
      mockDispatch.mockResolvedValue({ payload: { success: true } })

      await act(async () => render(<Header {...defaultProps} haveTitle />))
      await userEvent.click(screen.getByText('Huỷ sự kiện'))

      const textarea = screen.getByPlaceholderText(/Ví dụ:/)
      await userEvent.type(textarea, 'Reason for cancellation')

      const submitButton = screen.getByText('Gửi yêu cầu huỷ')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchRequestCancelEvent({ eventId: 'event-123', reason: 'Reason for cancellation' })
        )
      })
    })

    it('should show success notification on cancel', async () => {
      const { notify } = require('../../../../../utils/notify')
      mockUseParams.mockReturnValue({ eventId: 'event-123' })
      mockEventState = { currentEvent: { title: 'My Event', status: 'Published' } }
      mockDispatch.mockResolvedValue({ payload: { success: true } })

      await act(async () => render(<Header {...defaultProps} haveTitle />))
      await userEvent.click(screen.getByText('Huỷ sự kiện'))

      const textarea = screen.getByPlaceholderText(/Ví dụ:/)
      await userEvent.type(textarea, 'Reason')

      await userEvent.click(screen.getByText('Gửi yêu cầu huỷ'))

      await waitFor(() => {
        expect(notify.success).toHaveBeenCalledWith('Yêu cầu huỷ sự kiện thành công')
      })
    })

    it('should show error notification on cancel failure', async () => {
      const { notify } = require('../../../../../utils/notify')
      mockUseParams.mockReturnValue({ eventId: 'event-123' })
      mockEventState = { currentEvent: { title: 'My Event', status: 'Published' } }
      mockDispatch.mockResolvedValue({ error: true })

      await act(async () => render(<Header {...defaultProps} haveTitle />))
      await userEvent.click(screen.getByText('Huỷ sự kiện'))

      const textarea = screen.getByPlaceholderText(/Ví dụ:/)
      await userEvent.type(textarea, 'Reason')

      await userEvent.click(screen.getByText('Gửi yêu cầu huỷ'))

      await waitFor(() => {
        expect(notify.error).toHaveBeenCalledWith('Huỷ thất bại')
      })
    })

    it('should show character count', async () => {
      mockUseParams.mockReturnValue({ eventId: 'event-123' })
      mockEventState = { currentEvent: { title: 'My Event', status: 'Published' } }

      await act(async () => render(<Header {...defaultProps} haveTitle />))
      await userEvent.click(screen.getByText('Huỷ sự kiện'))

      const textarea = screen.getByPlaceholderText(/Ví dụ:/)
      await userEvent.type(textarea, 'Test reason')

      expect(screen.getByText('13 / 500')).toBeInTheDocument()
    })

    it('should truncate reason at max length', async () => {
      mockUseParams.mockReturnValue({ eventId: 'event-123' })
      mockEventState = { currentEvent: { title: 'My Event', status: 'Published' } }

      await act(async () => render(<Header {...defaultProps} haveTitle />))
      await userEvent.click(screen.getByText('Huỷ sự kiện'))

      const textarea = screen.getByPlaceholderText(/Ví dụ:/)
      const longReason = 'A'.repeat(600)
      await userEvent.type(textarea, longReason)

      expect(textarea).toHaveValue('A'.repeat(500))
      expect(screen.getByText('500 / 500')).toBeInTheDocument()
    })
  })

  describe('Create Event', () => {
    it('should navigate to create-event when profile is complete', async () => {
      mockDispatch
        .mockResolvedValueOnce({ payload: { data: { userId: 'user-1' } } }) // fetchMe
        .mockResolvedValueOnce({
          payload: {
            data: { // fetchProfile
              displayName: 'Test User',
              identityNumber: '123456789',
              taxCode: '1234567890',
              accountName: 'Test',
              accountNumber: '123456',
              bankCode: 'VCB',
              branch: 'HCMC',
            }
          }
        })

      await act(async () => render(<Header {...defaultProps} />))
      await userEvent.click(screen.getByText('Tạo sự kiện mới'))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/organizer/create-event')
      })
    })

    it('should redirect to accounts when profile is incomplete', async () => {
      mockDispatch
        .mockResolvedValueOnce({ payload: { data: { userId: 'user-1' } } })
        .mockResolvedValueOnce({ payload: { data: { displayName: null } } })

      await act(async () => render(<Header {...defaultProps} />))
      await userEvent.click(screen.getByText('Tạo sự kiện mới'))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/organizer/accounts', {
          state: { missingFields: expect.any(Array), tab: expect.any(String) },
        })
      })
    })
  })

  describe('Subscription Button', () => {
    it('should navigate to subscription page when clicked', async () => {
      await act(async () => render(<Header {...defaultProps} />))
      await userEvent.click(screen.getByText('Subscription'))
      expect(mockNavigate).toHaveBeenCalledWith('/organizer/subscription')
    })

    it('should only show for Organizer role', async () => {
      mockAuthState = { currentInfor: { roles: ['Member'] } }

      await act(async () => render(<Header {...defaultProps} />))

      expect(screen.queryByText('Subscription')).not.toBeInTheDocument()
    })
  })

  describe('Logout', () => {
    it('should clear tokens and navigate to login', async () => {
      await act(async () => render(<Header {...defaultProps} />))
      await userEvent.click(screen.getByText('Đăng xuất'))

      expect(localStorage.removeItem).toHaveBeenCalledWith('ACCESS_TOKEN')
      expect(localStorage.removeItem).toHaveBeenCalledWith('REFRESH_TOKEN')
      expect(localStorage.removeItem).toHaveBeenCalledWith('DEVICE_ID')
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })

    it('should always show logout button', async () => {
      mockAuthState = { currentInfor: { roles: ['Member'] } }

      await act(async () => render(<Header {...defaultProps} />))

      expect(screen.getByText('Đăng xuất')).toBeInTheDocument()
    })
  })

  describe('API Calls', () => {
    it('should call fetchMe on mount', async () => {
      const { fetchMe } = require('../../../../../store/authSlice')

      await act(async () => render(<Header {...defaultProps} />))

      expect(mockDispatch).toHaveBeenCalledWith(fetchMe())
    })

    it('should call fetchEventById when eventId present', async () => {
      const { fetchEventById } = require('../../../../../store/eventSlice')
      mockUseParams.mockReturnValue({ eventId: 'event-123' })

      await act(async () => render(<Header {...defaultProps} />))

      expect(mockDispatch).toHaveBeenCalledWith(fetchEventById('event-123'))
    })
  })

  describe('Styling', () => {
    it('should render sticky header', async () => {
      await act(async () => render(<Header {...defaultProps} />))
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('sticky', 'top-0', 'z-40')
    })

    it('should render with backdrop blur', async () => {
      await act(async () => render(<Header {...defaultProps} />))
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('backdrop-blur-xl')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty roles', async () => {
      mockAuthState = { currentInfor: { roles: [] } }

      await act(async () => render(<Header {...defaultProps} />))

      expect(screen.queryByText('Tạo sự kiện mới')).not.toBeInTheDocument()
    })

    it('should handle undefined currentInfor', async () => {
      mockAuthState = { currentInfor: null }

      await act(async () => render(<Header {...defaultProps} />))

      expect(screen.getByText('Đăng xuất')).toBeInTheDocument()
    })

    it('should handle very long title', async () => {
      const longTitle = 'A'.repeat(200)
      await act(async () => render(<Header {...defaultProps} title={longTitle} />))
      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should not do anything when already on create-event page', async () => {
      global.window = Object.create(window)
      Object.defineProperty(window, 'location', {
        value: { pathname: '/organizer/create-event' },
      })

      await act(async () => render(<Header {...defaultProps} />))
      await userEvent.click(screen.getByText('Tạo sự kiện mới'))

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
})
