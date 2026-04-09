/// <reference types="jest" />
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SeatMapShow from '../../../../components/Organizer/SeatMapShow'
import type { SeatMapData } from '../../../../types/config/seatmap'

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
  Rect: ({ x, y, width, height, fill, stroke, strokeWidth, onClick, onMouseEnter, onMouseLeave }: any) => (
    <div
      data-testid="konva-rect"
      data-x={x}
      data-y={y}
      data-width={width}
      data-height={height}
      data-fill={fill}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'default' }}
    />
  ),
  Circle: ({ x, y, radius, stroke, strokeWidth }: any) => (
    <div
      data-testid="konva-circle"
      data-x={x}
      data-y={y}
      data-radius={radius}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
    />
  ),
  Line: ({ points, closed, stroke, strokeWidth }: any) => (
    <div
      data-testid="konva-line"
      data-points={JSON.stringify(points)}
      data-closed={closed}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
    />
  ),
  Text: ({ text, x, y, fontSize, fill }: any) => (
    <div data-testid="konva-text" data-text={text} data-x={x} data-y={y} data-font-size={fontSize} data-fill={fill}>
      {text}
    </div>
  ),
}))

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn()
  disconnect = jest.fn()
}
global.ResizeObserver = MockResizeObserver as any

describe('SeatMapShow', () => {
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
        ticketTypeId: 'vip',
        price: 500000,
        isAreaType: true,
        fill: '#10b981',
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
        name: 'Zone B',
        type: 'rect',
        x: 250,
        y: 0,
        width: 200,
        height: 200,
        rotation: 0,
        stroke: '#ffffff',
        ticketTypeId: 'standard',
        price: 200000,
        isAreaType: true,
        fill: '#3b82f6',
        draggable: false,
        seats: [],
      },
    ],
    texts: [
      {
        id: 'text-1',
        text: 'Zone A Label',
        x: 50,
        y: 100,
        fontSize: 14,
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

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'log').mockImplementation(() => { })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Render', () => {
    it('should render without crashing', () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)
      expect(screen.getByText(/Chọn ghế/)).toBeInTheDocument()
    })

    it('should render header with seat count', () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)
      expect(screen.getByText('Chọn ghế (0 ghế)')).toBeInTheDocument()
    })

    it('should render zoom controls', () => {
      const data = createMockSeatMapData()
      const { container } = render(<SeatMapShow data={data} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
      expect(container.querySelectorAll('button').length).toBeGreaterThanOrEqual(3)
    })

    it('should render legend with seat status colors', () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)
      expect(screen.getByText('Trống')).toBeInTheDocument()
      expect(screen.getByText('Đã chọn')).toBeInTheDocument()
      expect(screen.getByText('Đã bán')).toBeInTheDocument()
    })

    it('should render Konva stage when viewport is ready', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-stage')).toBeInTheDocument()
      })
    })

    it('should render seats as Rect elements', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        const rects = screen.getAllByTestId('konva-rect')
        expect(rects.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('should render text labels', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        expect(screen.getByText('Zone A Label')).toBeInTheDocument()
      })
    })
  })

  describe('Seat Selection', () => {
    it('should select seat when clicking available seat', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        const availableSeat = screen.getAllByTestId('konva-rect')[0]
        userEvent.click(availableSeat)
      })

      await waitFor(() => {
        expect(screen.getByText('Chọn ghế (1 ghế)')).toBeInTheDocument()
      })
    })

    it('should deselect seat when clicking selected seat', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        const availableSeat = screen.getAllByTestId('konva-rect')[0]
        userEvent.click(availableSeat)
        userEvent.click(availableSeat)
      })

      await waitFor(() => {
        expect(screen.getByText('Chọn ghế (0 ghế)')).toBeInTheDocument()
      })
    })

    it('should not select blocked seats', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        const blockedSeat = screen.getAllByTestId('konva-rect')[1]
        userEvent.click(blockedSeat)
      })

      await waitFor(() => {
        expect(screen.getByText('Chọn ghế (0 ghế)')).toBeInTheDocument()
      })
    })

    it('should show selected seats info panel', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        const availableSeat = screen.getAllByTestId('konva-rect')[0]
        userEvent.click(availableSeat)
      })

      await waitFor(() => {
        expect(screen.getByText('Ghế đã chọn:')).toBeInTheDocument()
        expect(screen.getByText('Zone A - A1')).toBeInTheDocument()
      })
    })

    it('should calculate total price correctly', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        const availableSeat = screen.getAllByTestId('konva-rect')[0]
        userEvent.click(availableSeat)
      })

      await waitFor(() => {
        expect(screen.getByText('Tổng tiền: 500.000₫')).toBeInTheDocument()
      })
    })

    it('should log seat selection to console', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        const availableSeat = screen.getAllByTestId('konva-rect')[0]
        userEvent.click(availableSeat)
      })

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Selected Seat:', expect.objectContaining({
          action: 'selected',
          area: 'Zone A',
        }))
      })
    })
  })

  describe('Zoom Controls', () => {
    it('should zoom in when clicking plus button', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      const zoomInButton = screen.getAllByRole('button')[1]
      await userEvent.click(zoomInButton)

      expect(screen.getByText('110%')).toBeInTheDocument()
    })

    it('should zoom out when clicking minus button', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      const zoomOutButton = screen.getAllByRole('button')[2]
      await userEvent.click(zoomOutButton)

      expect(screen.getByText('90%')).toBeInTheDocument()
    })

    it('should reset zoom when clicking percentage button', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      const zoomInButton = screen.getAllByRole('button')[1]
      await userEvent.click(zoomInButton)
      expect(screen.getByText('110%')).toBeInTheDocument()

      const resetButton = screen.getAllByRole('button')[0]
      await userEvent.click(resetButton)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should cap zoom at maximum 300%', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      const zoomInButton = screen.getAllByRole('button')[1]
      for (let i = 0; i < 30; i++) {
        await userEvent.click(zoomInButton)
      }

      const zoomText = screen.getByText(/\d+%/).textContent
      const zoomValue = parseInt(zoomText!)
      expect(zoomValue).toBeLessThanOrEqual(300)
    })

    it('should cap zoom at minimum 30%', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      const zoomOutButton = screen.getAllByRole('button')[2]
      for (let i = 0; i < 10; i++) {
        await userEvent.click(zoomOutButton)
      }

      const zoomText = screen.getByText(/\d+%/).textContent
      const zoomValue = parseInt(zoomText!)
      expect(zoomValue).toBeGreaterThanOrEqual(30)
    })
  })

  describe('Area Hover', () => {
    it('should show area info on hover when area has no seats', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        const areas = screen.getAllByTestId('konva-rect')
        const areaWithoutSeats = areas[2] // Zone B has no seats
        userEvent.hover(areaWithoutSeats)
      })

      expect(screen.getByText('Zone B')).toBeInTheDocument()
      expect(screen.getByText('200.000₫')).toBeInTheDocument()
    })

    it('should not show area info on hover when area has seats', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        const areasWithSeats = screen.getAllByTestId('konva-rect')[0]
        userEvent.hover(areasWithSeats)
      })

      expect(screen.queryByText('Zone A')).not.toBeInTheDocument()
    })
  })

  describe('Area Rendering', () => {
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
            stroke: '#ff0000',
            ticketTypeId: 'vip',
            price: 500000,
            fill: '#3b82f6',
            draggable: false,
            seats: [],
          },
        ],
      })
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-circle')).toBeInTheDocument()
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
            stroke: '#ff0000',
            ticketTypeId: 'vip',
            price: 500000,
            fill: '#3b82f6',
            points: [0, 0, 100, 0, 100, 100, 0, 100],
            draggable: false,
            seats: [],
          },
        ],
      })
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-line')).toBeInTheDocument()
      })
    })

    it('should render triangle areas', async () => {
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
            stroke: '#ff0000',
            ticketTypeId: 'vip',
            price: 500000,
            fill: '#3b82f6',
            draggable: false,
            seats: [],
          },
        ],
      })
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        expect(screen.getByTestId('konva-line')).toBeInTheDocument()
      })
    })
  })

  describe('Seat Colors', () => {
    it('should render available seats with green color', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        const availableSeat = screen.getAllByTestId('konva-rect')[0]
        expect(availableSeat).toHaveAttribute('data-fill', '#10b981')
      })
    })

    it('should render blocked seats with gray color', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        const blockedSeat = screen.getAllByTestId('konva-rect')[1]
        expect(blockedSeat).toHaveAttribute('data-fill', '#374151')
      })
    })

    it('should render selected seats with purple color', async () => {
      const data = createMockSeatMapData()
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        const availableSeat = screen.getAllByTestId('konva-rect')[0]
        userEvent.click(availableSeat)
      })

      await waitFor(() => {
        const selectedSeat = screen.getAllByTestId('konva-rect')[0]
        expect(selectedSeat).toHaveAttribute('data-fill', '#8B5CF6')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty seat map', () => {
      const data = createMockSeatMapData({ areas: [], texts: [] })
      render(<SeatMapShow data={data} />)
      expect(screen.getByText('Chọn ghế (0 ghế)')).toBeInTheDocument()
    })

    it('should handle seat map without texts', () => {
      const data = createMockSeatMapData({ texts: [] })
      render(<SeatMapShow data={data} />)
      expect(screen.queryByText('Zone A Label')).not.toBeInTheDocument()
    })

    it('should handle area without ticketTypeId', () => {
      const data = createMockSeatMapData({
        areas: [
          {
            id: 'no-type-area',
            name: 'No Type Area',
            type: 'rect',
            x: 0,
            y: 0,
            width: 200,
            height: 200,
            rotation: 0,
            stroke: '#ffffff',
            ticketTypeId: '',
            price: 0,
            isAreaType: false,
            fill: '#cccccc',
            draggable: false,
            seats: [],
          },
        ],
      })
      render(<SeatMapShow data={data} />)
      expect(screen.getByText('No Type Area')).toBeInTheDocument()
    })

    it('should handle multiple seat selections', async () => {
      const data = createMockSeatMapData({
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
            ticketTypeId: 'vip',
            price: 500000,
            isAreaType: true,
            fill: '#10b981',
            draggable: false,
            seats: [
              { id: 'seat-1', sectionId: 'area-1', row: 'A', number: 1, x: 10, y: 10, width: 20, height: 20, status: 'available', rotation: 0, fill: '#10b981' },
              { id: 'seat-2', sectionId: 'area-1', row: 'A', number: 2, x: 40, y: 10, width: 20, height: 20, status: 'available', rotation: 0, fill: '#10b981' },
              { id: 'seat-3', sectionId: 'area-1', row: 'A', number: 3, x: 70, y: 10, width: 20, height: 20, status: 'available', rotation: 0, fill: '#10b981' },
            ],
          },
        ],
      })
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        const seats = screen.getAllByTestId('konva-rect')
        userEvent.click(seats[0])
        userEvent.click(seats[1])
        userEvent.click(seats[2])
      })

      await waitFor(() => {
        expect(screen.getByText('Chọn ghế (3 ghế)')).toBeInTheDocument()
        expect(screen.getByText('Tổng tiền: 1.500.000₫')).toBeInTheDocument()
      })
    })

    it('should handle seats without price', async () => {
      const data = createMockSeatMapData({
        areas: [
          {
            id: 'free-area',
            name: 'Free Zone',
            type: 'rect',
            x: 0,
            y: 0,
            width: 200,
            height: 200,
            rotation: 0,
            stroke: '#ffffff',
            ticketTypeId: 'free',
            price: 0,
            isAreaType: true,
            fill: '#10b981',
            draggable: false,
            seats: [
              { id: 'free-seat', sectionId: 'free-area', row: 'A', number: 1, x: 10, y: 10, width: 20, height: 20, status: 'available', rotation: 0, fill: '#10b981' },
            ],
          },
        ],
      })
      render(<SeatMapShow data={data} />)

      await waitFor(() => {
        const freeSeat = screen.getAllByTestId('konva-rect')[0]
        userEvent.click(freeSeat)
      })

      await waitFor(() => {
        expect(screen.getByText('Tổng tiền: 0₫')).toBeInTheDocument()
      })
    })
  })
})
