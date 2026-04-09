/// <reference types="jest" />
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import TicketTypeModal from '../../../../../components/Organizer/ticket/TicketTypeModal'
import type { TicketTypeItem } from '../../../../../types/ticketType/ticketType'
import type { EventSession } from '../../../../../types/event/event'

// Mock Redux
const mockDispatch = jest.fn()
let mockTicketTypeState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    TICKET_TYPE: mockTicketTypeState,
  }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../../../../store/ticketTypeSlice', () => ({
  fetchCreateTicketType: jest.fn(({ eventId, data }) => ({
    type: 'TICKET_TYPE/create',
    payload: { eventId, data },
  })),
  fetchUpdateTicketType: jest.fn(({ eventId, ticketTypeId, data }) => ({
    type: 'TICKET_TYPE/update',
    payload: { eventId, ticketTypeId, data },
  })),
  fetchDeleteTicketType: jest.fn(({ eventId, ticketTypeId }) => ({
    type: 'TICKET_TYPE/delete',
    payload: { eventId, ticketTypeId },
  })),
  fetchGetAllTicketTypes: jest.fn(({ eventId, eventSessionId }) => ({
    type: 'TICKET_TYPE/fetchAll',
    payload: { eventId, eventSessionId },
  })),
}))

// Mock notify
jest.mock('../../../../../utils/notify', () => ({
  notify: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}))

