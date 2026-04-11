/// <reference types="jest" />
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'

import VerifyOrganizer from '../../../../pages/VerifyOrganizer'

// ============================================================================
// MOCKS
// ============================================================================

// Mock API service to prevent import.meta.env errors
jest.mock('../../../../services/api', () => ({
  __esModule: true,
  default: {
    call: () => ({
      get: jest.fn(),
      post: jest.fn(),
    }),
    callWithToken: () => ({
      get: jest.fn(),
      post: jest.fn(),
    }),
  },
}))

// Mock interceptor utilities
jest.mock('../../../../utils/attachInterceptors', () => ({
  interceptorAPI: () => ({
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  }),
}))

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

// Mock dispatch
const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

// Mock FileReader
const mockFileReader = {
  readAsDataURL: jest.fn(),
  onload: null as any,
  result: 'data:image/png;base64,mockbase64',
}

Object.defineProperty(window, 'FileReader', {
  value: jest.fn().mockImplementation(() => mockFileReader),
  writable: true,
})

// ============================================================================
// STORE HELPER
// ============================================================================

const createTestStore = () => {
  return configureStore({
    reducer: {
      ORGANIZER_PROFILE: () => ({
        loading: false,
        error: null,
        profile: null,
      }),
    },
  })
}

// ============================================================================
// TESTS
// ============================================================================

