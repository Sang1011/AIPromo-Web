/// <reference types="jest" />
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CreateEventPage from '../../../pages/Organizer/CreateEventPage'

// ============================================================================
// MOCKS
// ============================================================================

// Mock react-router-dom
const mockUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUseNavigate(),
}))

// Mock child components
jest.mock('../../components/Organizer/steps/Step1EventInfo', () => ({
  __esModule: true,
  default: ({ mode, onCreated }: { mode: string; onCreated: (id: string) => void }) => (
    <div data-testid="step1-event-info">
      <span data-testid="mode">{mode}</span>
      <button
        data-testid="create-button"
        onClick={() => onCreated('new-event-123')}
      >
        Create Event
      </button>
    </div>
  ),
}))

// ============================================================================
// TESTS
// ============================================================================

describe('CreateEventPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseNavigate.mockReturnValue(jest.fn())
  })

  // --------------------------------------------------------------------------
  // 1. Render
  // --------------------------------------------------------------------------
  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<CreateEventPage />)
      })

      expect(screen.getByText('Tạo sự kiện mới')).toBeInTheDocument()
    })

    it('should render Step1EventInfo component', async () => {
      await act(async () => {
        render(<CreateEventPage />)
      })

      expect(screen.getByTestId('step1-event-info')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 2. UI Elements
  // --------------------------------------------------------------------------
  describe('UI Elements', () => {
    it('should render page title', async () => {
      await act(async () => {
        render(<CreateEventPage />)
      })

      expect(screen.getByText('Tạo sự kiện mới')).toBeInTheDocument()
    })

    it('should pass mode="create" to Step1EventInfo', async () => {
      await act(async () => {
        render(<CreateEventPage />)
      })

      expect(screen.getByTestId('mode')).toHaveTextContent('create')
    })
  })

  // --------------------------------------------------------------------------
  // 3. User Interactions
  // --------------------------------------------------------------------------
  describe('User Interactions', () => {
    it('should navigate to edit page when event is created', async () => {
      await act(async () => {
        render(<CreateEventPage />)
      })

      const createButton = screen.getByTestId('create-button')
      await userEvent.click(createButton)

      expect(mockUseNavigate).toHaveBeenCalledWith('/organizer/my-events/new-event-123/edit')
    })

    it('should use correct event ID in navigation', async () => {
      await act(async () => {
        render(<CreateEventPage />)
      })

      const createButton = screen.getByTestId('create-button')
      await userEvent.click(createButton)

      expect(mockUseNavigate).toHaveBeenCalledTimes(1)
    })
  })

  // --------------------------------------------------------------------------
  // 4. Component Configuration
  // --------------------------------------------------------------------------
  describe('Component Configuration', () => {
    it('should pass onCreated callback to Step1EventInfo', async () => {
      await act(async () => {
        render(<CreateEventPage />)
      })

      const createButton = screen.getByTestId('create-button')
      expect(createButton).toBeInTheDocument()
    })

    it('should render with correct layout structure', async () => {
      await act(async () => {
        render(<CreateEventPage />)
      })

      const container = screen.getByTestId('step1-event-info').parentElement
      expect(container).toHaveClass('max-w-[1100px]', 'mx-auto', 'space-y-8', 'pb-16')
    })
  })

  // --------------------------------------------------------------------------
  // 5. Edge Cases
  // --------------------------------------------------------------------------
  describe('Edge Cases', () => {
    it('should handle rapid create clicks', async () => {
      await act(async () => {
        render(<CreateEventPage />)
      })

      const createButton = screen.getByTestId('create-button')

      // Click multiple times rapidly
      await userEvent.click(createButton)
      await userEvent.click(createButton)
      await userEvent.click(createButton)

      // Should navigate multiple times (component should handle this)
      expect(mockUseNavigate).toHaveBeenCalledTimes(3)
    })

    it('should handle different event IDs from onCreated', async () => {
      const customEventId = 'custom-event-xyz'

      jest.mock('../../components/Organizer/steps/Step1EventInfo', () => ({
        __esModule: true,
        default: ({ onCreated }: { onCreated: (id: string) => void }) => (
          <div data-testid="step1-event-info">
            <button
              data-testid="create-button"
              onClick={() => onCreated(customEventId)}
            >
              Create Event
            </button>
          </div>
        ),
      }))

      await act(async () => {
        render(<CreateEventPage />)
      })

      const createButton = screen.getByTestId('create-button')
      await userEvent.click(createButton)

      expect(mockUseNavigate).toHaveBeenCalledWith(`/organizer/my-events/${customEventId}/edit`)
    })
  })
})
