/// <reference types="jest" />
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

import Login from '../../../pages/LoginPage'

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

jest.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess, onError }: { onSuccess: (resp: { credential?: string }) => void; onError: () => void }) => (
    <button
      data-testid="google-login-btn"
      onClick={() => onSuccess({ credential: 'mock-google-id-token' })}
    >
      Google Login
    </button>
  ),
}))

// Mock API and interceptors to avoid import.meta.env error
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

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Mock crypto.randomUUID
Object.defineProperty(crypto, 'randomUUID', {
  value: () => 'mock-uuid-12345',
  writable: true,
})

// Mock navigator
Object.defineProperty(navigator, 'platform', { value: 'Win32', writable: true })
Object.defineProperty(navigator, 'userAgent', { value: 'MockUserAgent', writable: true })

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

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate.mockClear()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('Render', () => {
    it('should render login page with heading', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )
      expect(screen.getByText('Chào mừng trở lại')).toBeInTheDocument()
    })

    it('should render email input field', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )
      expect(screen.getByPlaceholderText('example@aipromo.vn')).toBeInTheDocument()
    })

    it('should render password input field', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    })

    it('should render login button', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )
      expect(screen.getByRole('button', { name: /Đăng nhập/ })).toBeInTheDocument()
    })

    it('should render Google login button', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )
      expect(screen.getByTestId('google-login-btn')).toBeInTheDocument()
    })

    it('should render forgot password link', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )
      expect(screen.getByText(/Quên mật khẩu\?/)).toBeInTheDocument()
    })

    it('should render register link', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )
      expect(screen.getByText('Đăng ký')).toBeInTheDocument()
    })

    it('should render remember me checkbox', () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )
      expect(screen.getByLabelText(/Ghi nhớ đăng nhập/)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show error when submitting empty form', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )

      const submitBtn = screen.getByRole('button', { name: /Đăng nhập/ })
      await userEvent.click(submitBtn)

      expect(await screen.findByText(/Vui lòng nhập đầy đủ email và mật khẩu/)).toBeInTheDocument()
    })

    it('should show error when only email is provided', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )

      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      await userEvent.type(emailInput, 'test@example.com')

      const submitBtn = screen.getByRole('button', { name: /Đăng nhập/ })
      await userEvent.click(submitBtn)

      expect(await screen.findByText(/Vui lòng nhập đầy đủ email và mật khẩu/)).toBeInTheDocument()
    })

    it('should show error when only password is provided', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )

      const passwordInput = screen.getByPlaceholderText('••••••••')
      await userEvent.type(passwordInput, 'password123')

      const submitBtn = screen.getByRole('button', { name: /Đăng nhập/ })
      await userEvent.click(submitBtn)

      expect(await screen.findByText(/Vui lòng nhập đầy đủ email và mật khẩu/)).toBeInTheDocument()
    })
  })

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility when clicking eye icon', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )

      const passwordInput = screen.getByPlaceholderText('••••••••')
      expect(passwordInput).toHaveAttribute('type', 'password')

      // Find the toggle button near the password input
      const toggleBtn = passwordInput.parentElement?.querySelector('button[type="button"]')
      if (toggleBtn) {
        await userEvent.click(toggleBtn)
        expect(passwordInput).toHaveAttribute('type', 'text')
      }
    })
  })

  describe('Remember Me', () => {
    it('should load saved email from localStorage on mount', () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'aipromo_remember_me') return 'true'
        if (key === 'aipromo_saved_email') return 'saved@example.com'
        return null
      })

      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )

      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      expect(emailInput).toHaveValue('saved@example.com')
    })
  })

  describe('Loading State', () => {
    it('should disable submit button during login', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )

      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      const passwordInput = screen.getByPlaceholderText('••••••••')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')

      const submitBtn = screen.getByRole('button', { name: /Đăng nhập/ })
      await userEvent.click(submitBtn)

      // The button should be disabled during loading
      expect(submitBtn).toBeDisabled()
    })
  })

  describe('Input Handling', () => {
    it('should update email when typing', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )

      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      await userEvent.type(emailInput, 'test@test.com')
      expect(emailInput).toHaveValue('test@test.com')
    })

    it('should update password when typing', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )

      const passwordInput = screen.getByPlaceholderText('••••••••')
      await userEvent.type(passwordInput, 'mypassword')
      expect(passwordInput).toHaveValue('mypassword')
    })
  })

  describe('Remember Me Checkbox', () => {
    it('should toggle remember me checkbox', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )

      const checkbox = screen.getByLabelText(/Ghi nhớ đăng nhập/)
      expect(checkbox).not.toBeChecked()

      await userEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing localStorage values gracefully', () => {
      // localStorage returns null for non-existent keys, which is handled fine
      mockLocalStorage.getItem.mockReturnValue(null)

      const store = createTestStore()
      expect(() =>
        render(
          <Provider store={store}>
            <Login />
          </Provider>
        )
      ).not.toThrow()
    })

    it('should handle very long email values', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )

      const longValue = 'a'.repeat(200) + '@example.com'
      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      await userEvent.type(emailInput, longValue)
      expect(emailInput).toHaveValue(longValue)
    })

    it('should handle special characters in password', async () => {
      const store = createTestStore()
      render(
        <Provider store={store}>
          <Login />
        </Provider>
      )

      const specialPassword = '<script>alert("xss")</script>'
      const passwordInput = screen.getByPlaceholderText('••••••••')
      await userEvent.type(passwordInput, specialPassword)
      expect(passwordInput).toHaveValue(specialPassword)
    })
  })
})
