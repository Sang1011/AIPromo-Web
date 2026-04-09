/// <reference types="jest" />
import { act, render, screen } from '@testing-library/react'

import OrderListPage from '../../../pages/Organizer/OrderListPage'

// ============================================================================
// MOCKS
// ============================================================================

// Mock react-router-dom
const mockUseParams = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
}))

// Mock child components
jest.mock('../../components/Organizer/orders/OrderList', () => ({
  __esModule: true,
  default: ({ eventId }: { eventId: string }) => (
    <div data-testid="order-list">
      <span data-testid="event-id">{eventId}</span>
    </div>
  ),
}))

// ============================================================================
// TESTS
// ============================================================================

describe('OrderListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // --------------------------------------------------------------------------
  // 1. Render
  // --------------------------------------------------------------------------
  describe('Render', () => {
    it('should render OrderList component when eventId is provided', async () => {
      mockUseParams.mockReturnValue({ eventId: 'event-123' })

      await act(async () => {
        render(<OrderListPage />)
      })

      expect(screen.getByTestId('order-list')).toBeInTheDocument()
    })

    it('should show error message when eventId is not provided', async () => {
      mockUseParams.mockReturnValue({ eventId: undefined })

      await act(async () => {
        render(<OrderListPage />)
      })

      expect(screen.getByText('Không tìm thấy sự kiện')).toBeInTheDocument()
    })

    it('should show error message when eventId is empty string', async () => {
      mockUseParams.mockReturnValue({ eventId: '' })

      await act(async () => {
        render(<OrderListPage />)
      })

      expect(screen.getByText('Không tìm thấy sự kiện')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 2. UI Elements
  // --------------------------------------------------------------------------
  describe('UI Elements', () => {
    it('should pass eventId to OrderList component', async () => {
      mockUseParams.mockReturnValue({ eventId: 'test-event-456' })

      await act(async () => {
        render(<OrderListPage />)
      })

      expect(screen.getByTestId('event-id')).toHaveTextContent('test-event-456')
    })
  })

  // --------------------------------------------------------------------------
  // 3. Data Display
  // --------------------------------------------------------------------------
  describe('Data Display', () => {
    it('should render OrderList with correct eventId from URL params', async () => {
      mockUseParams.mockReturnValue({ eventId: 'order-event-789' })

      await act(async () => {
        render(<OrderListPage />)
      })

      const orderId = screen.getByTestId('event-id')
      expect(orderId).toHaveTextContent('order-event-789')
    })
  })

  // --------------------------------------------------------------------------
  // 4. Edge Cases
  // --------------------------------------------------------------------------
  describe('Edge Cases', () => {
    it('should handle null eventId gracefully', async () => {
      mockUseParams.mockReturnValue({ eventId: null })

      await act(async () => {
        render(<OrderListPage />)
      })

      expect(screen.getByText('Không tìm thấy sự kiện')).toBeInTheDocument()
    })

    it('should handle different eventId formats', async () => {
      const eventIds = ['123', 'event-abc', 'uuid-123-456-789', 'EV-2024-001']

      for (const eventId of eventIds) {
        jest.clearAllMocks()
        mockUseParams.mockReturnValue({ eventId })

        await act(async () => {
          render(<OrderListPage />)
        })

        expect(screen.getByTestId('event-id')).toHaveTextContent(eventId)
      }
    })

    it('should render error state with correct styling', async () => {
      mockUseParams.mockReturnValue({ eventId: undefined })

      await act(async () => {
        render(<OrderListPage />)
      })

      const errorText = screen.getByText('Không tìm thấy sự kiện')
      expect(errorText).toHaveClass('text-center', 'text-red-400')
    })
  })

  // --------------------------------------------------------------------------
  // 5. Route Params
  // --------------------------------------------------------------------------
  describe('Route Params', () => {
    it('should use useParams to get eventId', async () => {
      mockUseParams.mockReturnValue({ eventId: 'from-params' })

      await act(async () => {
        render(<OrderListPage />)
      })

      expect(screen.getByTestId('event-id')).toHaveTextContent('from-params')
    })

    it('should conditionally render based on eventId presence', async () => {
      // With eventId
      mockUseParams.mockReturnValue({ eventId: 'event-1' })

      await act(async () => {
        render(<OrderListPage />)
      })

      expect(screen.getByTestId('order-list')).toBeInTheDocument()

      // Without eventId
      mockUseParams.mockReturnValue({ eventId: undefined })

      await act(async () => {
        render(<OrderListPage />)
      })

      expect(screen.getByText('Không tìm thấy sự kiện')).toBeInTheDocument()
    })
  })
})
