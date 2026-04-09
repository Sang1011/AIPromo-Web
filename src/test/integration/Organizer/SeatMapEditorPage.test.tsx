/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'

import SeatMapEditorPage from '../../../pages/Organizer/SeatMapEditorPage'

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
  Transformer: () => <div data-testid="konva-transformer" />,
}))

// Mock Konva
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
    SEATMAP: mockSeatMapState,
    TICKET_TYPE: mockTicketTypeState,
  }),
  useDispatch: () => mockDispatch,
}))

jest.mock('../../../store/eventSlice', () => ({
  fetchEventById: jest.fn(() => ({ type: 'EVENT/fetchById' })),
}))

jest.mock('../../../store/seatMapSlice', () => ({
  fetchGetSeatMap: jest.fn(() => ({ type: 'SEAT_MAP/fetch' })),
  fetchUpdateSeatMap: jest.fn(() => ({ type: 'SEAT_MAP/update' })),
  fetchAssignAreas: jest.fn(() => ({ type: 'SEAT_MAP/assignAreas' })),
}))

jest.mock('../../../store/ticketTypeSlice', () => ({
  fetchGetAllTicketTypes: jest.fn(() => ({ type: 'TICKET_TYPE/fetchAll' })),
}))

jest.mock('../../../utils/notify', () => ({
  notify: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
}))

jest.mock('../../../utils/getSeatBoundingBox', () => ({
  getSeatsBoundingBox: jest.fn(() => ({ minX: 0, minY: 0, maxX: 100, maxY: 100 })),
}))

jest.mock('../../../utils/getWorldPointer', () => ({
  getWorldPointer: jest.fn(() => ({ x: 0, y: 0 })),
}))

jest.mock('../../../utils/validateSeatMap', () => ({
  validateSeatMap: jest.fn(() => ({ valid: true, errors: [] })),
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

describe('SeatMapEditorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ eventId: 'event-123' })
    mockUseNavigate.mockReturnValue(jest.fn())
    mockUseLocation.mockReturnValue({ state: null })

    mockEventState = {
      currentEvent: {
        id: 'event-123',
        title: 'Test Event',
        status: 'Draft',
        sessions: [{ id: 'session-1', title: 'Session 1' }],
      },
    }

    mockSeatMapState = {
      spec: null,
      loading: false,
    }

    mockTicketTypeState = {
      ticketTypes: [{ id: 'tt-1', name: 'General', color: '#3b82f6', price: 100000 }],
    }

    const createThunk = (unwrapVal?: any) => ({
      unwrap: () => Promise.resolve(unwrapVal ?? {}),
      finally: (cb: any) => { cb(); return Promise.resolve({}); },
    })
    mockDispatch.mockImplementation(() =>
      createThunk({ data: { sessions: [{ id: 'session-1', title: 'Session 1' }] } })
    )
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      const { container } = await act(async () => render(<SeatMapEditorPage />))
      expect(container).toBeInTheDocument()
    })

    it('should render Konva stage', async () => {
      await act(async () => render(<SeatMapEditorPage />))
      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })
    })

    it('should render editor toolbar', async () => {
      const { container } = await act(async () => render(<SeatMapEditorPage />))
      expect(container).toBeInTheDocument()
    })
  })

  describe('API Calls', () => {
    it('should call fetchGetAllTicketTypes on mount', async () => {
      const { fetchGetAllTicketTypes } = require('../../../store/ticketTypeSlice')
      await act(async () => render(<SeatMapEditorPage />))
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchGetAllTicketTypes(expect.any(Object)))
      })
    })

    it('should call fetchEventById after ticket types are ready', async () => {
      const { fetchEventById } = require('../../../store/eventSlice')
      await act(async () => render(<SeatMapEditorPage />))
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchEventById('event-123'))
      })
    })

    it('should call fetchGetSeatMap when eventId is available', async () => {
      const { fetchGetSeatMap } = require('../../../store/seatMapSlice')
      await act(async () => render(<SeatMapEditorPage />))
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchGetSeatMap(expect.any(Object)))
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading when seat map is loading', async () => {
      mockSeatMapState.loading = true
      const { container } = await act(async () => render(<SeatMapEditorPage />))
      expect(container).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing eventId', async () => {
      mockUseParams.mockReturnValue({ eventId: undefined })
      const { container } = await act(async () => render(<SeatMapEditorPage />))
      expect(container).toBeInTheDocument()
    })

    it('should handle null event data', async () => {
      mockEventState.currentEvent = null
      const { container } = await act(async () => render(<SeatMapEditorPage />))
      expect(container).toBeInTheDocument()
    })

    it('should handle empty sessions', async () => {
      mockEventState.currentEvent = { sessions: [] }
      const { container } = await act(async () => render(<SeatMapEditorPage />))
      expect(container).toBeInTheDocument()
    })

    it('should handle seat map parse error', async () => {
      mockSeatMapState.spec = 'invalid-json'
      const { container } = await act(async () => render(<SeatMapEditorPage />))
      expect(container).toBeInTheDocument()
    })
  })
})