describe('TicketTypeModal', () => {
  const mockSessions: EventSession[] = [
    { id: 'session-1', title: 'Session 1', description: '', startTime: '2024-12-01T10:00:00Z', endTime: '2024-12-01T12:00:00Z' },
  ]

  const mockTickets: TicketTypeItem[] = [
    { id: 'ticket-1', name: 'VIP', price: 500000, quantity: 100, soldQuantity: 50, remainingQuantity: 50, areaId: 'area-1', areaName: 'Zone A', areaType: 'Zone' },
    { id: 'ticket-2', name: 'Standard', price: 200000, quantity: 200, soldQuantity: 100, remainingQuantity: 100, areaId: 'area-2', areaName: 'Zone B', areaType: 'Zone' },
  ]

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    eventId: 'event-123',
    sessions: mockSessions,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockTicketTypeState = {
      ticketTypes: [],
    }
    mockDispatch.mockResolvedValue({})
  })

  describe('Render', () => {
    it('should not render when open is false', () => {
      render(<TicketTypeModal {...defaultProps} open={false} />)
      expect(screen.queryByText('Quản lý loại vé')).not.toBeInTheDocument()
    })

    it('should render modal when open is true', () => {
      render(<TicketTypeModal {...defaultProps} />)
      expect(screen.getByText('Quản lý loại vé')).toBeInTheDocument()
    })

    it('should render modal header with title and subtitle', () => {
      render(<TicketTypeModal {...defaultProps} />)
      expect(screen.getByText('Quản lý loại vé')).toBeInTheDocument()
      expect(screen.getByText('Áp dụng chung cho toàn bộ sự kiện')).toBeInTheDocument()
    })

    it('should render close button', () => {
      render(<TicketTypeModal {...defaultProps} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render empty state when no tickets', () => {
      render(<TicketTypeModal {...defaultProps} />)
      expect(screen.getByText('Chưa có loại vé nào')).toBeInTheDocument()
      expect(screen.getByText('Thêm loại vé bên dưới để bắt đầu')).toBeInTheDocument()
    })

    it('should render ticket list when tickets exist', () => {
      mockTicketTypeState.ticketTypes = mockTickets
      render(<TicketTypeModal {...defaultProps} />)
      expect(screen.getByText('VIP')).toBeInTheDocument()
      expect(screen.getByText('Standard')).toBeInTheDocument()
    })

    it('should render add ticket form button', () => {
      render(<TicketTypeModal {...defaultProps} />)
      expect(screen.getByText('Thêm loại vé mới')).toBeInTheDocument()
    })
  })

  describe('Ticket Display', () => {
    it('should display ticket name', () => {
      mockTicketTypeState.ticketTypes = mockTickets
      render(<TicketTypeModal {...defaultProps} />)
      expect(screen.getByText('VIP')).toBeInTheDocument()
    })

    it('should display formatted price', () => {
      mockTicketTypeState.ticketTypes = mockTickets
      render(<TicketTypeModal {...defaultProps} />)
      expect(screen.getByText('500.000đ')).toBeInTheDocument()
      expect(screen.getByText('200.000đ')).toBeInTheDocument()
    })

    it('should display ticket quantity', () => {
      mockTicketTypeState.ticketTypes = mockTickets
      render(<TicketTypeModal {...defaultProps} />)
      expect(screen.getByText('100 vé')).toBeInTheDocument()
      expect(screen.getByText('200 vé')).toBeInTheDocument()
    })

    it('should display area name when available', () => {
      mockTicketTypeState.ticketTypes = mockTickets
      render(<TicketTypeModal {...defaultProps} />)
      expect(screen.getByText('Zone A')).toBeInTheDocument()
      expect(screen.getByText('Zone B')).toBeInTheDocument()
    })

    it('should show edit and delete buttons on hover', () => {
      mockTicketTypeState.ticketTypes = mockTickets
      render(<TicketTypeModal {...defaultProps} />)

      const ticketRow = screen.getByText('VIP')?.parentElement
      expect(ticketRow).toBeInTheDocument()
    })
  })

  describe('Add Ticket Form', () => {
    it('should open add form when clicking add button', async () => {
      render(<TicketTypeModal {...defaultProps} />)
      const addButton = screen.getByText('Thêm loại vé mới')
      await userEvent.click(addButton)

      expect(screen.getByText('Thêm loại vé mới').closest('.rounded-xl')).toHaveClass('border-primary/15')
    })

    it('should show name input in add form', async () => {
      render(<TicketTypeModal {...defaultProps} />)
      const addButton = screen.getByText('Thêm loại vé mới')
      await userEvent.click(addButton)

      const nameInput = screen.getByPlaceholderText('VD: VÉ TIÊU CHUẨN')
      expect(nameInput).toBeInTheDocument()
    })

    it('should show price input in add form', async () => {
      render(<TicketTypeModal {...defaultProps} />)
      const addButton = screen.getByText('Thêm loại vé mới')
      await userEvent.click(addButton)

      expect(screen.getByText('Giá vé')).toBeInTheDocument()
    })

    it('should show quantity input in add form', async () => {
      render(<TicketTypeModal {...defaultProps} />)
      const addButton = screen.getByText('Thêm loại vé mới')
      await userEvent.click(addButton)

      const quantityInput = screen.getByPlaceholderText('Số lượng')
      expect(quantityInput).toBeInTheDocument()
    })

    it('should validate empty name', async () => {
      render(<TicketTypeModal {...defaultProps} />)
      const addButton = screen.getByText('Thêm loại vé mới')
      await userEvent.click(addButton)

      const submitButton = screen.getByText('Thêm vé')
      await userEvent.click(submitButton)

      expect(screen.getByText('Tên vé không được để trống')).toBeInTheDocument()
    })

    it('should validate minimum price', async () => {
      render(<TicketTypeModal {...defaultProps} />)
      const addButton = screen.getByText('Thêm loại vé mới')
      await userEvent.click(addButton)

      const nameInput = screen.getByPlaceholderText('VD: VÉ TIÊU CHUẨN')
      await userEvent.type(nameInput, 'Test Ticket')

      const submitButton = screen.getByText('Thêm vé')
      await userEvent.click(submitButton)

      expect(screen.getByText('Giá tối thiểu 1.000đ')).toBeInTheDocument()
    })

    it('should validate minimum quantity', async () => {
      render(<TicketTypeModal {...defaultProps} />)
      const addButton = screen.getByText('Thêm loại vé mới')
      await userEvent.click(addButton)

      const nameInput = screen.getByPlaceholderText('VD: VÉ TIÊU CHUẨN')
      await userEvent.type(nameInput, 'Test Ticket')

      const quantityInput = screen.getByPlaceholderText('Số lượng')
      await userEvent.clear(quantityInput)

      const submitButton = screen.getByText('Thêm vé')
      await userEvent.click(submitButton)

      expect(screen.getByText('Số lượng tối thiểu 1')).toBeInTheDocument()
    })

    it('should toggle FREE mode', async () => {
      render(<TicketTypeModal {...defaultProps} />)
      const addButton = screen.getByText('Thêm loại vé mới')
      await userEvent.click(addButton)

      const freeButton = screen.getByText('FREE')
      await userEvent.click(freeButton)

      expect(screen.getByText('Miễn phí')).toBeInTheDocument()
    })

    it('should call fetchCreateTicketType with correct data', async () => {
      const { fetchCreateTicketType } = require('../../../../../store/ticketTypeSlice')
      render(<TicketTypeModal {...defaultProps} />)

      const addButton = screen.getByText('Thêm loại vé mới')
      await userEvent.click(addButton)

      const nameInput = screen.getByPlaceholderText('VD: VÉ TIÊU CHUẨN')
      await userEvent.type(nameInput, 'VIP Ticket')

      const quantityInput = screen.getByPlaceholderText('Số lượng')
      await userEvent.clear(quantityInput)
      await userEvent.type(quantityInput, '100')

      const submitButton = screen.getByText('Thêm vé')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchCreateTicketType({
            eventId: 'event-123',
            data: {
              name: 'VIP Ticket',
              price: 0,
              quantity: 100,
            },
          })
        )
      })
    })

    it('should show success notification after adding ticket', async () => {
      const { notify } = require('../../../../../utils/notify')
      render(<TicketTypeModal {...defaultProps} />)

      const addButton = screen.getByText('Thêm loại vé mới')
      await userEvent.click(addButton)

      const nameInput = screen.getByPlaceholderText('VD: VÉ TIÊU CHUẨN')
      await userEvent.type(nameInput, 'Test')

      const quantityInput = screen.getByPlaceholderText('Số lượng')
      await userEvent.clear(quantityInput)
      await userEvent.type(quantityInput, '10')

      const submitButton = screen.getByText('Thêm vé')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(notify.success).toHaveBeenCalledWith('Đã thêm loại vé')
      })
    })

    it('should show error notification when adding fails', async () => {
      mockDispatch.mockRejectedValueOnce(new Error('Failed'))
      const { notify } = require('../../../../../utils/notify')
      render(<TicketTypeModal {...defaultProps} />)

      const addButton = screen.getByText('Thêm loại vé mới')
      await userEvent.click(addButton)

      const nameInput = screen.getByPlaceholderText('VD: VÉ TIÊU CHUẨN')
      await userEvent.type(nameInput, 'Test')

      const quantityInput = screen.getByPlaceholderText('Số lượng')
      await userEvent.clear(quantityInput)
      await userEvent.type(quantityInput, '10')

      const submitButton = screen.getByText('Thêm vé')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(notify.error).toHaveBeenCalledWith('Không thể thêm loại vé')
      })
    })

    it('should close form and reset after successful add', async () => {
      render(<TicketTypeModal {...defaultProps} />)
      const addButton = screen.getByText('Thêm loại vé mới')
      await userEvent.click(addButton)

      const nameInput = screen.getByPlaceholderText('VD: VÉ TIÊU CHUẨN')
      await userEvent.type(nameInput, 'Test')

      const quantityInput = screen.getByPlaceholderText('Số lượng')
      await userEvent.clear(quantityInput)
      await userEvent.type(quantityInput, '10')

      const submitButton = screen.getByText('Thêm vé')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('Test')).not.toBeInTheDocument()
      })
    })

    it('should cancel add form', async () => {
      render(<TicketTypeModal {...defaultProps} />)
      const addButton = screen.getByText('Thêm loại vé mới')
      await userEvent.click(addButton)

      const cancelButton = screen.getByText('Huỷ')
      await userEvent.click(cancelButton)

      expect(screen.getByText('Thêm loại vé mới')).toBeInTheDocument()
    })
  })

  describe('Delete Ticket', () => {
    it('should call fetchDeleteTicketType when deleting', async () => {
      const { fetchDeleteTicketType } = require('../../../../../store/ticketTypeSlice')
      mockTicketTypeState.ticketTypes = mockTickets
      render(<TicketTypeModal {...defaultProps} />)

      const ticketRow = screen.getByText('VIP')?.parentElement
      const deleteButton = within(ticketRow as HTMLElement).getAllByRole('button')[1]
      await userEvent.click(deleteButton)

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchDeleteTicketType({
            eventId: 'event-123',
            ticketTypeId: 'ticket-1',
          })
        )
      })
    })

    it('should show success notification after deleting', async () => {
      const { notify } = require('../../../../../utils/notify')
      mockTicketTypeState.ticketTypes = mockTickets
      render(<TicketTypeModal {...defaultProps} />)

      const ticketRow = screen.getByText('VIP')?.parentElement
      const deleteButton = within(ticketRow as HTMLElement).getAllByRole('button')[1]
      await userEvent.click(deleteButton)

      await waitFor(() => {
        expect(notify.success).toHaveBeenCalledWith('Đã xóa loại vé')
      })
    })

    it('should show warning notification for 404 error', async () => {
      mockDispatch.mockRejectedValueOnce({ status: 404 })
      const { notify } = require('../../../../../utils/notify')
      mockTicketTypeState.ticketTypes = mockTickets
      render(<TicketTypeModal {...defaultProps} />)

      const ticketRow = screen.getByText('VIP')?.parentElement
      const deleteButton = within(ticketRow as HTMLElement).getAllByRole('button')[1]
      await userEvent.click(deleteButton)

      await waitFor(() => {
        expect(notify.warning).toHaveBeenCalledWith('Loại vé này không tồn tại')
      })
    })

    it('should show error notification for other errors', async () => {
      mockDispatch.mockRejectedValueOnce(new Error('Failed'))
      const { notify } = require('../../../../../utils/notify')
      mockTicketTypeState.ticketTypes = mockTickets
      render(<TicketTypeModal {...defaultProps} />)

      const ticketRow = screen.getByText('VIP')?.parentElement
      const deleteButton = within(ticketRow as HTMLElement).getAllByRole('button')[1]
      await userEvent.click(deleteButton)

      await waitFor(() => {
        expect(notify.error).toHaveBeenCalledWith('Không thể xóa loại vé')
      })
    })
  })

  describe('User Interactions - Modal', () => {
    it('should call onClose when clicking close button', async () => {
      render(<TicketTypeModal {...defaultProps} />)
      const closeButton = screen.getByRole('button')
      await userEvent.click(closeButton)
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should call onClose when clicking overlay', async () => {
      render(<TicketTypeModal {...defaultProps} />)
      const overlay = screen.getByText('Quản lý loại vé').closest('.fixed')
      await userEvent.click(overlay!)
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should not close when clicking modal content', async () => {
      render(<TicketTypeModal {...defaultProps} />)
      const content = screen.getByText('Quản lý loại vé')
      await userEvent.click(content)
      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })
  })

  describe('Disabled State', () => {
    it('should disable add button when isAllowUpdate is false', () => {
      render(<TicketTypeModal {...defaultProps} isAllowUpdate={false} />)
      const addButton = screen.getByText('Thêm loại vé mới')
      expect(addButton).toBeDisabled()
    })

    it('should disable edit and delete buttons when isAllowUpdate is false', () => {
      mockTicketTypeState.ticketTypes = mockTickets
      render(<TicketTypeModal {...defaultProps} isAllowUpdate={false} />)

      const ticketRow = screen.getByText('VIP')?.parentElement
      const buttons = within(ticketRow as HTMLElement).getAllByRole('button')
      buttons.forEach(btn => {
        expect(btn).toBeDisabled()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty ticketTypes array', () => {
      mockTicketTypeState.ticketTypes = []
      render(<TicketTypeModal {...defaultProps} />)
      expect(screen.getByText('Chưa có loại vé nào')).toBeInTheDocument()
    })

    it('should handle non-array ticketTypes', () => {
      mockTicketTypeState.ticketTypes = null
      render(<TicketTypeModal {...defaultProps} />)
      expect(screen.getByText('Chưa có loại vé mới')).toBeInTheDocument()
    })

    it('should handle tickets without areaName', () => {
      const ticketsWithoutArea: TicketTypeItem[] = [
        { id: 'ticket-1', name: 'No Area', price: 100000, quantity: 50, soldQuantity: 10, remainingQuantity: 40, areaId: '', areaName: '', areaType: 'Zone' },
      ]
      mockTicketTypeState.ticketTypes = ticketsWithoutArea
      render(<TicketTypeModal {...defaultProps} />)
      expect(screen.getByText('No Area')).toBeInTheDocument()
    })

    it('should handle FREE tickets (price = 0)', () => {
      const freeTickets: TicketTypeItem[] = [
        { id: 'ticket-free', name: 'Free Ticket', price: 0, quantity: 100, soldQuantity: 0, remainingQuantity: 100, areaId: '', areaName: '', areaType: 'Zone' },
      ]
      mockTicketTypeState.ticketTypes = freeTickets
      render(<TicketTypeModal {...defaultProps} />)
      expect(screen.getByText('FREE')).toBeInTheDocument()
    })

    it('should format large quantities with Vietnamese locale', () => {
      const largeTickets: TicketTypeItem[] = [
        { id: 'ticket-1', name: 'Large Qty', price: 100000, quantity: 10000, soldQuantity: 5000, remainingQuantity: 5000, areaId: '', areaName: '', areaType: 'Zone' },
      ]
      mockTicketTypeState.ticketTypes = largeTickets
      render(<TicketTypeModal {...defaultProps} />)
      expect(screen.getByText('10.000 vé')).toBeInTheDocument()
    })
  })
})
