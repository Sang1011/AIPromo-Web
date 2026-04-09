/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Step1EventInfo from '../../../../../components/Organizer/steps/Step1EventInfo'

// Mock Redux
const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => selector({
    AUTH: { currentInfor: { roles: ['Organizer'] } },
  }),
}))

jest.mock('../../../../../store/eventSlice', () => ({
  fetchCreateEvent: jest.fn(() => ({ type: 'EVENT/create', payload: {} })),
  fetchUpdateEvent: jest.fn(() => ({ type: 'EVENT/update', payload: {} })),
  fetchUpdateEventBanner: jest.fn(() => ({ type: 'EVENT/updateBanner', payload: {} })),
}))

jest.mock('../../../../../store/organizerProfileSlice', () => ({
  fetchAllCategories: jest.fn(() => ({ type: 'ORGANIZER/fetchCategories', payload: [] })),
  fetchAllHashtags: jest.fn(() => ({ type: 'ORGANIZER/fetchHashtags', payload: [] })),
  fetchCreateHashtag: jest.fn(() => ({ type: 'ORGANIZER/createHashtag', payload: {} })),
}))

jest.mock('../../../../../store/walletSlice', () => ({
  fetchUpload: jest.fn(() => ({ type: 'WALLET/upload', payload: 'https://example.com/image.jpg' })),
  fetchCreateImage: jest.fn(() => ({ type: 'WALLET/createImage', payload: {} })),
  fetchDeleteImage: jest.fn(() => ({ type: 'WALLET/deleteImage', payload: {} })),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ eventId: 'event-123' }),
}))

jest.mock('../../../../../utils/notify', () => ({
  notify: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
}))

jest.mock('../../../../../components/Organizer/shared/ImagePreviewBox', () => ({
  __esModule: true,
  default: ({ imageUrl, onRemove }: any) => (
    <div data-testid="image-preview-box">
      <span data-testid="image-url">{imageUrl}</span>
      {onRemove && <button data-testid="remove-image" onClick={onRemove}>Remove</button>}
    </div>
  ),
}))

