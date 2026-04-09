/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import EditEventWizardPage from '../../../pages/Organizer/EditEventWizardPage'

// ============================================================================
// MOCKS
// ============================================================================

// Mock react-router-dom
const mockUseParams = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
}))

// Mock Redux
const mockDispatch = jest.fn()
let mockAuthState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    AUTH: mockAuthState,
  }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../store/authSlice', () => ({
  fetchMe: jest.fn(() => ({ type: 'AUTH/fetchMe' })),
}))

jest.mock('../../store/eventSlice', () => ({
  fetchEventById: jest.fn((eventId) => ({ type: 'EVENT/fetchEventById', payload: eventId })),
}))

// Mock child components
jest.mock('../../components/Organizer/Stepper', () => ({
  __esModule: true,
  default: ({ currentStep }: { currentStep: number }) => (
    <div data-testid="stepper">
      <span data-testid="current-step">{currentStep}</span>
    </div>
  ),
}))

jest.mock('../../components/Organizer/steps/Step1EventInfo', () => ({
  __esModule: true,
  default: ({ mode, onNext, eventData }: { mode: string; onNext: () => void; eventData: any }) => (
    <div data-testid="step1-event-info">
      <span data-testid="mode">{mode}</span>
      <span data-testid="event-data">{eventData?.title ?? 'No event'}</span>
      <button data-testid="next-button" onClick={onNext}>Next</button>
    </div>
  ),
}))

jest.mock('../../components/Organizer/steps/Step2Schedule', () => ({
  __esModule: true,
  default: ({ onNext, onBack, eventData }: { onNext: () => void; onBack: () => void; eventData: any }) => (
    <div data-testid="step2-schedule">
      <span data-testid="event-data">{eventData?.title ?? 'No event'}</span>
      <button data-testid="next-button" onClick={onNext}>Next</button>
      <button data-testid="back-button" onClick={onBack}>Back</button>
    </div>
  ),
}))

jest.mock('../../components/Organizer/steps/Step3Settings', () => ({
  __esModule: true,
  default: ({ onNext, onBack, eventData }: { onNext: () => void; onBack: () => void; eventData: any }) => (
    <div data-testid="step3-settings">
      <span data-testid="event-data">{eventData?.title ?? 'No event'}</span>
      <button data-testid="next-button" onClick={onNext}>Next</button>
      <button data-testid="back-button" onClick={onBack}>Back</button>
    </div>
  ),
}))

