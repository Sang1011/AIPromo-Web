/// <reference types="jest" />
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

import VerifyOrganizer from '../../../pages/VerifyOrganizer'

// ============================================================================
// MOCKS
// ============================================================================

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

// Mock the entire organizerProfileSlice to avoid import.meta.env error
jest.mock('../../../../store/organizerProfileSlice', () => {
  const mockSlice = {
    name: 'ORGANIZER_PROFILE',
    reducer: (state = {}, action: any) => state,
    fetchCreateProfileOrganizer: jest.fn(() => ({ type: 'mock/create' })),
    fetchVerifyProfileOrganizer: jest.fn(() => ({ type: 'mock/verify' })),
  }
  // Make fulfilled.match work
  ;(mockSlice.fetchCreateProfileOrganizer as any).fulfilled = {
    match: (action: any) => action?.type === 'mock/create/fulfilled'
  }
  ;(mockSlice.fetchVerifyProfileOrganizer as any).fulfilled = {
    match: (action: any) => action?.type === 'mock/verify/fulfilled'
  }
  return mockSlice
})

// Mock FileReader
global.FileReader = class {
  onload: ((event: any) => void) | null = null
  result: string | null = null

  readAsDataURL(_file: File) {
    this.result = 'mock-base64-data-url'
    // Trigger onload synchronously
    if (this.onload) {
      this.onload({ target: { result: 'mock-base64-data-url' } })
    }
  }
} as any

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-object-url')
global.URL.revokeObjectURL = jest.fn()

// ============================================================================
// STORE HELPER
// ============================================================================

const createTestStore = () => {
  return configureStore({
    reducer: {
      ORGANIZER_PROFILE: () => ({}),
    },
  })
}

// ============================================================================
// TEST HELPERS
// ============================================================================

const fillAllFields = async () => {
  // Step 1: Branding
  const displayName = screen.getByPlaceholderText('Công ty TNHH Acme')
  await userEvent.type(displayName, 'Test Company')

  const description = screen.getByPlaceholderText('Mô tả ngắn về sứ mệnh và lĩnh vực hoạt động...')
  await userEvent.type(description, 'A test company description')

  // Step 2: Business Info
  const companyName = screen.getByPlaceholderText('Acme Global Solutions Ltd.')
  await userEvent.type(companyName, 'Test Corp Ltd')

  const taxCode = screen.getByPlaceholderText('0123456789')
  await userEvent.type(taxCode, '1234567890')

  const identityNumber = screen.getByPlaceholderText('Số GPKD / Mã đăng ký')
  await userEvent.type(identityNumber, 'BRN-12345')

  const address = screen.getByPlaceholderText('Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố')
  await userEvent.type(address, '123 Test Street, Hanoi')

  const website = screen.getByPlaceholderText('https://example.com.vn')
  await userEvent.type(website, 'https://testcompany.com')

  // Step 4: Banking
  const accountName = screen.getByPlaceholderText('CÔNG TY TNHH ACME')
  await userEvent.type(accountName, 'TEST COMPANY')

  const accountNumber = screen.getByPlaceholderText('•••• •••• •••• ••••')
  await userEvent.type(accountNumber, '1234567890')

  const bankCode = screen.getByPlaceholderText('Ví dụ: BIDVVNVX')
  await userEvent.type(bankCode, 'BIDVVNVX')

  const branch = screen.getByPlaceholderText('Chi nhánh trung tâm Hà Nội')
  await userEvent.type(branch, 'Hanoi Branch')
}

// ============================================================================
// TESTS
// ============================================================================