jest.mock('../../../../../components/Organizer/shared/UploadBox', () => ({
  __esModule: true,
  default: ({ label, onChange }: any) => (
    <div data-testid="upload-box">
      <span>{label}</span>
      <input data-testid="file-input" type="file" onChange={(e) => onChange?.(e.target.files?.[0])} />
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

describe('Step1EventInfo', () => {
  const mockOnNext = jest.fn()
  const mockOnCreated = jest.fn()
  const mockReloadEvent = jest.fn()

  const mockEventData = {
    id: 'event-123',
    title: 'Test Event',
    bannerUrl: 'https://example.com/banner.jpg',
    description: 'Test Description',
    location: 'Test Location',
    hashtags: [{ id: 1, name: '#test' }],
    categories: [{ id: 1, name: 'Category' }],
    actorImages: [{ id: '1', name: 'Actor 1', major: 'CEO', image: 'https://example.com/actor1.jpg' }],
    images: [],
    status: 'Draft',
  } as any

  const defaultProps = {
    onNext: mockOnNext,
    mode: 'edit' as const,
    onCreated: mockOnCreated,
    eventData: mockEventData,
    reloadEvent: mockReloadEvent,
    isAllowUpdate: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockResolvedValue({})
  })

  describe('Render', () => {
    it('should render form sections', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} />))
      expect(screen.getByTestId('upload-box')).toBeInTheDocument()
    })

    it('should render event title input', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} />))
      expect(screen.getByPlaceholderText(/Tên sự kiện/)).toBeInTheDocument()
    })

    it('should render description textarea', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} />))
      expect(screen.getByPlaceholderText(/Mô tả/)).toBeInTheDocument()
    })

    it('should render location input', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} />))
      expect(screen.getByPlaceholderText(/Địa chỉ/)).toBeInTheDocument()
    })

    it('should render actors section', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} />))
      expect(screen.getByText(/Diễn giả/)).toBeInTheDocument()
    })

    it('should render Next button', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} />))
      expect(screen.getByText('Tiếp tục')).toBeInTheDocument()
    })

    it('should render image upload sections', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} />))
      expect(screen.getAllByTestId('upload-box').length).toBeGreaterThan(0)
    })
  })

  describe('Form Validation', () => {
    it('should show error for missing event name', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} eventData={null} />))
      const nextButton = screen.getByText('Tiếp tục')
      await userEvent.click(nextButton)
      await waitFor(() => {
        expect(screen.getByText(/Tên sự kiện/)).toBeInTheDocument()
      })
    })

    it('should show error for missing location', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} eventData={null} />))
      const nextButton = screen.getByText('Tiếp tục')
      await userEvent.click(nextButton)
      await waitFor(() => {
        expect(screen.getByText(/Địa chỉ/)).toBeInTheDocument()
      })
    })

    it('should clear errors when typing', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} eventData={null} />))
      const titleInput = screen.getByPlaceholderText(/Tên sự kiện/)
      await userEvent.type(titleInput, 'New Event Name')
      expect(screen.queryByText(/bắt buộc/)).not.toBeInTheDocument()
    })
  })

  describe('Create Mode', () => {
    it('should create event when submitting', async () => {
      const { fetchCreateEvent } = require('../../../../../store/eventSlice')
      await act(async () => render(<Step1EventInfo {...defaultProps} mode="create" eventData={null} />))
      const nextButton = screen.getByText('Tiếp tục')
      await userEvent.click(nextButton)
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchCreateEvent(expect.any(Object)))
      })
    })

    it('should call onCreated after successful creation', async () => {
      mockDispatch.mockResolvedValue({ data: { id: 'new-event-123' } })
      await act(async () => render(<Step1EventInfo {...defaultProps} mode="create" eventData={null} />))
      const nextButton = screen.getByText('Tiếp tục')
      await userEvent.click(nextButton)
      await waitFor(() => {
        expect(mockOnCreated).toHaveBeenCalledWith('new-event-123')
      })
    })
  })

  describe('Edit Mode', () => {
    it('should update event when submitting', async () => {
      const { fetchUpdateEvent } = require('../../../../../store/eventSlice')
      await act(async () => render(<Step1EventInfo {...defaultProps} />))
      const nextButton = screen.getByText('Tiếp tục')
      await userEvent.click(nextButton)
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchUpdateEvent(expect.any(Object)))
      })
    })

    it('should call onNext after successful update', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} />))
      const nextButton = screen.getByText('Tiếp tục')
      await userEvent.click(nextButton)
      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalled()
      })
    })
  })

  describe('Image Handling', () => {
    it('should handle banner upload', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} />))
      const uploadBoxes = screen.getAllByTestId('upload-box')
      expect(uploadBoxes.length).toBeGreaterThan(0)
    })

    it('should show remove button for existing images', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} />))
      const imageBox = screen.getByTestId('image-preview-box')
      expect(imageBox).toBeInTheDocument()
    })

    it('should handle actor image removal', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} />))
      const removeButton = screen.getByTestId('remove-image')
      await userEvent.click(removeButton)
    })
  })

  describe('Hashtag/Category Management', () => {
    it('should display selected hashtags', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} />))
      expect(screen.getByText('#test')).toBeInTheDocument()
    })

    it('should display selected categories', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} />))
      expect(screen.getByText('Category')).toBeInTheDocument()
    })

    it('should allow removing hashtags', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} />))
      const removeButtons = screen.getAllByRole('button')
      const hashtagRemoveButton = removeButtons.find(btn => btn.textContent === '×')
      if (hashtagRemoveButton) {
        await userEvent.click(hashtagRemoveButton)
      }
    })
  })

  describe('Actor Management', () => {
    it('should display actors with images', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} />))
      expect(screen.getByText('Actor 1')).toBeInTheDocument()
      expect(screen.getByText('CEO')).toBeInTheDocument()
    })

    it('should allow adding new actors', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} />))
      const addActorButton = screen.getByText(/Thêm diễn giả/)
      await userEvent.click(addActorButton)
    })

    it('should allow removing actors', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} />))
      const removeButtons = screen.getAllByRole('button')
      const actorRemoveButton = removeButtons.find(btn => btn.textContent === '×')
      if (actorRemoveButton) {
        await userEvent.click(actorRemoveButton)
      }
    })
  })

  describe('Disabled State', () => {
    it('should disable all inputs when isAllowUpdate is false', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} isAllowUpdate={false} />))
      const titleInput = screen.getByPlaceholderText(/Tên sự kiện/)
      expect(titleInput).toBeDisabled()
    })

    it('should disable Next button when isAllowUpdate is false', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} isAllowUpdate={false} />))
      const nextButton = screen.getByText('Tiếp tục')
      expect(nextButton).toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle null eventData in create mode', async () => {
      await act(async () => render(<Step1EventInfo {...defaultProps} mode="create" eventData={null} />))
      expect(screen.getByTestId('upload-box')).toBeInTheDocument()
    })

    it('should handle empty hashtags array', async () => {
      const emptyHashtagsData = { ...mockEventData, hashtags: [] }
      await act(async () => render(<Step1EventInfo {...defaultProps} eventData={emptyHashtagsData} />))
      expect(screen.queryByText('#test')).not.toBeInTheDocument()
    })

    it('should handle empty categories array', async () => {
      const emptyCategoriesData = { ...mockEventData, categories: [] }
      await act(async () => render(<Step1EventInfo {...defaultProps} eventData={emptyCategoriesData} />))
      expect(screen.queryByText('Category')).not.toBeInTheDocument()
    })

    it('should handle empty actorImages array', async () => {
      const emptyActorsData = { ...mockEventData, actorImages: [] }
      await act(async () => render(<Step1EventInfo {...defaultProps} eventData={emptyActorsData} />))
      expect(screen.queryByText('Actor 1')).not.toBeInTheDocument()
    })
  })
})
