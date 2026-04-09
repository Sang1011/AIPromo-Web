/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import VoucherManagementPage from '../../../pages/Organizer/VoucherManagementPage'

// ============================================================================
// MOCKS
// ============================================================================

// Mock react-router-dom
const mockUseParams = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
}))

// Mock react-icons
jest.mock('react-icons/fi', () => ({
  FiDownload: () => <div data-testid="fi-download" />,
  FiEdit2: () => <div data-testid="fi-edit" />,
  FiPlus: () => <div data-testid="fi-plus" />,
  FiSearch: () => <div data-testid="fi-search" />,
  FiSliders: () => <div data-testid="fi-sliders" />,
  FiTrash2: () => <div data-testid="fi-trash" />,
  FiX: () => <div data-testid="fi-x" />,
}))

// Mock Redux
const mockDispatch = jest.fn()
let mockVoucherState: any = {}
let mockAuthState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    VOUCHER: mockVoucherState,
    AUTH: mockAuthState,
  }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../../store/voucherSlice', () => ({
  fetchGetVouchers: jest.fn((params) => ({ type: 'VOUCHER/fetchGetVouchers', payload: params })),
  fetchCreateVoucher: jest.fn((data) => ({ type: 'VOUCHER/fetchCreateVoucher', payload: data })),
  fetchUpdateVoucher: jest.fn((params) => ({ type: 'VOUCHER/fetchUpdateVoucher', payload: params })),
  fetchDeleteVoucher: jest.fn((voucherId) => ({ type: 'VOUCHER/fetchDeleteVoucher', payload: voucherId })),
  fetchExportExcelVoucher: jest.fn((eventId) => ({ type: 'VOUCHER/fetchExportExcelVoucher', payload: eventId })),
}))

jest.mock('../../../store/authSlice', () => ({
  fetchMe: jest.fn(() => ({ type: 'AUTH/fetchMe' })),
}))

// Mock hooks
jest.mock('../../../hooks/useEventTitle', () => ({
  useEventTitle: jest.fn(() => 'Test Event'),
}))

// Mock utils
jest.mock('../../../utils/notify', () => ({
  notify: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}))

jest.mock('../../../utils/downloadFileExcel', () => ({
  downloadFileExcel: jest.fn(),
}))

jest.mock('../../../utils/getCurrentDateTime', () => ({
  getCurrentDateTime: jest.fn(() => ({
    iso: '2024-12-01T10:00:00Z',
    formatted: '2024-12-01_10-00-00',
  })),
}))

jest.mock('../../../utils/saveReportToFirebase', () => ({
  saveReportToFirebase: jest.fn().mockResolvedValue(undefined),
}))

// Mock DateTimeInput component
jest.mock('../../../components/Organizer/shared/DateTimeInput', () => ({
  __esModule: true,
  default: ({ label, value, onChange, min }: any) => (
    <div data-testid="datetime-input">
      <label>{label}</label>
      <input
        data-testid="datetime-field"
        type="datetime-local"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        min={min}
      />
    </div>
  ),
}))