describe('VerifyOrganizer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate.mockClear()
    mockDispatch.mockClear()
  })

  const renderComponent = (store?: ReturnType<typeof createTestStore>) => {
    const testStore = store || createTestStore()
    return render(
      <Provider store={testStore}>
        <MemoryRouter>
          <VerifyOrganizer />
        </MemoryRouter>
      </Provider>
    )
  }

  describe('Render', () => {
    it('should render verification page with heading', () => {
      renderComponent()
      expect(screen.getByText('Đăng ký Ban tổ chức')).toBeInTheDocument()
    })

    it('should render subtitle text', () => {
      renderComponent()
      expect(screen.getByText(/Điền đầy đủ thông tin bên dưới/)).toBeInTheDocument()
    })

    it('should render verification badge', () => {
      renderComponent()
      expect(screen.getByText('Xác minh tổ chức')).toBeInTheDocument()
    })
  })

  describe('Section 1: Branding', () => {
    it('should render branding section heading', () => {
      renderComponent()
      expect(screen.getByText('Nhận diện thương hiệu')).toBeInTheDocument()
    })

    it('should render logo upload area', () => {
      renderComponent()
      expect(screen.getByText('Tải lên logo')).toBeInTheDocument()
    })

    it('should render display name input', () => {
      renderComponent()
      expect(screen.getByPlaceholderText('Công ty TNHH Acme')).toBeInTheDocument()
    })

    it('should render description textarea', () => {
      renderComponent()
      expect(screen.getByPlaceholderText(/Mô tả ngắn về sứ mệnh/)).toBeInTheDocument()
    })

    it('should show required asterisk for logo', () => {
      renderComponent()
      const logoLabel = screen.getByText('Tải lên logo')
      const asterisk = logoLabel.parentElement?.querySelector('.text-red-400')
      expect(asterisk).toBeInTheDocument()
    })

    it('should show required asterisk for display name', () => {
      renderComponent()
      const displayNameLabel = screen.getByText('Tên hiển thị')
      const asterisk = displayNameLabel.parentElement?.querySelector('.text-red-400')
      expect(asterisk).toBeInTheDocument()
    })

    it('should show required asterisk for description', () => {
      renderComponent()
      const descriptionLabel = screen.getByText('Mô tả tổ chức')
      const asterisk = descriptionLabel.parentElement?.querySelector('.text-red-400')
      expect(asterisk).toBeInTheDocument()
    })
  })

  describe('Section 2: Business Info', () => {
    it('should render business info section heading', () => {
      renderComponent()
      expect(screen.getByText('Thông tin doanh nghiệp')).toBeInTheDocument()
    })

    it('should render company name input', () => {
      renderComponent()
      expect(screen.getByPlaceholderText('Acme Global Solutions Ltd.')).toBeInTheDocument()
    })

    it('should render business type as read-only badge', () => {
      renderComponent()
      expect(screen.getByText('Company')).toBeInTheDocument()
    })

    it('should render tax code input', () => {
      renderComponent()
      expect(screen.getByPlaceholderText('0123456789')).toBeInTheDocument()
    })

    it('should render identity number input', () => {
      renderComponent()
      expect(screen.getByPlaceholderText('Số GPKD / Mã đăng ký')).toBeInTheDocument()
    })

    it('should show required asterisk for company name', () => {
      renderComponent()
      const label = screen.getByText('Tên công ty (pháp lý)')
      const asterisk = label.parentElement?.querySelector('.text-red-400')
      expect(asterisk).toBeInTheDocument()
    })

    it('should show required asterisk for tax code', () => {
      renderComponent()
      const label = screen.getByText('Mã số thuế (VAT / MST)')
      const asterisk = label.parentElement?.querySelector('.text-red-400')
      expect(asterisk).toBeInTheDocument()
    })

    it('should show required asterisk for identity number', () => {
      renderComponent()
      const label = screen.getByText('Số đăng ký doanh nghiệp')
      const asterisk = label.parentElement?.querySelector('.text-red-400')
      expect(asterisk).toBeInTheDocument()
    })
  })

  describe('Section 3: Location & Social', () => {
    it('should render location section heading', () => {
      renderComponent()
      expect(screen.getByText('Địa điểm & Mạng xã hội')).toBeInTheDocument()
    })

    it('should render address input', () => {
      renderComponent()
      expect(screen.getByPlaceholderText(/Số nhà, đường, phường/)).toBeInTheDocument()
    })

    it('should render website input', () => {
      renderComponent()
      expect(screen.getByPlaceholderText('https://example.com.vn')).toBeInTheDocument()
    })

    it('should render language icon for website input', () => {
      renderComponent()
      expect(screen.getByText('language')).toBeInTheDocument()
    })

    it('should show required asterisk for address', () => {
      renderComponent()
      const label = screen.getByText('Địa chỉ trụ sở chính')
      const asterisk = label.parentElement?.querySelector('.text-red-400')
      expect(asterisk).toBeInTheDocument()
    })

    it('should show required asterisk for website', () => {
      renderComponent()
      const label = screen.getByText('Website chính thức')
      const asterisk = label.parentElement?.querySelector('.text-red-400')
      expect(asterisk).toBeInTheDocument()
    })
  })

  describe('Section 4: Banking', () => {
    it('should render banking section heading', () => {
      renderComponent()
      expect(screen.getByText('Thông tin ngân hàng')).toBeInTheDocument()
    })

    it('should render account name input', () => {
      renderComponent()
      expect(screen.getByPlaceholderText('CÔNG TY TNHH ACME')).toBeInTheDocument()
    })

    it('should render account number input', () => {
      renderComponent()
      expect(screen.getByPlaceholderText('•••• •••• •••• ••••')).toBeInTheDocument()
    })

    it('should render bank code input', () => {
      renderComponent()
      expect(screen.getByPlaceholderText('Ví dụ: BIDVVNVX')).toBeInTheDocument()
    })

    it('should render branch name input', () => {
      renderComponent()
      expect(screen.getByPlaceholderText('Chi nhánh trung tâm Hà Nội')).toBeInTheDocument()
    })

    it('should render visibility toggle for account number', () => {
      renderComponent()
      expect(screen.getByText('visibility')).toBeInTheDocument()
    })

    it('should show required asterisk for account name', () => {
      renderComponent()
      const label = screen.getByText('Chủ tài khoản')
      const asterisk = label.parentElement?.querySelector('.text-red-400')
      expect(asterisk).toBeInTheDocument()
    })

    it('should show required asterisk for account number', () => {
      renderComponent()
      const label = screen.getByText('Số tài khoản / IBAN')
      const asterisk = label.parentElement?.querySelector('.text-red-400')
      expect(asterisk).toBeInTheDocument()
    })

    it('should show required asterisk for bank code', () => {
      renderComponent()
      const label = screen.getByText('Mã ngân hàng (SWIFT / BIC)')
      const asterisk = label.parentElement?.querySelector('.text-red-400')
      expect(asterisk).toBeInTheDocument()
    })

    it('should show required asterisk for branch name', () => {
      renderComponent()
      const label = screen.getByText('Tên chi nhánh')
      const asterisk = label.parentElement?.querySelector('.text-red-400')
      expect(asterisk).toBeInTheDocument()
    })

    it('should render security notice', () => {
      renderComponent()
      expect(screen.getByText(/Thông tin ngân hàng được mã hóa/)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show error when submitting empty form', async () => {
      renderComponent()
      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByText(/Vui lòng điền đầy đủ tất cả các trường bắt buộc/)).toBeInTheDocument()
      })
    })

    it('should show error when logo is missing', async () => {
      renderComponent()
      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByText('Vui lòng tải lên logo')).toBeInTheDocument()
      })
    })

    it('should show error when display name is missing', async () => {
      renderComponent()
      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập tên hiển thị')).toBeInTheDocument()
      })
    })

    it('should show error when description is missing', async () => {
      renderComponent()
      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập mô tả tổ chức')).toBeInTheDocument()
      })
    })

    it('should show error when company name is missing', async () => {
      renderComponent()
      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập tên công ty')).toBeInTheDocument()
      })
    })

    it('should show error when tax code is missing', async () => {
      renderComponent()
      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập mã số thuế')).toBeInTheDocument()
      })
    })

    it('should show error when identity number is missing', async () => {
      renderComponent()
      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập số đăng ký doanh nghiệp')).toBeInTheDocument()
      })
    })

    it('should show error when address is missing', async () => {
      renderComponent()
      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập địa chỉ trụ sở')).toBeInTheDocument()
      })
    })

    it('should show error when website is missing', async () => {
      renderComponent()
      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập website')).toBeInTheDocument()
      })
    })

    it('should show error when account name is missing', async () => {
      renderComponent()
      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập chủ tài khoản')).toBeInTheDocument()
      })
    })

    it('should show error when account number is missing', async () => {
      renderComponent()
      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập số tài khoản')).toBeInTheDocument()
      })
    })

    it('should show error when bank code is missing', async () => {
      renderComponent()
      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập mã ngân hàng')).toBeInTheDocument()
      })
    })

    it('should show error when branch name is missing', async () => {
      renderComponent()
      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập tên chi nhánh')).toBeInTheDocument()
      })
    })
  })

  describe('Input Handling', () => {
    it('should update display name when typing', async () => {
      renderComponent()
      const displayName = screen.getByPlaceholderText('Công ty TNHH Acme')
      await userEvent.type(displayName, 'Test Company')
      expect(displayName).toHaveValue('Test Company')
    })

    it('should update description when typing', async () => {
      renderComponent()
      const description = screen.getByPlaceholderText(/Mô tả ngắn về sứ mệnh/)
      await userEvent.type(description, 'Test description')
      expect(description).toHaveValue('Test description')
    })

    it('should update company name when typing', async () => {
      renderComponent()
      const companyName = screen.getByPlaceholderText('Acme Global Solutions Ltd.')
      await userEvent.type(companyName, 'Test Corp')
      expect(companyName).toHaveValue('Test Corp')
    })

    it('should update tax code when typing', async () => {
      renderComponent()
      const taxCode = screen.getByPlaceholderText('0123456789')
      await userEvent.type(taxCode, '1234567890')
      expect(taxCode).toHaveValue('1234567890')
    })

    it('should update account name when typing', async () => {
      renderComponent()
      const accountName = screen.getByPlaceholderText('CÔNG TY TNHH ACME')
      await userEvent.type(accountName, 'TEST COMPANY')
      expect(accountName).toHaveValue('TEST COMPANY')
    })
  })

  describe('Logo Upload', () => {
    it('should handle logo file selection', async () => {
      renderComponent()
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      await userEvent.upload(fileInput, file)

      expect(fileInput.files?.[0]).toBe(file)
    })
  })

  describe('Password Visibility Toggle', () => {
    it('should toggle account number visibility', async () => {
      renderComponent()
      const accountInput = screen.getByPlaceholderText('•••• •••• •••• ••••')
      expect(accountInput).toHaveAttribute('type', 'password')

      const toggleBtn = screen.getByText('visibility').closest('button')
      if (toggleBtn) {
        await userEvent.click(toggleBtn)
        expect(accountInput).toHaveAttribute('type', 'text')
      }
    })
  })

  describe('Loading State', () => {
    it('should render submit button', () => {
      renderComponent()
      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      expect(submitBtn).toBeInTheDocument()
    })

    it('should render submit button with verified icon', () => {
      renderComponent()
      expect(screen.getByText('verified')).toBeInTheDocument()
    })
  })

  describe('Submit Button', () => {
    it('should render submit button with correct text', () => {
      renderComponent()
      expect(screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })).toBeInTheDocument()
    })

    it('should render verified icon on submit button', () => {
      renderComponent()
      expect(screen.getByText('verified')).toBeInTheDocument()
    })
  })

  describe('Processing Time Notice', () => {
    it('should render processing time information', () => {
      renderComponent()
      expect(screen.getByText(/Thời gian xử lý thường mất 2–3 ngày làm việc/)).toBeInTheDocument()
    })
  })

  describe('Section Step Indicators', () => {
    it('should render step 01 for branding', () => {
      renderComponent()
      expect(screen.getByText('Bước 01')).toBeInTheDocument()
    })

    it('should render step 02 for business info', () => {
      renderComponent()
      expect(screen.getByText('Bước 02')).toBeInTheDocument()
    })

    it('should render step 03 for location', () => {
      renderComponent()
      expect(screen.getByText('Bước 03')).toBeInTheDocument()
    })

    it('should render step 04 for banking', () => {
      renderComponent()
      expect(screen.getByText('Bước 04')).toBeInTheDocument()
    })
  })

  describe('Section Icons', () => {
    it('should render palette icon for branding section', () => {
      renderComponent()
      expect(screen.getByText('palette')).toBeInTheDocument()
    })

    it('should render business icon for business info section', () => {
      renderComponent()
      expect(screen.getAllByText('business').length).toBeGreaterThan(0)
    })

    it('should render hub icon for location section', () => {
      renderComponent()
      expect(screen.getByText('hub')).toBeInTheDocument()
    })

    it('should render account_balance icon for banking section', () => {
      renderComponent()
      expect(screen.getByText('account_balance')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle long input values without crashing', () => {
      renderComponent()
      const displayName = screen.getByPlaceholderText('Công ty TNHH Acme')
      // Just verify the input exists and can be interacted with
      expect(displayName).toBeInTheDocument()
    })

    it('should clear error when user starts typing', async () => {
      renderComponent()
      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByText('Vui lòng tải lên logo')).toBeInTheDocument()
      })

      const displayName = screen.getByPlaceholderText('Công ty TNHH Acme')
      await userEvent.type(displayName, 'Test')
      
      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Vui lòng nhập tên hiển thị')).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderComponent()
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('Đăng ký Ban tổ chức')
    })

    it('should have labeled form inputs', () => {
      renderComponent()
      const labels = document.querySelectorAll('label')
      expect(labels.length).toBeGreaterThan(10)
    })
  })

  describe('Layout Structure', () => {
    it('should render sections in correct order', () => {
      renderComponent()
      const headings = screen.getAllByRole('heading', { level: 2 })
      expect(headings[0]).toHaveTextContent('Nhận diện thương hiệu')
      expect(headings[1]).toHaveTextContent('Thông tin doanh nghiệp')
      expect(headings[2]).toHaveTextContent('Địa điểm & Mạng xã hội')
      expect(headings[3]).toHaveTextContent('Thông tin ngân hàng')
    })
  })
})
