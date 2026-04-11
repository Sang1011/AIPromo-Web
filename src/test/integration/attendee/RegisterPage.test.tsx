/// <reference types="jest" />
jest.setTimeout(30000)
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

import Register from '../../../pages/RegisterPage'

// ============================================================================
// MOCKS
// ============================================================================

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

jest.mock('../../../../utils/attachInterceptors', () => ({
  interceptorAPI: () => ({
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  }),
}))

jest.mock('../../../../services/api', () => ({
  __esModule: true,
  default: {
    call: () => ({ get: jest.fn(), post: jest.fn() }),
    callWithToken: () => ({ get: jest.fn(), post: jest.fn() }),
  },
}))

// ============================================================================
// STORE HELPER
// ============================================================================

const createTestStore = () => {
  return configureStore({
    reducer: {
      AUTH: () => ({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      }),
    },
  })
}

// ============================================================================
// TESTS
// ============================================================================

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate.mockClear()
  })

  describe('Render', () => {
    it('should render registration page with heading', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )
      expect(screen.getByText('Tạo tài khoản')).toBeInTheDocument()
    })

    it('should render first name input', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )
      expect(screen.getByPlaceholderText('Nguyễn')).toBeInTheDocument()
    })

    it('should render last name input', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )
      expect(screen.getByPlaceholderText('Văn A')).toBeInTheDocument()
    })

    it('should render username input', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )
      expect(screen.getByPlaceholderText('nguyenvana')).toBeInTheDocument()
    })

    it('should render email input', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )
      expect(screen.getByPlaceholderText('example@aipromo.vn')).toBeInTheDocument()
    })

    it('should render phone number input', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )
      expect(screen.getByPlaceholderText('0123 456 789')).toBeInTheDocument()
    })

    it('should render address input', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )
      expect(
        screen.getByPlaceholderText('123 Đường ABC, Quận 1, TP.HCM')
      ).toBeInTheDocument()
    })

    it('should render password input', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )
      expect(screen.getAllByPlaceholderText('••••••••')[0]).toBeInTheDocument()
    })

    it('should render confirm password input', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )
      expect(screen.getAllByPlaceholderText('••••••••')[1]).toBeInTheDocument()
    })

    it('should render submit button', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )
      expect(screen.getByRole('button', { name: /Đăng ký/ })).toBeInTheDocument()
    })

    it('should render login link', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )
      expect(screen.getByText('Đăng nhập')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show error when submitting empty form', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )

      const submitBtn = screen.getByRole('button', { name: /Đăng ký/ })
      await userEvent.click(submitBtn)

      expect(
        await screen.findByText(/Vui lòng nhập đầy đủ các trường bắt buộc/)
      ).toBeInTheDocument()
    })

    it('should show error when passwords do not match', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )

      await userEvent.type(screen.getByPlaceholderText('Nguyễn'), 'Nguyen')
      await userEvent.type(screen.getByPlaceholderText('Văn A'), 'Van A')
      await userEvent.type(screen.getByPlaceholderText('nguyenvana'), 'nguyenvana')
      await userEvent.type(screen.getByPlaceholderText('example@aipromo.vn'), 'test@example.com')
      
      const passwords = screen.getAllByPlaceholderText('••••••••')
      await userEvent.type(passwords[0], 'password123')
      await userEvent.type(passwords[1], 'different123')

      const submitBtn = screen.getByRole('button', { name: /Đăng ký/ })
      await userEvent.click(submitBtn)

      expect(await screen.findByText(/Mật khẩu xác nhận không khớp/)).toBeInTheDocument()
    })

    it('should show error when password is less than 8 characters', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )

      await userEvent.type(screen.getByPlaceholderText('Nguyễn'), 'Nguyen')
      await userEvent.type(screen.getByPlaceholderText('Văn A'), 'Van A')
      await userEvent.type(screen.getByPlaceholderText('nguyenvana'), 'nguyenvana')
      await userEvent.type(screen.getByPlaceholderText('example@aipromo.vn'), 'test@example.com')
      
      const passwords = screen.getAllByPlaceholderText('••••••••')
      await userEvent.type(passwords[0], 'short')
      await userEvent.type(passwords[1], 'short')

      const submitBtn = screen.getByRole('button', { name: /Đăng ký/ })
      await userEvent.click(submitBtn)

      expect(await screen.findByText(/Mật khẩu phải có ít nhất 8 ký tự/)).toBeInTheDocument()
    })

    it('should show error when required fields are missing', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )

      // Only fill some fields
      await userEvent.type(screen.getByPlaceholderText('Nguyễn'), 'Nguyen')
      await userEvent.type(screen.getByPlaceholderText('nguyenvana'), 'nguyenvana')
      
      const passwords = screen.getAllByPlaceholderText('••••••••')
      await userEvent.type(passwords[0], 'password123')
      await userEvent.type(passwords[1], 'password123')

      const submitBtn = screen.getByRole('button', { name: /Đăng ký/ })
      await userEvent.click(submitBtn)

      expect(
        await screen.findByText(/Vui lòng nhập đầy đủ các trường bắt buộc/)
      ).toBeInTheDocument()
    })
  })

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility for first password field', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )

      const passwords = screen.getAllByPlaceholderText('••••••••')
      expect(passwords[0]).toHaveAttribute('type', 'password')

      // Find toggle button next to password input
      const toggleBtn = passwords[0].parentElement?.querySelector('button[type="button"]')
      expect(toggleBtn).not.toBeNull()
      if (toggleBtn) {
        await userEvent.click(toggleBtn)
        expect(passwords[0]).toHaveAttribute('type', 'text')
      }
    })

    it('should toggle password visibility for confirm password field', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )

      const passwords = screen.getAllByPlaceholderText('••••••••')
      expect(passwords[1]).toHaveAttribute('type', 'password')

      // Find toggle button next to confirm password input
      const toggleBtn = passwords[1].parentElement?.querySelector('button[type="button"]')
      expect(toggleBtn).not.toBeNull()
      if (toggleBtn) {
        await userEvent.click(toggleBtn)
        expect(passwords[1]).toHaveAttribute('type', 'text')
      }
    })
  })

  describe('Optional Fields', () => {
    it('should allow submission with only required fields filled', async () => {
      const store = createTestStore()

      // Mock dispatch
      const originalDispatch = store.dispatch
      store.dispatch = jest.fn().mockResolvedValue({
        payload: { isSuccess: true },
      })

      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )

      await userEvent.type(screen.getByPlaceholderText('Nguyễn'), 'Nguyen')
      await userEvent.type(screen.getByPlaceholderText('Văn A'), 'Van A')
      await userEvent.type(screen.getByPlaceholderText('nguyenvana'), 'nguyenvana')
      await userEvent.type(screen.getByPlaceholderText('example@aipromo.vn'), 'test@example.com')
      
      const passwords = screen.getAllByPlaceholderText('••••••••')
      await userEvent.type(passwords[0], 'password123')
      await userEvent.type(passwords[1], 'password123')

      const submitBtn = screen.getByRole('button', { name: /Đăng ký/ })
      await userEvent.click(submitBtn)

      // Should attempt to navigate on success
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      }, { timeout: 3000 })
    })
  })

  describe('Loading State', () => {
    it('should disable submit button during registration', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )

      await userEvent.type(screen.getByPlaceholderText('Nguyễn'), 'Nguyen')
      await userEvent.type(screen.getByPlaceholderText('Văn A'), 'Van A')
      await userEvent.type(screen.getByPlaceholderText('nguyenvana'), 'nguyenvana')
      await userEvent.type(screen.getByPlaceholderText('example@aipromo.vn'), 'test@example.com')
      
      const passwords = screen.getAllByPlaceholderText('••••••••')
      await userEvent.type(passwords[0], 'password123')
      await userEvent.type(passwords[1], 'password123')

      const submitBtn = screen.getByRole('button', { name: /Đăng ký/ })
      await userEvent.click(submitBtn)

      expect(submitBtn).toBeDisabled()
    })
  })

  describe('Form Input Handling', () => {
    it('should update form state when typing in fields', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )

      const firstNameInput = screen.getByPlaceholderText('Nguyễn')
      await userEvent.type(firstNameInput, 'TestName')
      expect(firstNameInput).toHaveValue('TestName')

      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      await userEvent.type(emailInput, 'test@test.com')
      expect(emailInput).toHaveValue('test@test.com')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long input values', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )

      const longValue = 'A'.repeat(500)
      const firstNameInput = screen.getByPlaceholderText('Nguyễn')
      await userEvent.type(firstNameInput, longValue)
      expect(firstNameInput).toHaveValue(longValue)
    })

    it('should handle special characters in inputs', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Register />
        </Provider>
      )

      const firstNameInput = screen.getByPlaceholderText('Nguyễn')
      await userEvent.type(firstNameInput, '<script>alert("xss")</script>')
      expect(firstNameInput).toHaveValue('<script>alert("xss")</script>')
    })
  })
})

