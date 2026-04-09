/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import OrderList from '../../../../../components/Organizer/orders/OrderList'

// Mock Redux
const mockDispatch = jest.fn()
let mockTicketingState: any = {}
let mockAuthState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    TICKETING: mockTicketingState,
    AUTH: mockAuthState,
  }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../../../../store/orderSlice', () => ({
  fetchExportExcelOrder: jest.fn((eventId) => ({ type: 'ORDER/export', payload: eventId })),
}))

jest.mock('../../../../../store/ticketingSlice', () => ({
  fetchOrdersByOrganizer: jest.fn((params) => ({ type: 'TICKETING/fetchOrders', payload: params })),
}))

jest.mock('../../../../../store/authSlice', () => ({
  fetchMe: jest.fn(() => ({ type: 'AUTH/fetchMe' })),
}))

// Mock hooks
jest.mock('../../../../../hooks/useEventTitle', () => ({
  useEventTitle: jest.fn(() => 'Test Event'),
}))

// Mock utils
jest.mock('../../../../../utils/notify', () => ({
  notify: { success: jest.fn(), error: jest.fn() },
}))

jest.mock('../../../../../utils/downloadFileExcel', () => ({
  downloadFileExcel: jest.fn(),
}))

jest.mock('../../../../../utils/saveReportToFirebase', () => ({
  saveReportToFirebase: jest.fn(),
}))

jest.mock('../../../../../utils/getCurrentDateTime', () => ({
  getCurrentDateTime: jest.fn(() => ({ iso: '2024-12-01T10:00:00Z', formatted: '01-12-2024_10-00' })),
}))

jest.mock('../../../../../utils/fmtMoneyVND', () => ({
  fmtMoneyVND: (n: number) => n.toLocaleString('vi-VN'),
}))

// Mock child components
jest.mock('../../../../../components/Organizer/orders/OrdersTable', () => ({
  __esModule: true,
  default: ({ orders }: { orders: any[] }) => (
    <div data-testid="orders-table">
      <span data-testid="order-count">{orders.length}</span>
    </div>
  ),
}))

jest.mock('../../../../../components/Organizer/shared/Pagination', () => ({
  __esModule: true,
  default: ({ currentPage, totalPages, onPageChange }: any) => (
    <div data-testid="pagination">
      <span data-testid="current-page">{currentPage}</span>
      <span data-testid="total-pages">{totalPages}</span>
      <button data-testid="page-2" onClick={() => onPageChange(2)}>Page 2</button>
    </div>
  ),
}))

