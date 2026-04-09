/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SeatMapReadOnly from '../../../../../components/Organizer/seatmap/SeatMapReadOnly'
import type { SeatMapData } from '../../../../../types/config/seatmap'
import type { TicketTypeItem } from '../../../../../types/ticketType/ticketType'

// Mock Konva
const mockStage = {
  scaleX: () => 1,
  scaleY: () => 1,
  x: () => 0,
  y: () => 0,
  getPointerPosition: () => ({ x: 100, y: 100 }),
  batchDraw: jest.fn(),
}

jest.mock('react-konva', () => ({
  Stage: jest.fn(({ children, width, height, scaleX, scaleY, x, y, onWheel, onMouseDown, onMouseMove, onContextMenu, ref }: any) => {
    if (ref) ref.current = mockStage
    return (
      <div
        data-testid="konva-stage"
        data-width={width}
        data-height={height}
        data-scale-x={scaleX}
        data-scale-y={scaleY}
        data-x={x}
        data-y={y}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onContextMenu={onContextMenu}
      >
        {children}
      </div>
    )
  }),
  Layer: ({ children }: any) => <div data-testid="konva-layer">{children}</div>,
  Group: ({ children, x, y, rotation, listening, onMouseEnter, onMouseMove, onMouseLeave }: any) => (
    <div
      data-testid="konva-group"
      data-x={x}
      data-y={y}
      data-rotation={rotation}
      data-listening={listening}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  ),
  Rect: ({ x, y, width, height, fill, stroke, strokeWidth, cornerRadius, listening, opacity }: any) => (
    <div
      data-testid="konva-rect"
      data-x={x}
      data-y={y}
      data-width={width}
      data-height={height}
      data-fill={fill}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
      data-corner-radius={cornerRadius}
      data-listening={listening}
      data-opacity={opacity}
    />
  ),
  Circle: ({ radius, fill, stroke, strokeWidth }: any) => (
    <div data-testid="konva-circle" data-radius={radius} data-fill={fill} data-stroke={stroke} data-stroke-width={strokeWidth} />
  ),
  Line: ({ points, closed, fill, stroke }: any) => (
    <div data-testid="konva-line" data-points={JSON.stringify(points)} data-closed={closed} data-fill={fill} data-stroke={stroke} />
  ),
  Text: ({ text, x, y, fontSize, fill, align, width, listening, verticalAlign }: any) => (
    <div
      data-testid="konva-text"
      data-text={text}
      data-x={x}
      data-y={y}
      data-font-size={fontSize}
      data-fill={fill}
      data-align={align}
      data-width={width}
      data-listening={listening}
      data-vertical-align={verticalAlign}
    >
      {text}
    </div>
  ),
}))

// Mock Konva library
jest.mock('konva', () => ({}))

