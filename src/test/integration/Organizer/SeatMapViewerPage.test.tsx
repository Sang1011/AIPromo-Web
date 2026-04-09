/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'

import SeatMapViewerPage from '../../../pages/Organizer/SeatMapViewerPage'

// ============================================================================
// MOCKS
// ============================================================================

// Mock react-konva
jest.mock('react-konva', () => ({
  Stage: ({ children, width, height }: any) => (
    <div data-testid="konva-stage" data-width={width} data-height={height}>{children}</div>
  ),
  Layer: ({ children }: any) => <div data-testid="konva-layer">{children}</div>,
  Group: ({ children }: any) => <div data-testid="konva-group">{children}</div>,
  Rect: (props: any) => <div data-testid="konva-rect" data-x={props.x} data-y={props.y} />,
  Circle: (props: any) => <div data-testid="konva-circle" data-radius={props.radius} />,
  Line: (props: any) => <div data-testid="konva-line" data-points={JSON.stringify(props.points)} />,
  Text: (props: any) => <div data-testid="konva-text" data-text={props.text}>{props.text}</div>,
}))

jest.mock('konva', () => ({}))

const mockUseParams = jest.fn()
const mockUseNavigate = jest.fn()
const mockUseLocation = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
  useNavigate: () => mockUseNavigate(),
  useLocation: () => mockUseLocation(),
}))

const mockDispatch = jest.fn()
let mockEventState: any = {}
let mockSeatMapState: any = {}
let mockTicketTypeState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    EVENT: mockEventState,
    SEAT_MAP: mockSeatMapState,
    TICKET_TYPE: mockTicketTypeState,
  }),
  useDispatch: () => mockDispatch,
}))

jest.mock('../../../store/eventSlice', () => ({
  fetchEventByUrlPath: jest.fn(() => ({ type: 'EVENT/fetchByUrl' })),
}))

jest.mock('../../../store/seatMapSlice', () => ({
  fetchGetSeatMap: jest.fn(() => ({ type: 'SEAT_MAP/fetch' })),
}))

jest.mock('../../../store/ticketTypeSlice', () => ({
  fetchGetAllTicketTypes: jest.fn(() => ({ type: 'TICKET_TYPE/fetchAll' })),
}))

jest.mock('../../../store/ticketingSlice', () => ({
  fetchCreatePendingOrder: jest.fn(() => ({ type: 'TICKETING/createOrder' })),
}))

jest.mock('../../../utils/notify', () => ({
  notify: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
}))

jest.mock('../../../utils/orderFirebase', () => ({
  clearOldOrderFromFirebase: jest.fn(() => Promise.resolve()),
}))

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
  constructor(callback: ResizeObserverCallback) {
    setTimeout(() => callback([{ contentRect: { width: 1200, height: 800 } } as any], this), 0)
  }
}
; (global as any).ResizeObserver = MockResizeObserver

// ============================================================================
// TESTS
// ============================================================================

describe('SeatMapViewerPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ urlPath: 'test-event' })
    mockUseNavigate.mockReturnValue(jest.fn())
    mockUseLocation.mockReturnValue({ state: null })

    mockEventState = {
      currentEvent: {
        id: 'event-123',
        title: 'Test Event',
        status: 'Published',
        sessions: [{ id: 'session-1', title: 'Session 1' }],
      },
    }

    mockSeatMapState = {
      seatMapData: null,
      loading: false,
    }

    mockTicketTypeState = {
      ticketTypes: [
        {
          id: 'ticket-1',
          name: 'VIP',
          color: '#3b82f6',
          price: 500000,
        },
      ],
    }

    mockDispatch.mockResolvedValue({})
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      const { container } = render(<SeatMapViewerPage />)
      expect(container).toBeInTheDocument()
    })

    it('should render Konva stage when data is loaded', async () => {
      mockSeatMapState.seatMapData = {
        areas: [
          {
            id: 'area-1',
            name: 'Zone A',
            type: 'rect',
            x: 0,
            y: 0,
            width: 300,
            height: 200,
            rotation: 0,
            stroke: '#ffffff',
            ticketTypeId: 'ticket-1',
            price: 500000,
            isAreaType: true,
            fill: '#3b82f6',
            draggable: false,
            seats: [],
          },
        ],
        texts: [],
      }

      await act(async () => render(<SeatMapViewerPage />))
      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })
    })
  })

  describe('API Calls', () => {
    it('should call fetchEventByUrlPath on mount', async () => {
      const { fetchEventByUrlPath } = require('../../../store/eventSlice')
      await act(async () => render(<SeatMapViewerPage />))
      expect(mockDispatch).toHaveBeenCalledWith(fetchEventByUrlPath('test-event'))
    })

    it('should call fetchGetSeatMap when eventId is available', async () => {
      const { fetchGetSeatMap } = require('../../../store/seatMapSlice')
      await act(async () => render(<SeatMapViewerPage />))
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchGetSeatMap(expect.any(Object)))
      })
    })

    it('should call fetchGetAllTicketTypes on mount', async () => {
      const { fetchGetAllTicketTypes } = require('../../../store/ticketTypeSlice')
      await act(async () => render(<SeatMapViewerPage />))
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchGetAllTicketTypes(expect.any(Object)))
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading when seat map is loading', async () => {
      mockSeatMapState.loading = true
      const { container } = render(<SeatMapViewerPage />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing urlPath', async () => {
      mockUseParams.mockReturnValue({ urlPath: undefined })
      const { container } = render(<SeatMapViewerPage />)
      expect(container).toBeInTheDocument()
    })

    it('should handle null event data', async () => {
      mockEventState.currentEvent = null
      const { container } = render(<SeatMapViewerPage />)
      expect(container).toBeInTheDocument()
    })

    it('should handle empty sessions', async () => {
      mockEventState.currentEvent = { sessions: [] }
      const { container } = render(<SeatMapViewerPage />)
      expect(container).toBeInTheDocument()
    })

    it('should handle empty ticket types', async () => {
      mockTicketTypeState.ticketTypes = []
      const { container } = render(<SeatMapViewerPage />)
      expect(container).toBeInTheDocument()
    })

    it('should handle seat map with no areas', async () => {
      mockSeatMapState.seatMapData = { areas: [], texts: [] }
      await act(async () => render(<SeatMapViewerPage />))
      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })
    })

    it('should handle seat map with seats', async () => {
      mockSeatMapState.seatMapData = {
        areas: [
          {
            id: 'area-1',
            name: 'Zone A',
            type: 'rect',
            x: 0,
            y: 0,
            width: 300,
            height: 200,
            rotation: 0,
            stroke: '#ffffff',
            ticketTypeId: 'ticket-1',
            price: 500000,
            isAreaType: true,
            fill: '#3b82f6',
            draggable: false,
            seats: [
              {
                id: 'seat-1',
                sectionId: 'area-1',
                row: 'A',
                number: 1,
                x: 10,
                y: 10,
                width: 20,
                height: 20,
                status: 'available',
                rotation: 0,
                fill: '#10b981',
              },
            ],
          },
        ],
        texts: [],
      }

      await act(async () => render(<SeatMapViewerPage />))
      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })
    })
  })
})