// Mock Pagination component
jest.mock('../../../components/Organizer/shared/Pagination', () => ({
  __esModule: true,
  default: ({ currentPage, totalPages, onPageChange }: any) => (
    <div data-testid="pagination">
      <span data-testid="current-page">{currentPage}</span>
      <span data-testid="total-pages">{totalPages}</span>
      <button data-testid="page-next" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
        Next
      </button>
    </div>
  ),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockVoucher = (overrides = {}) => {
  const now = new Date()
  const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()

  return {
    id: 'voucher-1',
    couponCode: 'SUMMER2024',
    type: 'Percentage' as const,
    value: 20,
    maxUse: 100,
    totalUse: 25,
    startDate,
    endDate,
    eventId: 'event-1',
    ...overrides,
  }
}

const createMockVouchersResponse = (overrides = {}) => ({
  items: [],
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 1,
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('VoucherManagementPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseParams.mockReturnValue({ eventId: 'event-1' })

    mockVoucherState = {
      vouchers: createMockVouchersResponse(),
      loading: false,
    }

    mockAuthState = {
      currentUser: null,
    }

    mockDispatch.mockResolvedValue({})
  })

  // --------------------------------------------------------------------------
  // 1. Render
  // --------------------------------------------------------------------------
  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<VoucherManagementPage />)
      })

      expect(screen.getByText('Quản lý mã giảm giá')).toBeInTheDocument()
    })

    it('should show loading state', async () => {
      mockVoucherState.loading = true

      render(<VoucherManagementPage />)

      expect(screen.getByText('Đang tải...')).toBeInTheDocument()
    })

    it('should show empty state when no vouchers', async () => {
      mockVoucherState.vouchers = createMockVouchersResponse({ items: [] })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      expect(screen.getByText('Không tìm thấy voucher nào')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 2. UI Elements
  // --------------------------------------------------------------------------
  describe('UI Elements', () => {
    it('should render voucher count badge', async () => {
      mockVoucherState.vouchers = createMockVouchersResponse({
        items: [createMockVoucher(), createMockVoucher()],
        totalCount: 2,
      })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      expect(screen.getByText('2 voucher')).toBeInTheDocument()
    })

    it('should render search input', async () => {
      await act(async () => {
        render(<VoucherManagementPage />)
      })

      expect(screen.getByPlaceholderText('Tìm kiếm theo mã voucher...')).toBeInTheDocument()
    })

    it('should render filter button', async () => {
      await act(async () => {
        render(<VoucherManagementPage />)
      })

      expect(screen.getByText('Bộ lọc')).toBeInTheDocument()
    })

    it('should render export Excel button', async () => {
      await act(async () => {
        render(<VoucherManagementPage />)
      })

      expect(screen.getByText('Xuất Excel')).toBeInTheDocument()
    })

    it('should render create voucher button', async () => {
      await act(async () => {
        render(<VoucherManagementPage />)
      })

      expect(screen.getByText('Tạo Voucher mới')).toBeInTheDocument()
    })

    it('should render table headers', async () => {
      await act(async () => {
        render(<VoucherManagementPage />)
      })

      expect(screen.getByText('Mã voucher')).toBeInTheDocument()
      expect(screen.getByText('Loại')).toBeInTheDocument()
      expect(screen.getByText('Giảm giá')).toBeInTheDocument()
      expect(screen.getByText('Số lượng')).toBeInTheDocument()
      expect(screen.getByText('Đã dùng')).toBeInTheDocument()
      expect(screen.getByText('Trạng thái')).toBeInTheDocument()
      expect(screen.getByText('Thao tác')).toBeInTheDocument()
    })

    it('should show filter dropdown when clicking filter button', async () => {
      await act(async () => {
        render(<VoucherManagementPage />)
      })

      await userEvent.click(screen.getByText('Bộ lọc'))

      expect(screen.getByText('Tất cả')).toBeInTheDocument()
      expect(screen.getByText('Đang chạy')).toBeInTheDocument()
      expect(screen.getByText('Hết hạn')).toBeInTheDocument()
      expect(screen.getByText('Hết lượt')).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 3. API Calls
  // --------------------------------------------------------------------------
  describe('API Calls', () => {
    it('should call fetchGetVouchers on mount', async () => {
      const { fetchGetVouchers } = require('../../../store/voucherSlice')

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchGetVouchers({ PageNumber: 1, PageSize: 10, EventId: 'event-1' })
        )
      })
    })

    it('should call fetchCreateVoucher when creating voucher', async () => {
      const { fetchCreateVoucher } = require('../../../store/voucherSlice')

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      await userEvent.click(screen.getByText('Tạo Voucher mới'))

      // Fill form
      const codeInput = screen.getByPlaceholderText('VD: SUMMER2026')
      await userEvent.type(codeInput, 'NEWCODE')

      // Fill value
      const valueInputs = screen.getAllByRole('textbox')
      const valueInput = valueInputs.find((input) => input.getAttribute('placeholder') === '0')
      if (valueInput) {
        await userEvent.type(valueInput, '10')
      }

      // Fill both date fields with future dates
      const datetimeInputs = screen.getAllByTestId('datetime-field')
      if (datetimeInputs.length >= 2) {
        const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        const formattedDate = futureDate.toISOString().slice(0, 16)
        await userEvent.clear(datetimeInputs[0])
        await userEvent.type(datetimeInputs[0], formattedDate)
        await userEvent.clear(datetimeInputs[1])
        await userEvent.type(datetimeInputs[1], formattedDate)
      }

      // Submit
      const saveBtn = screen.getByText('Tạo voucher')
      await userEvent.click(saveBtn)

      await waitFor(() => {
        // First dispatch is fetchGetVouchers on mount, second is fetchCreateVoucher on submit
        expect(mockDispatch).toHaveBeenNthCalledWith(
          2,
          fetchCreateVoucher(expect.objectContaining({ couponCode: 'NEWCODE' }))
        )
      })
    })

    it('should call fetchDeleteVoucher when deleting voucher', async () => {
      const { fetchDeleteVoucher } = require('../../../store/voucherSlice')
      mockVoucherState.vouchers = createMockVouchersResponse({
        items: [createMockVoucher()],
      })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      const deleteBtns = screen.getAllByTestId('fi-trash')
      await userEvent.click(deleteBtns[0].parentElement!)

      const confirmBtn = screen.getByText('Xóa')
      await userEvent.click(confirmBtn)

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchDeleteVoucher('voucher-1'))
      })
    })

    it('should call fetchExportExcelVoucher when exporting', async () => {
      const { fetchExportExcelVoucher } = require('../../../store/voucherSlice')
      const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      mockDispatch.mockResolvedValue(mockBlob)

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      const exportBtn = screen.getByText('Xuất Excel')
      await userEvent.click(exportBtn)

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchExportExcelVoucher('event-1'))
      })
    })
  })

  // --------------------------------------------------------------------------
  // 4. User Interactions
  // --------------------------------------------------------------------------
  describe('User Interactions', () => {
    it('should filter vouchers by search query', async () => {
      mockVoucherState.vouchers = createMockVouchersResponse({
        items: [
          createMockVoucher({ id: '1', couponCode: 'SUMMER2024' }),
          createMockVoucher({ id: '2', couponCode: 'WINTER2024' }),
        ],
        totalCount: 2,
      })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      const searchInput = screen.getByPlaceholderText('Tìm kiếm theo mã voucher...')
      await userEvent.type(searchInput, 'SUMMER')

      await waitFor(() => {
        expect(screen.getByText('SUMMER2024')).toBeInTheDocument()
        expect(screen.queryByText('WINTER2024')).not.toBeInTheDocument()
      })
    })

    it('should filter vouchers by status', async () => {
      const now = new Date()
      const expiredVoucher = createMockVoucher({
        id: '1',
        couponCode: 'EXPIRED',
        endDate: new Date(now.getTime() - 1000).toISOString(),
      })
      const runningVoucher = createMockVoucher({
        id: '2',
        couponCode: 'RUNNING',
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })

      mockVoucherState.vouchers = createMockVouchersResponse({
        items: [expiredVoucher, runningVoucher],
        totalCount: 2,
      })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      // Open filter and select expired
      await userEvent.click(screen.getByText('Bộ lọc'))
      // Use getAllByText to pick the first match (the dropdown button, not the badge)
      const expiredBtns = screen.getAllByText('Hết hạn')
      await userEvent.click(expiredBtns[0])

      expect(screen.queryByText('RUNNING')).not.toBeInTheDocument()
    })

    it('should open create modal when clicking create button', async () => {
      await act(async () => {
        render(<VoucherManagementPage />)
      })

      await userEvent.click(screen.getByText('Tạo Voucher mới'))

      expect(screen.getByText('Tạo voucher mới')).toBeInTheDocument()
    })

    it('should close create modal when clicking cancel', async () => {
      await act(async () => {
        render(<VoucherManagementPage />)
      })

      await userEvent.click(screen.getByText('Tạo Voucher mới'))
      await userEvent.click(screen.getByText('Hủy'))

      expect(screen.queryByText('Tạo voucher mới')).not.toBeInTheDocument()
    })

    it('should open edit modal when clicking edit button', async () => {
      mockVoucherState.vouchers = createMockVouchersResponse({
        items: [createMockVoucher()],
      })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      const editBtns = screen.getAllByTestId('fi-edit')
      await userEvent.click(editBtns[0].parentElement!)

      expect(screen.getByText('Chỉnh sửa voucher')).toBeInTheDocument()
    })

    it('should open delete confirmation when clicking delete button', async () => {
      mockVoucherState.vouchers = createMockVouchersResponse({
        items: [createMockVoucher({ couponCode: 'TESTCODE' })],
      })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      const deleteBtns = screen.getAllByTestId('fi-trash')
      await userEvent.click(deleteBtns[0].parentElement!)

      expect(screen.getByText('Xác nhận xóa')).toBeInTheDocument()
      // Use getAllByText to handle duplicate matches (table row + dialog)
      const codeEls = screen.getAllByText('TESTCODE')
      expect(codeEls.length).toBeGreaterThan(0)
    })

    it('should close delete confirmation when clicking cancel', async () => {
      mockVoucherState.vouchers = createMockVouchersResponse({
        items: [createMockVoucher()],
      })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      const deleteBtns = screen.getAllByTestId('fi-trash')
      await userEvent.click(deleteBtns[0].parentElement!)

      await userEvent.click(screen.getByText('Hủy'))
      expect(screen.queryByText('Xác nhận xóa')).not.toBeInTheDocument()
    })

    it('should validate voucher code format', async () => {
      await act(async () => {
        render(<VoucherManagementPage />)
      })

      await userEvent.click(screen.getByText('Tạo Voucher mới'))

      const codeInput = screen.getByPlaceholderText('VD: SUMMER2026')
      await userEvent.type(codeInput, 'invalid code!')

      const saveBtn = screen.getByText('Tạo voucher')
      await userEvent.click(saveBtn)

      expect(screen.getByText('Mã chỉ gồm chữ in hoa, số, - hoặc _ (3–30 ký tự)')).toBeInTheDocument()
    })

    it('should validate value is positive', async () => {
      await act(async () => {
        render(<VoucherManagementPage />)
      })

      await userEvent.click(screen.getByText('Tạo Voucher mới'))

      const codeInput = screen.getByPlaceholderText('VD: SUMMER2026')
      await userEvent.type(codeInput, 'VALID')

      const saveBtn = screen.getByText('Tạo voucher')
      await userEvent.click(saveBtn)

      expect(screen.getByText('Giá trị giảm phải lớn hơn 0')).toBeInTheDocument()
    })

    it('should validate percentage value <= 100', async () => {
      await act(async () => {
        render(<VoucherManagementPage />)
      })

      await userEvent.click(screen.getByText('Tạo Voucher mới'))

      const codeInput = screen.getByPlaceholderText('VD: SUMMER2026')
      await userEvent.type(codeInput, 'VALID')

      const valueInputs = screen.getAllByRole('textbox')
      const valueInput = valueInputs.find((input) => input.getAttribute('placeholder') === '0')
      if (valueInput) {
        await userEvent.clear(valueInput)
        await userEvent.type(valueInput, '150')
      }

      const saveBtn = screen.getByText('Tạo voucher')
      await userEvent.click(saveBtn)

      expect(screen.getByText('Phần trăm không được vượt quá 100')).toBeInTheDocument()
    })

    it('should change voucher type between Percentage and Fixed', async () => {
      await act(async () => {
        render(<VoucherManagementPage />)
      })

      await userEvent.click(screen.getByText('Tạo Voucher mới'))

      const typeSelect = screen.getByRole('combobox')
      expect(typeSelect).toHaveValue('Percentage')

      await userEvent.selectOptions(typeSelect, 'Fixed')
      expect(typeSelect).toHaveValue('Fixed')
    })
  })

  // --------------------------------------------------------------------------
  // 5. Data Display
  // --------------------------------------------------------------------------
  describe('Data Display', () => {
    it('should display voucher details correctly', async () => {
      mockVoucherState.vouchers = createMockVouchersResponse({
        items: [createMockVoucher({ couponCode: 'TEST10', value: 10 })],
        totalCount: 1,
      })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      expect(screen.getByText('TEST10')).toBeInTheDocument()
      expect(screen.getByText('10%')).toBeInTheDocument()
      expect(screen.getByText('Đang chạy')).toBeInTheDocument()
    })

    it('should display fixed amount vouchers correctly', async () => {
      mockVoucherState.vouchers = createMockVouchersResponse({
        items: [createMockVoucher({ type: 'Fixed', value: 50000, couponCode: 'FIXED50K' })],
        totalCount: 1,
      })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      expect(screen.getByText('FIXED50K')).toBeInTheDocument()
      expect(screen.getByText('50.000đ')).toBeInTheDocument()
    })

    it('should display infinite symbol for unlimited vouchers', async () => {
      mockVoucherState.vouchers = createMockVouchersResponse({
        items: [createMockVoucher({ maxUse: 0 })],
        totalCount: 1,
      })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      expect(screen.getByText('∞')).toBeInTheDocument()
    })

    it('should display expired status for past vouchers', async () => {
      const now = new Date()
      mockVoucherState.vouchers = createMockVouchersResponse({
        items: [createMockVoucher({
          endDate: new Date(now.getTime() - 1000).toISOString(),
          couponCode: 'EXPIRED',
        })],
        totalCount: 1,
      })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      expect(screen.getByText('Hết hạn')).toBeInTheDocument()
    })

    it('should display maxed status for fully used vouchers', async () => {
      mockVoucherState.vouchers = createMockVouchersResponse({
        items: [createMockVoucher({ maxUse: 10, totalUse: 10, couponCode: 'MAXED' })],
        totalCount: 1,
      })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      expect(screen.getByText('Hết lượt')).toBeInTheDocument()
    })

    it('should display filter status badge when filtered', async () => {
      await act(async () => {
        render(<VoucherManagementPage />)
      })

      await userEvent.click(screen.getByText('Bộ lọc'))
      await userEvent.click(screen.getByText('Đang chạy'))

      expect(screen.getByText('lọc: Đang chạy')).toBeInTheDocument()
    })

    it('should display date range for each voucher', async () => {
      const voucher = createMockVoucher({
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
      })
      mockVoucherState.vouchers = createMockVouchersResponse({
        items: [voucher],
        totalCount: 1,
      })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      // Dates should be formatted (no leading zeros from toLocaleDateString)
      expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 6. Edge Cases
  // --------------------------------------------------------------------------
  describe('Edge Cases', () => {
    it('should handle vouchers with null dates', async () => {
      mockVoucherState.vouchers = createMockVouchersResponse({
        items: [createMockVoucher({ startDate: null as any, endDate: null as any })],
        totalCount: 1,
      })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      // Should render without crashing
      expect(screen.getByText('SUMMER2024')).toBeInTheDocument()
    })

    it('should handle export failure', async () => {
      // Component uses dispatch().unwrap().catch(), so mock with unwrap returning rejected promise
      mockDispatch.mockReturnValue({ unwrap: () => Promise.reject(new Error('Export failed')) })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      const exportBtn = screen.getByText('Xuất Excel')
      await userEvent.click(exportBtn)

      const { notify } = require('../../../utils/notify')
      await waitFor(() => {
        expect(notify.error).toHaveBeenCalledWith('Xuất Excel thất bại')
      })
    })

    it('should handle delete failure for used vouchers', async () => {
      mockVoucherState.vouchers = createMockVouchersResponse({
        items: [createMockVoucher()],
      })

      // Mock delete to fail with "used" message - component uses dispatch().unwrap()
      mockDispatch.mockReturnValue({ unwrap: () => Promise.reject({ message: 'Voucher already used' }) })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      const deleteBtns = screen.getAllByTestId('fi-trash')
      await userEvent.click(deleteBtns[0].parentElement!)

      const confirmBtn = screen.getByText('Xóa')
      await userEvent.click(confirmBtn)

      const { notify } = require('../../../utils/notify')
      await waitFor(() => {
        expect(notify.error).toHaveBeenCalledWith('Voucher đã được sử dụng, không thể xóa')
      })
    })

    it('should handle duplicate voucher code error', async () => {
      // Component uses dispatch().unwrap()
      mockDispatch.mockReturnValue({ unwrap: () => Promise.reject({ message: 'Duplicate voucher code' }) })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      await userEvent.click(screen.getByText('Tạo Voucher mới'))

      const codeInput = screen.getByPlaceholderText('VD: SUMMER2026')
      await userEvent.type(codeInput, 'DUPLICATE')

      // Fill value
      const valueInputs = screen.getAllByRole('textbox')
      const valueInput = valueInputs.find((input) => input.getAttribute('placeholder') === '0')
      if (valueInput) {
        await userEvent.type(valueInput, '10')
      }

      // Fill both date fields with future dates
      const datetimeInputs = screen.getAllByTestId('datetime-field')
      if (datetimeInputs.length >= 2) {
        const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        const formattedDate = futureDate.toISOString().slice(0, 16)
        await userEvent.clear(datetimeInputs[0])
        await userEvent.type(datetimeInputs[0], formattedDate)
        await userEvent.clear(datetimeInputs[1])
        await userEvent.type(datetimeInputs[1], formattedDate)
      }

      const saveBtn = screen.getByText('Tạo voucher')
      await userEvent.click(saveBtn)

      const { notify } = require('../../../utils/notify')
      await waitFor(() => {
        expect(notify.error).toHaveBeenCalledWith('Mã voucher đã tồn tại, vui lòng chọn mã khác')
      })
    })

    it('should handle case-insensitive search', async () => {
      mockVoucherState.vouchers = createMockVouchersResponse({
        items: [createMockVoucher({ couponCode: 'SUMMER2024' })],
        totalCount: 1,
      })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      const searchInput = screen.getByPlaceholderText('Tìm kiếm theo mã voucher...')
      await userEvent.type(searchInput, 'summer')

      await waitFor(() => {
        expect(screen.getByText('SUMMER2024')).toBeInTheDocument()
      })
    })

    it('should reload vouchers after successful creation', async () => {
      const { fetchGetVouchers } = require('../../../store/voucherSlice')
      mockVoucherState.vouchers = createMockVouchersResponse({ items: [] })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      // Clear initial mount dispatch calls
      mockDispatch.mockClear()
      // Mock dispatch to resolve create action (component uses dispatch().unwrap())
      mockDispatch.mockReturnValue({ unwrap: () => Promise.resolve({}) })

      await userEvent.click(screen.getByText('Tạo Voucher mới'))

      const codeInput = screen.getByPlaceholderText('VD: SUMMER2026')
      await userEvent.type(codeInput, 'NEWCODE')

      // Fill dates - find datetime inputs
      const datetimeInputs = screen.getAllByTestId('datetime-field')
      if (datetimeInputs.length >= 2) {
        const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        const formattedDate = futureDate.toISOString().slice(0, 16)
        await userEvent.clear(datetimeInputs[0])
        await userEvent.type(datetimeInputs[0], formattedDate)
        await userEvent.clear(datetimeInputs[1])
        await userEvent.type(datetimeInputs[1], formattedDate)
      }

      const valueInputs = screen.getAllByRole('textbox')
      const valueInput = valueInputs.find((input) => input.getAttribute('placeholder') === '0')
      if (valueInput) {
        await userEvent.clear(valueInput)
        await userEvent.type(valueInput, '10')
      }

      const saveBtn = screen.getByText('Tạo voucher')
      await userEvent.click(saveBtn)

      // After successful creation, component calls onSaved() which dispatches fetchGetVouchers
      // First dispatch is fetchCreateVoucher, second is fetchGetVouchers (reload)
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenNthCalledWith(
          2,
          fetchGetVouchers(expect.any(Object))
        )
      })
    })

    it('should handle pagination page change', async () => {
      const { fetchGetVouchers } = require('../../../store/voucherSlice')
      mockVoucherState.vouchers = createMockVouchersResponse({
        pageNumber: 1,
        totalPages: 3,
        totalCount: 30,
        items: [createMockVoucher()],
      })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      // Clear initial mount dispatch
      mockDispatch.mockClear()

      await userEvent.click(screen.getByTestId('page-next'))

      // Clicking Next should dispatch fetchGetVouchers with PageNumber: 2
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchGetVouchers(expect.objectContaining({ PageNumber: 2 }))
        )
      })
    })

    it('should handle vouchers with maxUse = 0 (unlimited)', async () => {
      mockVoucherState.vouchers = createMockVouchersResponse({
        items: [createMockVoucher({ maxUse: 0, totalUse: 500 })],
        totalCount: 1,
      })

      await act(async () => {
        render(<VoucherManagementPage />)
      })

      expect(screen.getByText('∞')).toBeInTheDocument()
      expect(screen.getByText('500')).toBeInTheDocument()
    })
  })
})