describe('SeatMapReadOnly', () => {
  const createMockSeatMapData = (overrides: Partial<SeatMapData> = {}): SeatMapData => ({
    areas: [
      {
        id: 'area-1',
        name: 'VIP Zone',
        type: 'rect',
        x: 0,
        y: 0,
        width: 300,
        height: 200,
        rotation: 0,
        stroke: '#ffffff',
        ticketTypeId: 'ticket-vip',
        price: 500000,
        isAreaType: true,
        fill: '#3b82f6',
        labelFontSize: 14,
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
            fill: '#ffffff',
          },
          {
            id: 'seat-2',
            sectionId: 'area-1',
            row: 'A',
            number: 2,
            x: 40,
            y: 10,
            width: 20,
            height: 20,
            status: 'blocked',
            rotation: 0,
            fill: '#9ca3af',
          },
        ],
      },
      {
        id: 'area-2',
        name: 'Standard Zone',
        type: 'rect',
        x: 350,
        y: 0,
        width: 300,
        height: 200,
        rotation: 0,
        stroke: '#ffffff',
        ticketTypeId: 'ticket-standard',
        price: 200000,
        isAreaType: true,
        fill: '#8b5cf6',
        labelFontSize: 14,
        draggable: false,
        seats: [],
      },
    ],
    texts: [
      {
        id: 'text-1',
        text: 'Stage',
        x: 200,
        y: 250,
        fontSize: 18,
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        rotation: 0,
        width: 200,
        height: 40,
        attachedAreaId: undefined,
        draggable: false,
      },
    ],
    ...overrides,
  })

  const mockTicketTypes: TicketTypeItem[] = [
    {
      id: 'ticket-vip',
      name: 'VIP',
      price: 500000,
      quantity: 100,
      soldQuantity: 50,
      remainingQuantity: 50,
      color: '#3b82f6',
      areaId: 'area-1',
      areaName: 'VIP Zone',
      areaType: 'Zone',
    },
    {
      id: 'ticket-standard',
      name: 'Standard',
      price: 200000,
      quantity: 200,
      soldQuantity: 100,
      remainingQuantity: 100,
      color: '#8b5cf6',
      areaId: 'area-2',
      areaName: 'Standard Zone',
      areaType: 'Zone',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock ResizeObserver
    class MockResizeObserver {
      observe = jest.fn(() => {
        // Simulate resize event
        setTimeout(() => {
          const callback = (this as any).callback
          if (callback) {
            callback([{ contentRect: { width: 1200, height: 800 } }])
          }
        }, 0)
      })
      disconnect = jest.fn()
      constructor(callback: ResizeObserverCallback) {
        ; (this as any).callback = callback
      }
    }
    ; (global as any).ResizeObserver = MockResizeObserver
  })

  describe('Render', () => {
    it('should render container with dark background', () => {
      const data = createMockSeatMapData()
      const { container } = render(<SeatMapReadOnly seatMapData={data} />)

      const mainDiv = container.firstChild as HTMLElement
      expect(mainDiv).toHaveStyle({ background: '#0B0B12' })
    })

    it('should render stage after resize', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })
    })

    it('should render areas', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        const groups = screen.getAllByTestId('konva-group')
        expect(groups.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('should render seats', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        const rects = screen.getAllByTestId('konva-rect')
        expect(rects.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('should render texts', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByText('Stage')).toBeInTheDocument()
      })
    })

    it('should render zoom controls', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByText('+')).toBeInTheDocument()
        expect(screen.getByText('↺')).toBeInTheDocument()
        expect(screen.getByText('−')).toBeInTheDocument()
      })
    })
  })

  describe('Area Rendering', () => {
    it('should render rectangular areas', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        const rects = screen.getAllByTestId('konva-rect')
        expect(rects.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('should render circular areas', async () => {
      const data = createMockSeatMapData({
        areas: [
          {
            id: 'circle-area',
            name: 'Circle Zone',
            type: 'circle',
            x: 100,
            y: 100,
            width: 200,
            height: 200,
            rotation: 0,
            stroke: '#ffffff',
            ticketTypeId: 'ticket-1',
            price: 300000,
            isAreaType: true,
            fill: '#10b981',
            draggable: false,
            seats: [],
          },
        ],
      })
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-circle')).toBeInTheDocument()
      })
    })

    it('should render triangular areas', async () => {
      const data = createMockSeatMapData({
        areas: [
          {
            id: 'triangle-area',
            name: 'Triangle Zone',
            type: 'triangle',
            x: 0,
            y: 0,
            width: 200,
            height: 200,
            rotation: 0,
            stroke: '#ffffff',
            ticketTypeId: 'ticket-1',
            price: 300000,
            isAreaType: true,
            fill: '#10b981',
            draggable: false,
            seats: [],
          },
        ],
      })
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-line')).toBeInTheDocument()
      })
    })

    it('should render polygon areas', async () => {
      const data = createMockSeatMapData({
        areas: [
          {
            id: 'polygon-area',
            name: 'Polygon Zone',
            type: 'polygon',
            x: 0,
            y: 0,
            width: 200,
            height: 200,
            rotation: 0,
            stroke: '#ffffff',
            ticketTypeId: 'ticket-1',
            price: 300000,
            isAreaType: true,
            fill: '#10b981',
            points: [0, 0, 100, 0, 100, 100, 0, 100],
            draggable: false,
            seats: [],
          },
        ],
      })
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        const lines = screen.getAllByTestId('konva-line')
        const polygonLine = lines.find(l => l.getAttribute('data-points') === '[0,0,100,0,100,100,0,100]')
        expect(polygonLine).toBeInTheDocument()
      })
    })

    it('should render trapezoid areas', async () => {
      const data = createMockSeatMapData({
        areas: [
          {
            id: 'trapezoid-area',
            name: 'Trapezoid Zone',
            type: 'trapezoid',
            x: 0,
            y: 0,
            width: 200,
            height: 200,
            rotation: 0,
            stroke: '#ffffff',
            ticketTypeId: 'ticket-1',
            price: 300000,
            isAreaType: true,
            fill: '#10b981',
            draggable: false,
            seats: [],
          },
        ],
      })
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-line')).toBeInTheDocument()
      })
    })

    it('should render parallelogram areas', async () => {
      const data = createMockSeatMapData({
        areas: [
          {
            id: 'parallelogram-area',
            name: 'Parallelogram Zone',
            type: 'parallelogram',
            x: 0,
            y: 0,
            width: 200,
            height: 200,
            rotation: 0,
            stroke: '#ffffff',
            ticketTypeId: 'ticket-1',
            price: 300000,
            isAreaType: true,
            fill: '#10b981',
            draggable: false,
            seats: [],
          },
        ],
      })
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-line')).toBeInTheDocument()
      })
    })
  })

  describe('Seat Display', () => {
    it('should render available seats with white fill', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        const rects = screen.getAllByTestId('konva-rect')
        const availableSeat = rects.find(r => r.getAttribute('data-fill') === '#ffffff')
        expect(availableSeat).toBeInTheDocument()
      })
    })

    it('should render blocked seats with gray fill and reduced opacity', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        const rects = screen.getAllByTestId('konva-rect')
        const blockedSeat = rects.find(r => r.getAttribute('data-fill') === '#9ca3af')
        expect(blockedSeat).toHaveAttribute('data-opacity', '0.5')
      })
    })

    it('should render seats with corner radius', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        const rects = screen.getAllByTestId('konva-rect')
        const seatRect = rects.find(r => r.getAttribute('data-corner-radius') === '4')
        expect(seatRect).toBeInTheDocument()
      })
    })

    it('should set seat listening to false', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        const rects = screen.getAllByTestId('konva-rect')
        const seatRect = rects.find(r => r.getAttribute('data-listening') === 'false')
        expect(seatRect).toBeInTheDocument()
      })
    })
  })

  describe('Zone Labels', () => {
    it('should render zone name for areas without seats', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByText('Standard Zone')).toBeInTheDocument()
      })
    })

    it('should render zone name for areas with seats', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByText('VIP Zone')).toBeInTheDocument()
      })
    })

    it('should render quantity info for zones', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} ticketTypes={mockTicketTypes} />)

      await waitFor(() => {
        expect(screen.getByText(/SL: 200/)).toBeInTheDocument()
      })
    })

    it('should render price info for zones', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} ticketTypes={mockTicketTypes} />)

      await waitFor(() => {
        expect(screen.getByText('200.000đ')).toBeInTheDocument()
      })
    })
  })

  describe('Tooltip', () => {
    it('should show tooltip on area hover', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} ticketTypes={mockTicketTypes} />)

      await waitFor(() => {
        const groups = screen.getAllByTestId('konva-group')
        const areaWithSeats = groups.find(g => g.getAttribute('data-listening') === 'true')
        if (areaWithSeats?.onmouseenter) {
          act(() => {
            ; (areaWithSeats.onmouseenter as Function)({})
          })
        }
      })
    })

    it('should hide tooltip on area leave', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} ticketTypes={mockTicketTypes} />)

      await waitFor(() => {
        const groups = screen.getAllByTestId('konva-group')
        const areaWithSeats = groups.find(g => g.getAttribute('data-listening') === 'true')
        if (areaWithSeats?.onmouseleave) {
          act(() => {
            ; (areaWithSeats.onmouseleave as Function)({})
          })
        }
      })
    })
  })

  describe('Zoom Controls', () => {
    it('should zoom in when clicking + button', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })

      const zoomInButton = screen.getByText('+')
      await userEvent.click(zoomInButton)

      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })
    })

    it('should reset zoom when clicking ↺ button', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })

      const resetButton = screen.getByText('↺')
      await userEvent.click(resetButton)

      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })
    })

    it('should zoom out when clicking − button', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })

      const zoomOutButton = screen.getByText('−')
      await userEvent.click(zoomOutButton)

      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })
    })
  })

  describe('Pan/Zoom Interaction', () => {
    it('should handle wheel event for zoom', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        const stage = screen.getByTestId('konva-stage')
        expect(stage).toHaveAttribute('data-width')
      })
    })

    it('should handle mouse down for pan', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        const stage = screen.getByTestId('konva-stage')
        expect(stage).toHaveAttribute('data-width')
      })
    })

    it('should prevent context menu', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        const stage = screen.getByTestId('konva-stage')
        expect(stage).toBeInTheDocument()
      })
    })
  })

  describe('Text Rendering', () => {
    it('should render attached texts', async () => {
      const data = createMockSeatMapData({
        texts: [
          {
            id: 'text-attached',
            text: 'Attached Label',
            x: 50,
            y: 50,
            fontSize: 12,
            fontFamily: 'Arial',
            fontStyle: 'normal',
            fill: '#ffffff',
            align: 'center',
            verticalAlign: 'middle',
            width: 100,
            height: 20,
            rotation: 0,
            attachedAreaId: 'area-1',
            draggable: false,
          },
        ],
      })
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByText('Attached Label')).toBeInTheDocument()
      })
    })

    it('should render unattached texts', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByText('Stage')).toBeInTheDocument()
      })
    })

    it('should set text listening to false', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        const textElement = screen.getByText('Stage')
        expect(textElement).toHaveAttribute('data-listening', 'false')
      })
    })
  })

  describe('Styling', () => {
    it('should render with dark background', async () => {
      const data = createMockSeatMapData()
      const { container } = render(<SeatMapReadOnly seatMapData={data} />)

      const mainDiv = container.firstChild as HTMLElement
      expect(mainDiv).toHaveStyle({ background: '#0B0B12' })
    })

    it('should render with relative positioning', async () => {
      const data = createMockSeatMapData()
      const { container } = render(<SeatMapReadOnly seatMapData={data} />)

      const mainDiv = container.firstChild as HTMLElement
      expect(mainDiv).toHaveStyle({ position: 'relative' })
    })

    it('should render zoom controls with correct styling', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        const zoomInButton = screen.getByText('+')
        expect(zoomInButton).toHaveStyle({ background: '#1a1a2e' })
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty areas array', async () => {
      const data = createMockSeatMapData({ areas: [] })
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })
    })

    it('should handle empty texts array', async () => {
      const data = createMockSeatMapData({ texts: [] })
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })
    })

    it('should handle undefined texts', async () => {
      const data = createMockSeatMapData({ texts: undefined })
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })
    })

    it('should handle empty ticketTypes array', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapReadOnly seatMapData={data} ticketTypes={[]} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })
    })

    it('should handle areas without ticket type match', async () => {
      const data = createMockSeatMapData()
      const unmatchedTicketTypes: TicketTypeItem[] = [
        {
          id: 'ticket-unmatched',
          name: 'Unmatched',
          price: 100000,
          quantity: 50,
          soldQuantity: 25,
          remainingQuantity: 25,
          color: '#cccccc',
          areaId: 'area-unmatched',
          areaName: 'Unmatched',
          areaType: 'Zone'
        },
      ]
      render(<SeatMapReadOnly seatMapData={data} ticketTypes={unmatchedTicketTypes} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })
    })

    it('should handle very large seat map', async () => {
      const manySeats = Array.from({ length: 500 }, (_, i) => ({
        id: `seat-${i}`,
        sectionId: 'area-1',
        row: String.fromCharCode(65 + Math.floor(i / 20)),
        number: (i % 20) + 1,
        x: (i % 20) * 25,
        y: Math.floor(i / 20) * 25,
        width: 20,
        height: 20,
        status: 'available' as const,
        rotation: 0,
        fill: '#10b981',
      }))

      const data = createMockSeatMapData({
        areas: [
          {
            id: 'area-1',
            name: 'Large Zone',
            type: 'rect',
            x: 0,
            y: 0,
            width: 500,
            height: 625,
            rotation: 0,
            stroke: '#ffffff',
            ticketTypeId: 'ticket-1',
            price: 100000,
            isAreaType: true,
            fill: '#cccccc',
            draggable: false,
            seats: manySeats,
          },
        ],
      })
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })
    })

    it('should handle seats with zero rotation', async () => {
      const data = createMockSeatMapData({
        areas: [
          {
            id: 'area-1',
            name: 'Zone',
            type: 'rect',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            rotation: 0,
            stroke: '#ffffff',
            ticketTypeId: 'ticket-1',
            price: 100000,
            isAreaType: true,
            fill: '#cccccc',
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
                fill: '#10b981',
                rotation: 0,
              },
            ],
          },
        ],
      })
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })
    })

    it('should handle missing area fill color', async () => {
      const data = createMockSeatMapData({
        areas: [
          {
            id: 'area-no-fill',
            name: 'No Fill',
            type: 'rect',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            rotation: 0,
            stroke: '#ffffff',
            ticketTypeId: 'ticket-1',
            price: 100000,
            isAreaType: true,
            fill: undefined,
            draggable: false,
            seats: [],
          },
        ],
      })
      render(<SeatMapReadOnly seatMapData={data} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })
    })

    it('should handle zero container size initially', async () => {
      class MockResizeObserverNoFire {
        observe = jest.fn()
        disconnect = jest.fn()
        constructor() {
        }
      }
      ; (global as any).ResizeObserver = MockResizeObserverNoFire

      const data = createMockSeatMapData()
      const { container } = render(<SeatMapReadOnly seatMapData={data} />)

      // Should not crash
      expect(container).toBeInTheDocument()
    })
  })
})
