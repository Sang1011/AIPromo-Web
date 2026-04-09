/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

import { SeatMapCanvas } from '../../../../../components/Organizer/seatmap/SeatMapCanvas'
import type { SeatMapData } from '../../../../../types/config/seatmap'

// Mock react-konva
jest.mock('react-konva', () => ({
  Stage: ({ children, width, height }: any) => (
    <div data-testid="konva-stage" data-width={width} data-height={height}>
      {children}
    </div>
  ),
  Layer: ({ children }: any) => <div data-testid="konva-layer">{children}</div>,
  Group: ({ children, scaleX, scaleY, x, y }: any) => (
    <div data-testid="konva-group" data-scale-x={scaleX} data-scale-y={scaleY} data-x={x} data-y={y}>
      {children}
    </div>
  ),
  Rect: ({ x, y, width, height, fill, stroke, strokeWidth, listening, onClick, cornerRadius }: any) => (
    <div
      data-testid="konva-rect"
      data-x={x}
      data-y={y}
      data-width={width}
      data-height={height}
      data-fill={fill}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
      data-listening={listening}
      data-corner-radius={cornerRadius}
      onClick={() => onClick?.({})}
    />
  ),
  Text: ({ text, x, y, fontSize, fill, listening }: any) => (
    <div data-testid="konva-text" data-text={text} data-x={x} data-y={y} data-font-size={fontSize} data-fill={fill} data-listening={listening}>
      {text}
    </div>
  ),
}))