describe('OrderList', () => {
  const mockOrders = [
    {
      orderId: 'ORD-001',
      createdAt: '2024-12-01T10:00:00Z',
      buyerName: 'John Doe',
      buyerEmail: 'john@example.com',
      originalPrice: 500000,
      discountAmount: 50000,
      voucherCode: 'SAVE10',
      totalPrice: 450000,
      status: 'paid',
    },
    {
      orderId: 'ORD-002',
      createdAt: '2024-12-01T11:00:00Z',
      buyerName: 'Jane Smith',
      buyerEmail: 'jane@example.com',
      originalPrice: 200000,
      discountAmount: 0,
      voucherCode: '',
      totalPrice: 200000,
      status: 'pending',
    },
    {
      orderId: 'ORD-003',
      createdAt: '2024-12-01T12:00:00Z',
      buyerName: 'Bob Wilson',
      buyerEmail: 'bob@example.com',
      originalPrice: 300000,
      discountAmount: 30000,
      voucherCode: 'DISCOUNT',
      totalPrice: 270000,
      status: 'cancelled',
    },
  ]

  const defaultProps = { eventId: 'event-123' }

  beforeEach(() => {
    jest.clearAllMocks()
    mockTicketingState = {
      orders: mockOrders,
      pagination: {
        pageNumber: 1,
        pageSize: 5,
        totalCount: 3,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
      },
      loading: false,
    }
    mockAuthState = { currentInfor: { roles: ['Organizer'] } }
    mockDispatch.mockResolvedValue({})
  })

  describe('Render', () => {
    it('should render page title', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      expect(screen.getByText('Danh sách đơn hàng')).toBeInTheDocument()
    })

    it('should render "Đơn hàng" badge', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      expect(screen.getByText('Đơn hàng')).toBeInTheDocument()
    })

    it('should render Export Excel button', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      expect(screen.getByText('Xuất Excel')).toBeInTheDocument()
    })

    it('should render 4 summary cards', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      expect(screen.getByText('Tổng đơn hàng')).toBeInTheDocument()
      expect(screen.getByText('Doanh thu (hoàn thành)')).toBeInTheDocument()
      expect(screen.getByText('Tổng giảm giá')).toBeInTheDocument()
      expect(screen.getByText('Đơn đã huỷ')).toBeInTheDocument()
    })

    it('should render search input', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      expect(screen.getByPlaceholderText('Tìm theo tên, email...')).toBeInTheDocument()
    })

    it('should render status filter tabs', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      expect(screen.getByText('Tất cả')).toBeInTheDocument()
      expect(screen.getByText('Chờ xử lý')).toBeInTheDocument()
      expect(screen.getByText('Hoàn thành')).toBeInTheDocument()
      expect(screen.getByText('Đã huỷ')).toBeInTheDocument()
    })

    it('should render orders table', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      expect(screen.getByTestId('orders-table')).toBeInTheDocument()
    })

    it('should render pagination', async () => {
      mockTicketingState.pagination.totalPages = 2
      await act(async () => render(<OrderList {...defaultProps} />))
      expect(screen.getByTestId('pagination')).toBeInTheDocument()
    })
  })

  describe('Summary Cards', () => {
    it('should display correct total orders count', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should calculate revenue from paid orders only', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      // Only ORD-001 is paid with totalPrice 450000
      expect(screen.getByText('450.000')).toBeInTheDocument()
    })

    it('should calculate total discount from all orders', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      // 50000 + 0 + 30000 = 80000
      expect(screen.getByText('80.000')).toBeInTheDocument()
    })

    it('should count cancelled orders', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('should filter orders by buyer name', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      const searchInput = screen.getByPlaceholderText('Tìm theo tên, email...')
      await userEvent.type(searchInput, 'John')

      await waitFor(() => {
        expect(screen.getByTestId('order-count')).toHaveTextContent('1')
      })
    })

    it('should filter orders by email', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      const searchInput = screen.getByPlaceholderText('Tìm theo tên, email...')
      await userEvent.type(searchInput, 'jane')

      await waitFor(() => {
        expect(screen.getByTestId('order-count')).toHaveTextContent('1')
      })
    })

    it('should show all orders when search is cleared', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      const searchInput = screen.getByPlaceholderText('Tìm theo tên, email...')
      await userEvent.type(searchInput, 'John')
      await userEvent.clear(searchInput)

      await waitFor(() => {
        expect(screen.getByTestId('order-count')).toHaveTextContent('3')
      })
    })

    it('should reset page to 1 when search changes', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      const searchInput = screen.getByPlaceholderText('Tìm theo tên, email...')
      await userEvent.type(searchInput, 'test')

      expect(screen.getByTestId('current-page')).toHaveTextContent('1')
    })
  })

  describe('Status Filter Tabs', () => {
    it('should highlight active tab', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      const allTab = screen.getByText('Tất cả')
      expect(allTab).toHaveClass('bg-violet-600')
    })

    it('should switch to pending tab', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      await userEvent.click(screen.getByText('Chờ xử lý'))
      expect(screen.getByText('Chờ xử lý')).toHaveClass('bg-violet-600')
    })

    it('should switch to paid tab', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      await userEvent.click(screen.getByText('Hoàn thành'))
      expect(screen.getByText('Hoàn thành')).toHaveClass('bg-violet-600')
    })

    it('should switch to cancelled tab', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      await userEvent.click(screen.getByText('Đã huỷ'))
      expect(screen.getByText('Đã huỷ')).toHaveClass('bg-violet-600')
    })

    it('should reset page to 1 when switching tabs', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      await userEvent.click(screen.getByText('Chờ xử lý'))
      expect(screen.getByTestId('current-page')).toHaveTextContent('1')
    })

    it('should fetch orders with correct status when switching tabs', async () => {
      const { fetchOrdersByOrganizer } = require('../../../../../store/ticketingSlice')

      await act(async () => render(<OrderList {...defaultProps} />))
      await userEvent.click(screen.getByText('Chờ xử lý'))

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchOrdersByOrganizer({
            eventId: 'event-123',
            status: 'pending',
            pageNumber: 1,
            pageSize: 5,
          })
        )
      })
    })
  })

  describe('API Calls', () => {
    it('should fetch orders on mount', async () => {
      const { fetchOrdersByOrganizer } = require('../../../../../store/ticketingSlice')

      await act(async () => render(<OrderList {...defaultProps} />))

      expect(mockDispatch).toHaveBeenCalledWith(
        fetchOrdersByOrganizer({
          eventId: 'event-123',
          status: undefined,
          pageNumber: 1,
          pageSize: 5,
        })
      )
    })

    it('should fetch orders when page changes', async () => {
      const { fetchOrdersByOrganizer } = require('../../../../../store/ticketingSlice')
      mockTicketingState.pagination.totalPages = 2

      await act(async () => render(<OrderList {...defaultProps} />))
      mockDispatch.mockClear()

      await userEvent.click(screen.getByTestId('page-2'))

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchOrdersByOrganizer({
            eventId: 'event-123',
            status: undefined,
            pageNumber: 2,
            pageSize: 5,
          })
        )
      })
    })
  })

  describe('Export Excel', () => {
    it('should call export when clicking button', async () => {
      const { fetchExportExcelOrder } = require('../../../../../store/orderSlice')
      mockDispatch.mockResolvedValue({ unwrap: () => Promise.resolve(new Blob(['test'])) })

      await act(async () => render(<OrderList {...defaultProps} />))
      await userEvent.click(screen.getByText('Xuất Excel'))

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchExportExcelOrder('event-123'))
      })
    })

    it('should show success notification after export', async () => {
      const { notify } = require('../../../../../utils/notify')
      mockDispatch.mockResolvedValue({ unwrap: () => Promise.resolve(new Blob(['test'])) })

      await act(async () => render(<OrderList {...defaultProps} />))
      await userEvent.click(screen.getByText('Xuất Excel'))

      await waitFor(() => {
        expect(notify.success).toHaveBeenCalledWith('Xuất Excel thành công')
      })
    })

    it('should show error notification when export fails', async () => {
      const { notify } = require('../../../../../utils/notify')
      mockDispatch.mockResolvedValue({ unwrap: () => Promise.reject(new Error('Failed')) })

      await act(async () => render(<OrderList {...defaultProps} />))
      await userEvent.click(screen.getByText('Xuất Excel'))

      await waitFor(() => {
        expect(notify.error).toHaveBeenCalledWith('Xuất Excel thất bại')
      })
    })
  })

  describe('Loading State', () => {
    it('should show loading message when fetching', async () => {
      mockTicketingState.loading = true

      await act(async () => render(<OrderList {...defaultProps} />))

      expect(screen.getByText('Đang tải...')).toBeInTheDocument()
    })

    it('should not show orders table when loading', async () => {
      mockTicketingState.loading = true

      await act(async () => render(<OrderList {...defaultProps} />))

      expect(screen.queryByTestId('orders-table')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty orders list', async () => {
      mockTicketingState.orders = []

      await act(async () => render(<OrderList {...defaultProps} />))

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle missing eventId', async () => {
      await act(async () => render(<OrderList eventId="" />))

      // Should not crash
      expect(screen.getByText('Danh sách đơn hàng')).toBeInTheDocument()
    })

    it('should handle search with no results', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      const searchInput = screen.getByPlaceholderText('Tìm theo tên, email...')
      await userEvent.type(searchInput, 'nonexistent')

      await waitFor(() => {
        expect(screen.getByTestId('order-count')).toHaveTextContent('0')
      })
    })

    it('should handle case-insensitive search', async () => {
      await act(async () => render(<OrderList {...defaultProps} />))
      const searchInput = screen.getByPlaceholderText('Tìm theo tên, email...')
      await userEvent.type(searchInput, 'JOHN')

      await waitFor(() => {
        expect(screen.getByTestId('order-count')).toHaveTextContent('1')
      })
    })
  })
})