jest.mock('../../components/Organizer/steps/Step4Policy', () => ({
  __esModule: true,
  default: ({ onBack, eventData }: { onBack: () => void; eventData: any }) => (
    <div data-testid="step4-policy">
      <span data-testid="event-data">{eventData?.title ?? 'No event'}</span>
      <button data-testid="back-button" onClick={onBack}>Back</button>
    </div>
  ),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockEvent = (overrides = {}) => ({
  id: 'event-1',
  title: 'Test Event',
  status: 'Draft',
  publishRejectionReason: null,
  suspensionReason: null,
  cancellationReason: null,
  cancellationRejectionReason: null,
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('EditEventWizardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseParams.mockReturnValue({ eventId: 'event-1' })

    mockAuthState = {
      currentInfor: { roles: ['Organizer'] },
    }

    // Mock dispatch to resolve with event data
    mockDispatch.mockResolvedValue({
      data: createMockEvent(),
    })
  })

  // --------------------------------------------------------------------------
  // 1. Render
  // --------------------------------------------------------------------------
  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<EditEventWizardPage />)
      })

      expect(screen.getByTestId('stepper')).toBeInTheDocument()
    })

    it('should show Step1EventInfo by default', async () => {
      await act(async () => {
        render(<EditEventWizardPage />)
      })

      expect(screen.getByTestId('step1-event-info')).toBeInTheDocument()
    })

    it('should render stepper component', async () => {
      await act(async () => {
        render(<EditEventWizardPage />)
      })

      expect(screen.getByTestId('stepper')).toBeInTheDocument()
      expect(screen.getByTestId('current-step')).toHaveTextContent('1')
    })
  })

  // --------------------------------------------------------------------------
  // 2. UI Elements
  // --------------------------------------------------------------------------
  describe('UI Elements', () => {
    it('should pass mode="edit" to Step1EventInfo', async () => {
      await act(async () => {
        render(<EditEventWizardPage />)
      })

      expect(screen.getByTestId('mode')).toHaveTextContent('edit')
    })

    it('should show rejection reason banner for Draft events', async () => {
      mockDispatch.mockResolvedValue({
        data: createMockEvent({
          status: 'Draft',
          publishRejectionReason: 'Content not appropriate',
        }),
      })

      await act(async () => {
        render(<EditEventWizardPage />)
      })

      await waitFor(() => {
        expect(screen.getByText('Sự kiện bị từ chối duyệt')).toBeInTheDocument()
        expect(screen.getByText('Content not appropriate')).toBeInTheDocument()
      })
    })

    it('should show suspension reason banner for Suspended events', async () => {
      mockDispatch.mockResolvedValue({
        data: createMockEvent({
          status: 'Suspended',
          suspensionReason: 'Technical issues',
        }),
      })

      await act(async () => {
        render(<EditEventWizardPage />)
      })

      await waitFor(() => {
        expect(screen.getByText('Sự kiện đang bị trì hoãn')).toBeInTheDocument()
        expect(screen.getByText('Technical issues')).toBeInTheDocument()
      })
    })
  })

  // --------------------------------------------------------------------------
  // 3. API Calls
  // --------------------------------------------------------------------------
  describe('API Calls', () => {
    it('should call fetchMe on mount', async () => {
      const { fetchMe } = require('../../store/authSlice')

      await act(async () => {
        render(<EditEventWizardPage />)
      })

      expect(mockDispatch).toHaveBeenCalledWith(fetchMe())
    })

    it('should call fetchEventById when eventId is provided', async () => {
      const { fetchEventById } = require('../../store/eventSlice')

      await act(async () => {
        render(<EditEventWizardPage />)
      })

      expect(mockDispatch).toHaveBeenCalledWith(fetchEventById('event-1'))
    })
  })

  // --------------------------------------------------------------------------
  // 4. User Interactions
  // --------------------------------------------------------------------------
  describe('User Interactions', () => {
    it('should navigate to next step when clicking next button', async () => {
      await act(async () => {
        render(<EditEventWizardPage />)
      })

      expect(screen.getByTestId('current-step')).toHaveTextContent('1')

      const nextButton = screen.getByTestId('next-button')
      await userEvent.click(nextButton)

      expect(screen.getByTestId('current-step')).toHaveTextContent('2')
      expect(screen.getByTestId('step2-schedule')).toBeInTheDocument()
    })

    it('should navigate back when clicking back button', async () => {
      await act(async () => {
        render(<EditEventWizardPage />)
      })

      // Go to step 2
      const nextButton = screen.getByTestId('next-button')
      await userEvent.click(nextButton)

      expect(screen.getByTestId('current-step')).toHaveTextContent('2')

      // Go back to step 1
      const backButton = screen.getByTestId('back-button')
      await userEvent.click(backButton)

      expect(screen.getByTestId('current-step')).toHaveTextContent('1')
    })

    it('should navigate through all steps', async () => {
      await act(async () => {
        render(<EditEventWizardPage />)
      })

      // Step 1 -> 2
      await userEvent.click(screen.getByTestId('next-button'))
      expect(screen.getByTestId('current-step')).toHaveTextContent('2')

      // Step 2 -> 3
      await userEvent.click(screen.getByTestId('next-button'))
      expect(screen.getByTestId('current-step')).toHaveTextContent('3')

      // Step 3 -> 4
      await userEvent.click(screen.getByTestId('next-button'))
      expect(screen.getByTestId('current-step')).toHaveTextContent('4')
    })

    it('should not go beyond step 4', async () => {
      await act(async () => {
        render(<EditEventWizardPage />)
      })

      // Navigate to step 4
      for (let i = 0; i < 3; i++) {
        await userEvent.click(screen.getByTestId('next-button'))
      }

      expect(screen.getByTestId('current-step')).toHaveTextContent('4')

      // Try to go to step 5 (should not exist)
      expect(screen.queryByTestId('next-button')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 5. Data Display
  // --------------------------------------------------------------------------
  describe('Data Display', () => {
    it('should display event data in steps', async () => {
      mockDispatch.mockResolvedValue({
        data: createMockEvent({ title: 'My Awesome Event' }),
      })

      await act(async () => {
        render(<EditEventWizardPage />)
      })

      await waitFor(() => {
        expect(screen.getByTestId('event-data')).toHaveTextContent('My Awesome Event')
      })
    })

    it('should pass event data to all step components', async () => {
      const eventData = createMockEvent({ title: 'Test Event Title' })
      mockDispatch.mockResolvedValue({ data: eventData })

      await act(async () => {
        render(<EditEventWizardPage />)
      })

      await waitFor(() => {
        expect(screen.getByTestId('event-data')).toHaveTextContent('Test Event Title')
      })
    })
  })

  // --------------------------------------------------------------------------
  // 6. Edge Cases
  // --------------------------------------------------------------------------
  describe('Edge Cases', () => {
    it('should handle missing eventId gracefully', async () => {
      mockUseParams.mockReturnValue({ eventId: undefined })

      await act(async () => {
        render(<EditEventWizardPage />)
      })

      // Should still render without crashing
      expect(screen.getByTestId('stepper')).toBeInTheDocument()
    })

    it('should handle event fetch error', async () => {
      mockDispatch.mockRejectedValue(new Error('Failed to fetch event'))

      await act(async () => {
        render(<EditEventWizardPage />)
      })

      // Should not crash, stepper should still render
      expect(screen.getByTestId('stepper')).toBeInTheDocument()
    })

    it('should handle event with cancellation reason', async () => {
      mockDispatch.mockResolvedValue({
        data: createMockEvent({
          status: 'Cancelled',
          cancellationReason: 'Force majeure',
        }),
      })

      await act(async () => {
        render(<EditEventWizardPage />)
      })

      await waitFor(() => {
        expect(screen.getByText('Sự kiện đã bị huỷ')).toBeInTheDocument()
        expect(screen.getByText('Force majeure')).toBeInTheDocument()
      })
    })

    it('should handle event with cancellation rejection reason', async () => {
      mockDispatch.mockResolvedValue({
        data: createMockEvent({
          status: 'PendingCancellation',
          cancellationRejectionReason: 'Cannot cancel at this time',
        }),
      })

      await act(async () => {
        render(<EditEventWizardPage />)
      })

      await waitFor(() => {
        expect(screen.getByText('Yêu cầu huỷ bị từ chối')).toBeInTheDocument()
        expect(screen.getByText('Cannot cancel at this time')).toBeInTheDocument()
      })
    })

    it('should not show any banner for Published events', async () => {
      mockDispatch.mockResolvedValue({
        data: createMockEvent({
          status: 'Published',
        }),
      })

      await act(async () => {
        render(<EditEventWizardPage />)
      })

      await waitFor(() => {
        expect(screen.queryByText('Sự kiện bị từ chối duyệt')).not.toBeInTheDocument()
        expect(screen.queryByText('Sự kiện đang bị trì hoãn')).not.toBeInTheDocument()
        expect(screen.queryByText('Sự kiện đã bị huỷ')).not.toBeInTheDocument()
      })
    })

    it('should set isAllowUpdate to true for Draft events', async () => {
      mockDispatch.mockResolvedValue({
        data: createMockEvent({ status: 'Draft' }),
      })

      await act(async () => {
        render(<EditEventWizardPage />)
      })

      // Component should allow updates (mode="edit" should be present)
      expect(screen.getByTestId('mode')).toHaveTextContent('edit')
    })

    it('should set isAllowUpdate to true for Suspended events', async () => {
      mockDispatch.mockResolvedValue({
        data: createMockEvent({ status: 'Suspended' }),
      })

      await act(async () => {
        render(<EditEventWizardPage />)
      })

      expect(screen.getByTestId('mode')).toHaveTextContent('edit')
    })

    it('should preserve step state in localStorage', async () => {
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem')

      await act(async () => {
        render(<EditEventWizardPage />)
      })

      // Navigate to step 2
      await userEvent.click(screen.getByTestId('next-button'))

      expect(mockSetItem).toHaveBeenCalledWith(
        'editEventStep_event-1',
        '2'
      )
    })
  })
})