describe('SeatMapCanvas', () => {
  const createMockSeatMapData = (overrides: Partial<SeatMapData> = {}): SeatMapData => ({
    areas: [
      {
        id: 'area-1',
        name: 'Zone A',
        type: 'rect',
        x: 0,
        y: 0,
        width: 200,
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
            fill: '#10b981',
            rotation: 0,
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
            fill: '#9ca3af',
            rotation: 0,
          },
        ],
      },
      {
        id: 'area-2',
        name: 'Zone B',
        type: 'rect',
        x: 250,
        y: 0,
        width: 200,
        height: 200,
        rotation: 0,
        stroke: '#ffffff',
        ticketTypeId: 'ticket-2',
        price: 200000,
        isAreaType: true,
        fill: '#8b5cf6',
        draggable: false,
        seats: [],
      },
    ],
    texts: [
      {
        id: 'text-1',
        text: 'Stage',
        x: 100,
        y: 250,
        fontSize: 16,
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        rotation: 0,
        width: 100,
        height: 30,
        draggable: false,
      },
    ],
    ...overrides,
  })

  const mockViewport = {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    width: 800,
    height: 600,
  }

  const mockOnSeatClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render Konva stage with correct dimensions', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} />)

      expect(screen.getByTestId('konva-stage')).toHaveAttribute('data-width', '800')
      expect(screen.getByTestId('konva-stage')).toHaveAttribute('data-height', '600')
    })

    it('should render layer', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} />)
      expect(screen.getByTestId('konva-layer')).toBeInTheDocument()
    })

    it('should render group with viewport transform', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} />)

      expect(screen.getByTestId('konva-group')).toHaveAttribute('data-scale-x', '1')
      expect(screen.getByTestId('konva-group')).toHaveAttribute('data-scale-y', '1')
      expect(screen.getByTestId('konva-group')).toHaveAttribute('data-x', '0')
      expect(screen.getByTestId('konva-group')).toHaveAttribute('data-y', '0')
    })

    it('should render area rectangles', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} />)

      const rects = screen.getAllByTestId('konva-rect')
      // 2 areas + 2 seats = 4 rects
      expect(rects.length).toBeGreaterThanOrEqual(4)
    })

    it('should render seat rectangles', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} />)

      const rects = screen.getAllByTestId('konva-rect')
      const seatRects = rects.filter(r =>
        r.getAttribute('data-x') === '10' ||
        r.getAttribute('data-x') === '40'
      )
      expect(seatRects.length).toBeGreaterThanOrEqual(2)
    })

    it('should render text labels', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} />)

      expect(screen.getByText('Stage')).toBeInTheDocument()
    })
  })

  describe('Seat Selection', () => {
    it('should highlight selected seats with purple fill', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} selectedSeatIds={['seat-1']} />)

      const rects = screen.getAllByTestId('konva-rect')
      const selectedRect = rects.find(r => r.getAttribute('data-fill') === '#8B5CF6')
      expect(selectedRect).toBeInTheDocument()
    })

    it('should apply pink stroke to selected seats', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} selectedSeatIds={['seat-1']} />)

      const rects = screen.getAllByTestId('konva-rect')
      const selectedRect = rects.find(r => r.getAttribute('data-stroke') === '#ec4899')
      expect(selectedRect).toBeInTheDocument()
    })

    it('should not highlight unselected seats', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} selectedSeatIds={['seat-1']} />)

      const rects = screen.getAllByTestId('konva-rect')
      const unselectedRect = rects.find(r => r.getAttribute('data-x') === '40')
      expect(unselectedRect).not.toHaveAttribute('data-stroke', '#ec4899')
    })
  })

  describe('Interactivity', () => {
    it('should enable seat listening when interactive is true', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} interactive />)

      const rects = screen.getAllByTestId('konva-rect')
      const seatRect = rects.find(r => r.getAttribute('data-listening') === 'true')
      expect(seatRect).toBeInTheDocument()
    })

    it('should disable seat listening when interactive is false', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} interactive={false} />)

      const rects = screen.getAllByTestId('konva-rect')
      const seatRect = rects.find(r => r.getAttribute('data-listening') === 'true')
      expect(seatRect).not.toBeInTheDocument()
    })

    it('should call onSeatClick when seat is clicked in interactive mode', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} interactive onSeatClick={mockOnSeatClick} />)

      const rects = screen.getAllByTestId('konva-rect')
      const seatRect = rects.find(r => r.getAttribute('data-x') === '10')
      if (seatRect?.onclick) {
        ; (seatRect.onclick as Function)({})
        expect(mockOnSeatClick).toHaveBeenCalledWith('seat-1')
      }
    })

    it('should not call onSeatClick when not in interactive mode', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} interactive={false} onSeatClick={mockOnSeatClick} />)

      const rects = screen.getAllByTestId('konva-rect')
      const seatRect = rects.find(r => r.getAttribute('data-x') === '10')
      if (seatRect?.onclick) {
        ; (seatRect.onclick as Function)({})
        expect(mockOnSeatClick).not.toHaveBeenCalled()
      }
    })
  })

  describe('Area Rendering', () => {
    it('should render areas with correct stroke', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} />)

      const rects = screen.getAllByTestId('konva-rect')
      const areaRect = rects.find(r => r.getAttribute('data-stroke') === '#ffffff')
      expect(areaRect).toBeInTheDocument()
    })

    it('should set area listening to false', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} />)

      const rects = screen.getAllByTestId('konva-rect')
      const areaRect = rects.find(r => r.getAttribute('data-x') === '0')
      expect(areaRect).toHaveAttribute('data-listening', 'false')
    })
  })

  describe('Text Rendering', () => {
    it('should render texts with listening disabled', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} />)

      const textElement = screen.getByText('Stage')
      expect(textElement).toHaveAttribute('data-listening', 'false')
    })

    it('should render texts with correct properties', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} />)

      const textElement = screen.getByText('Stage')
      expect(textElement).toHaveAttribute('data-font-size', '16')
      expect(textElement).toHaveAttribute('data-fill', '#ffffff')
    })

    it('should handle empty texts array', () => {
      const data = createMockSeatMapData({ texts: [] })
      render(<SeatMapCanvas data={data} viewport={mockViewport} />)

      expect(screen.queryByText('Stage')).not.toBeInTheDocument()
    })

    it('should handle undefined texts', () => {
      const data = createMockSeatMapData({ texts: undefined as any })
      render(<SeatMapCanvas data={data} viewport={mockViewport} />)
      expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
    })
  })

  describe('Viewport Transform', () => {
    it('should apply custom scale', () => {
      const data = createMockSeatMapData()
      const customViewport = { ...mockViewport, scale: 1.5 }
      render(<SeatMapCanvas data={data} viewport={customViewport} />)

      expect(screen.getByTestId('konva-group')).toHaveAttribute('data-scale-x', '1.5')
      expect(screen.getByTestId('konva-group')).toHaveAttribute('data-scale-y', '1.5')
    })

    it('should apply custom offset', () => {
      const data = createMockSeatMapData()
      const customViewport = { ...mockViewport, offsetX: 50, offsetY: 30 }
      render(<SeatMapCanvas data={data} viewport={customViewport} />)

      expect(screen.getByTestId('konva-group')).toHaveAttribute('data-x', '50')
      expect(screen.getByTestId('konva-group')).toHaveAttribute('data-y', '30')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty areas array', () => {
      const data = createMockSeatMapData({ areas: [] })
      render(<SeatMapCanvas data={data} viewport={mockViewport} />)

      expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
    })

    it('should handle areas without seats', () => {
      const data = createMockSeatMapData({
        areas: [
          {
            id: 'area-empty',
            name: 'Empty Zone',
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
            seats: [],
          },
        ],
      })
      render(<SeatMapCanvas data={data} viewport={mockViewport} />)
      expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
    })

    it('should handle seats with default fill color', () => {
      const data = createMockSeatMapData({
        areas: [
          {
            id: 'area-1',
            name: 'Zone A',
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
                id: 'seat-default-fill',
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
      })
      render(<SeatMapCanvas data={data} viewport={mockViewport} />)
      expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
    })

    it('should handle undefined onSeatClick', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} interactive />)
      expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
    })

    it('should handle selectedSeatIds with non-existent IDs', () => {
      const data = createMockSeatMapData()
      render(<SeatMapCanvas data={data} viewport={mockViewport} selectedSeatIds={['non-existent']} />)
      expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
    })

    it('should handle large number of seats', () => {
      const manySeats = Array.from({ length: 100 }, (_, i) => ({
        id: `seat-${i}`,
        sectionId: 'area-1',
        row: 'A',
        number: i + 1,
        x: i * 25,
        y: 10,
        width: 20,
        height: 20,
        status: 'available' as const,
        fill: '#10b981',
        rotation: 0,
      }))

      const data = createMockSeatMapData({
        areas: [
          {
            id: 'area-1',
            name: 'Zone A',
            type: 'rect',
            x: 0,
            y: 0,
            width: 2500,
            height: 50,
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
      render(<SeatMapCanvas data={data} viewport={mockViewport} />)
      expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
    })
  })
})