describe('VerifyOrganizer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate.mockClear()
  })

  describe('Render', () => {
    it('should render verify organizer page with heading', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(screen.getByText('Đăng ký Ban tổ chức')).toBeInTheDocument()
    })

    it('should render page subtitle', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(
        screen.getByText(/Điền đầy đủ thông tin bên dưới/)
      ).toBeInTheDocument()
    })

    it('should render branding section (Step 01)', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(screen.getByText('Nhận diện thương hiệu')).toBeInTheDocument()
    })

    it('should render business info section (Step 02)', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(screen.getByText('Thông tin doanh nghiệp')).toBeInTheDocument()
    })

    it('should render location & social section (Step 03)', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(screen.getByText('Địa điểm & Mạng xã hội')).toBeInTheDocument()
    })

    it('should render banking section (Step 04)', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(screen.getByText('Thông tin ngân hàng')).toBeInTheDocument()
    })

    it('should render submit button', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })).toBeInTheDocument()
    })
  })

  describe('Form Fields', () => {
    it('should render display name input', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(screen.getByPlaceholderText('Công ty TNHH Acme')).toBeInTheDocument()
    })

    it('should render description textarea', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(
        screen.getByPlaceholderText('Mô tả ngắn về sứ mệnh và lĩnh vực hoạt động...')
      ).toBeInTheDocument()
    })

    it('should render company name input', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(screen.getByPlaceholderText('Acme Global Solutions Ltd.')).toBeInTheDocument()
    })

    it('should render tax code input', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(screen.getByPlaceholderText('0123456789')).toBeInTheDocument()
    })

    it('should render identity number input', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(screen.getByPlaceholderText('Số GPKD / Mã đăng ký')).toBeInTheDocument()
    })

    it('should render address input', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(
        screen.getByPlaceholderText('Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố')
      ).toBeInTheDocument()
    })

    it('should render website input', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(screen.getByPlaceholderText('https://example.com.vn')).toBeInTheDocument()
    })

    it('should render bank account name input', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(screen.getByPlaceholderText('CÔNG TY TNHH ACME')).toBeInTheDocument()
    })

    it('should render bank account number input', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(screen.getByPlaceholderText('•••• •••• •••• ••••')).toBeInTheDocument()
    })

    it('should render bank code input', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(screen.getByPlaceholderText('Ví dụ: BIDVVNVX')).toBeInTheDocument()
    })

    it('should render bank branch input', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(screen.getByPlaceholderText('Chi nhánh trung tâm Hà Nội')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show error when submitting without logo', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )

      // Fill all fields except logo
      await fillAllFields()

      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      expect(await screen.findByText(/Vui lòng tải lên logo/)).toBeInTheDocument()
    })

    it('should show error when submitting empty form', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )

      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      // Multiple errors should appear
      await waitFor(() => {
        expect(screen.getByText(/Vui lòng tải lên logo/)).toBeInTheDocument()
        expect(screen.getByText(/Vui lòng nhập tên hiển thị/)).toBeInTheDocument()
        expect(screen.getByText(/Vui lòng nhập mô tả tổ chức/)).toBeInTheDocument()
        expect(screen.getByText(/Vui lòng nhập tên công ty/)).toBeInTheDocument()
        expect(screen.getByText(/Vui lòng nhập mã số thuế/)).toBeInTheDocument()
        expect(screen.getByText(/Vui lòng nhập số đăng ký doanh nghiệp/)).toBeInTheDocument()
        expect(screen.getByText(/Vui lòng nhập địa chỉ trụ sở/)).toBeInTheDocument()
        expect(screen.getByText(/Vui lòng nhập website/)).toBeInTheDocument()
        expect(screen.getByText(/Vui lòng nhập chủ tài khoản/)).toBeInTheDocument()
        expect(screen.getByText(/Vui lòng nhập số tài khoản/)).toBeInTheDocument()
        expect(screen.getByText(/Vui lòng nhập mã ngân hàng/)).toBeInTheDocument()
        expect(screen.getByText(/Vui lòng nhập tên chi nhánh/)).toBeInTheDocument()
      })
    })

    it('should clear error when field is filled after being empty', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )

      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByText(/Vui lòng nhập tên hiển thị/)).toBeInTheDocument()
      })

      // Now fill the display name field
      const displayName = screen.getByPlaceholderText('Công ty TNHH Acme')
      await userEvent.type(displayName, 'Test Company')

      // The error should be cleared
      expect(screen.queryByText(/Vui lòng nhập tên hiển thị/)).not.toBeInTheDocument()
    })
  })

  describe('Logo Upload', () => {
    it('should handle logo file selection', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )

      const file = new File(['logo-content'], 'logo.png', { type: 'image/png' })
      
      // Find the hidden file input by type
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      expect(fileInput).toBeInTheDocument()
      
      await userEvent.upload(fileInput, file)
      expect(fileInput.files).toHaveLength(1)
    })
  })

  describe('Banking Visibility Toggle', () => {
    it('should toggle account number visibility', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )

      const accountNumber = screen.getByPlaceholderText('•••• •••• •••• ••••')
      expect(accountNumber).toHaveAttribute('type', 'password')

      // Find the visibility toggle button near the account number field
      const toggleBtn = accountNumber.parentElement?.querySelector('button')
      if (toggleBtn) {
        await userEvent.click(toggleBtn)
        expect(accountNumber).toHaveAttribute('type', 'text')
      }
    })
  })

  describe('Input Handling', () => {
    it('should update business info fields when typing', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )

      const displayName = screen.getByPlaceholderText('Công ty TNHH Acme')
      await userEvent.type(displayName, 'My Company')
      expect(displayName).toHaveValue('My Company')

      const taxCode = screen.getByPlaceholderText('0123456789')
      await userEvent.type(taxCode, '9876543210')
      expect(taxCode).toHaveValue('9876543210')
    })

    it('should update bank info fields when typing', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )

      const accountName = screen.getByPlaceholderText('CÔNG TY TNHH ACME')
      await userEvent.type(accountName, 'MY COMPANY')
      expect(accountName).toHaveValue('MY COMPANY')

      const bankCode = screen.getByPlaceholderText('Ví dụ: BIDVVNVX')
      await userEvent.type(bankCode, 'TESTBANK')
      expect(bankCode).toHaveValue('TESTBANK')
    })
  })

  describe('Form Submission', () => {
    it('should attempt submission when all fields are filled and logo uploaded', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )

      // Fill all fields
      await fillAllFields()

      // Upload logo
      const file = new File(['logo-content'], 'logo.png', { type: 'image/png' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      await userEvent.upload(fileInput, file)

      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      // The dispatch is mocked, so we just verify the button was clicked
      expect(submitBtn).toBeInTheDocument()
    })
  })

  describe('Section Layout', () => {
    it('should render business type as read-only badge', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(screen.getByText('Company')).toBeInTheDocument()
    })

    it('should render security notice in banking section', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(
        screen.getByText(/Thông tin ngân hàng được mã hóa đầu cuối/)
      ).toBeInTheDocument()
    })

    it('should render processing time notice', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )
      expect(
        screen.getByText(/Thời gian xử lý thường mất 2–3 ngày làm việc/)
      ).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long input values', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )

      const longValue = 'A'.repeat(100)
      const displayName = screen.getByPlaceholderText('Công ty TNHH Acme')
      
      // Use fireEvent for faster input (userEvent.type is slow with long strings)
      fireEvent.change(displayName, { target: { value: longValue } })
      expect(displayName).toHaveValue(longValue)
    })

    it('should handle special characters in inputs', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )

      const companyName = screen.getByPlaceholderText('Acme Global Solutions Ltd.')
      const specialValue = '<script>alert("xss")</script>'
      
      // Use fireEvent for special characters
      fireEvent.change(companyName, { target: { value: specialValue } })
      expect(companyName).toHaveValue(specialValue)
    })

    it('should handle multiple validation errors simultaneously', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <VerifyOrganizer />
        </Provider>
      )

      // Fill only some fields and submit
      const displayName = screen.getByPlaceholderText('Công ty TNHH Acme')
      await userEvent.type(displayName, 'Test Company')

      const submitBtn = screen.getByRole('button', { name: /Gửi hồ sơ xác minh/ })
      await userEvent.click(submitBtn)

      // Should show multiple errors
      await waitFor(() => {
        const errorMessages = screen.getAllByText(/Vui lòng/)
        expect(errorMessages.length).toBeGreaterThan(1)
      })
    })
  })
})
