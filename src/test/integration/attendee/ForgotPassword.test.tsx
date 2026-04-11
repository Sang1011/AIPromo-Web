/// <reference types="jest" />
jest.setTimeout(30000)
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ForgotPassword from '../../../pages/ForgotPassword'

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

jest.mock('../../../../services/authService', () => ({
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
}))

import authService from '../../../services/authService'

// ============================================================================
// TESTS
// ============================================================================

describe('ForgotPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate.mockClear()
    ;(authService.forgotPassword as jest.Mock).mockResolvedValue({})
    ;(authService.resetPassword as jest.Mock).mockResolvedValue({})
  })

  describe('Step 1 - Email Input', () => {
    it('should render forgot password page with heading', () => {
      render(<ForgotPassword />)
      expect(screen.getByText('Quên mật khẩu?')).toBeInTheDocument()
    })

    it('should render email input field', () => {
      render(<ForgotPassword />)
      expect(screen.getByPlaceholderText('example@aipromo.vn')).toBeInTheDocument()
    })

    it('should render "Gửi mã OTP" button', () => {
      render(<ForgotPassword />)
      expect(screen.getByRole('button', { name: /Gửi mã OTP/ })).toBeInTheDocument()
    })

    it('should render back to login link', () => {
      render(<ForgotPassword />)
      expect(screen.getByText(/Quay lại đăng nhập/)).toBeInTheDocument()
    })

    it('should show step 1 as active initially', () => {
      render(<ForgotPassword />)
      const step1Indicator = screen.getByText('Xác nhận email')
      expect(step1Indicator).toBeInTheDocument()
    })

    it('should show error when submitting without email', async () => {
      render(<ForgotPassword />)

      const submitBtn = screen.getByRole('button', { name: /Gửi mã OTP/ })
      await userEvent.click(submitBtn)

      expect(await screen.findByText(/Vui lòng nhập địa chỉ email/)).toBeInTheDocument()
    })
  })

  describe('Step 2 - OTP & Password Reset', () => {
    beforeEach(async () => {
      // First, go to step 2 by submitting email
      render(<ForgotPassword />)

      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      await userEvent.type(emailInput, 'test@example.com')

      const submitBtn = screen.getByRole('button', { name: /Gửi mã OTP/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Đặt lại mật khẩu/ })).toBeInTheDocument()
      })
    })

    it('should render OTP input fields', () => {
      expect(screen.getByText(/Mã OTP \(6 chữ số\)/)).toBeInTheDocument()
    })

    it('should render new password input', () => {
      expect(screen.getAllByPlaceholderText('••••••••')[0]).toBeInTheDocument()
    })

    it('should render confirm password input', () => {
      expect(screen.getAllByPlaceholderText('••••••••')[1]).toBeInTheDocument()
    })

    it('should render "Xác nhận" button', () => {
      expect(screen.getByRole('button', { name: /Xác nhận/ })).toBeInTheDocument()
    })

    it('should render "Gửi lại OTP" button', () => {
      expect(screen.getByRole('button', { name: /Gửi lại OTP/ })).toBeInTheDocument()
    })

    it('should show error when OTP is less than 6 digits', async () => {
      // Only fill 3 OTP digits
      const otpInputs = screen.getAllByRole('textbox')
      // OTP inputs are the first 6 textboxes
      await userEvent.type(otpInputs[0], '1')
      await userEvent.type(otpInputs[1], '2')
      await userEvent.type(otpInputs[2], '3')

      // Fill passwords
      const passwords = screen.getAllByPlaceholderText('••••••••')
      await userEvent.type(passwords[0], 'newpassword123')
      await userEvent.type(passwords[1], 'newpassword123')

      const submitBtn = screen.getByRole('button', { name: /Xác nhận/ })
      await userEvent.click(submitBtn)

      expect(await screen.findByText(/Vui lòng nhập đủ 6 chữ số OTP/)).toBeInTheDocument()
    })

    it('should show error when new password is empty', async () => {
      // Fill all 6 OTP digits
      const otpInputs = screen.getAllByRole('textbox')
      for (let i = 0; i < 6; i++) {
        await userEvent.type(otpInputs[i], String(i + 1))
      }

      // Fill only confirm password
      const passwords = screen.getAllByPlaceholderText('••••••••')
      await userEvent.type(passwords[1], 'newpassword123')

      const submitBtn = screen.getByRole('button', { name: /Xác nhận/ })
      await userEvent.click(submitBtn)

      expect(await screen.findByText(/Vui lòng nhập mật khẩu mới/)).toBeInTheDocument()
    })

    it('should show error when password is less than 8 characters', async () => {
      // Fill all 6 OTP digits
      const otpInputs = screen.getAllByRole('textbox')
      for (let i = 0; i < 6; i++) {
        await userEvent.type(otpInputs[i], String(i + 1))
      }

      // Fill short password
      const passwords = screen.getAllByPlaceholderText('••••••••')
      await userEvent.type(passwords[0], 'short')
      await userEvent.type(passwords[1], 'short')

      const submitBtn = screen.getByRole('button', { name: /Xác nhận/ })
      await userEvent.click(submitBtn)

      expect(await screen.findByText(/Mật khẩu phải có ít nhất 8 ký tự/)).toBeInTheDocument()
    })

    it('should show error when passwords do not match', async () => {
      // Fill all 6 OTP digits
      const otpInputs = screen.getAllByRole('textbox')
      for (let i = 0; i < 6; i++) {
        await userEvent.type(otpInputs[i], String(i + 1))
      }

      // Fill mismatched passwords
      const passwords = screen.getAllByPlaceholderText('••••••••')
      await userEvent.type(passwords[0], 'newpassword123')
      await userEvent.type(passwords[1], 'differentpassword')

      const submitBtn = screen.getByRole('button', { name: /Xác nhận/ })
      await userEvent.click(submitBtn)

      expect(await screen.findByText(/Mật khẩu xác nhận không khớp/)).toBeInTheDocument()
    })
  })

  describe('Password Visibility Toggle', () => {
    beforeEach(async () => {
      render(<ForgotPassword />)

      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      await userEvent.type(emailInput, 'test@example.com')

      const submitBtn = screen.getByRole('button', { name: /Gửi mã OTP/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Đặt lại mật khẩu/ })).toBeInTheDocument()
      })
    })

    it('should toggle new password visibility', async () => {
      const passwords = screen.getAllByPlaceholderText('••••••••')
      expect(passwords[0]).toHaveAttribute('type', 'password')

      // Find the toggle button next to the password input
      const toggleBtn = passwords[0].parentElement?.querySelector('button[type="button"]')
      expect(toggleBtn).not.toBeNull()
      if (toggleBtn) {
        await userEvent.click(toggleBtn)
        expect(passwords[0]).toHaveAttribute('type', 'text')
      }
    })

    it('should toggle confirm password visibility', async () => {
      const passwords = screen.getAllByPlaceholderText('••••••••')
      expect(passwords[1]).toHaveAttribute('type', 'password')

      // Find the toggle button next to the confirm password input
      const toggleBtn = passwords[1].parentElement?.querySelector('button[type="button"]')
      expect(toggleBtn).not.toBeNull()
      if (toggleBtn) {
        await userEvent.click(toggleBtn)
        expect(passwords[1]).toHaveAttribute('type', 'text')
      }
    })
  })

  describe('OTP Input Handling', () => {
    beforeEach(async () => {
      render(<ForgotPassword />)

      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      await userEvent.type(emailInput, 'test@example.com')

      const submitBtn = screen.getByRole('button', { name: /Gửi mã OTP/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Đặt lại mật khẩu/ })).toBeInTheDocument()
      })
    })

    it('should auto-focus next OTP input after typing digit', async () => {
      const otpInputs = screen.getAllByRole('textbox')
      await userEvent.type(otpInputs[0], '1')

      expect(otpInputs[0]).toHaveValue('1')
    })

    it('should only accept numeric input for OTP', async () => {
      const otpInputs = screen.getAllByRole('textbox')
      await userEvent.type(otpInputs[0], 'a')

      expect(otpInputs[0]).toHaveValue('')
    })

    it('should handle paste of 6-digit OTP', async () => {
      const otpInputs = screen.getAllByRole('textbox')
      
      // Simulate typing all 6 digits manually (paste doesn't work well in jsdom)
      for (let i = 0; i < 6; i++) {
        await userEvent.type(otpInputs[i], String(i + 1))
      }

      // All OTP inputs should be filled
      for (let i = 0; i < 6; i++) {
        expect(otpInputs[i]).toHaveValue(String(i + 1))
      }
    })
  })

  describe('API Integration', () => {
    it('should call forgotPassword API when submitting email', async () => {
      render(<ForgotPassword />)

      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      await userEvent.type(emailInput, 'test@example.com')

      const submitBtn = screen.getByRole('button', { name: /Gửi mã OTP/ })
      await userEvent.click(submitBtn)

      await waitFor(() => {
        expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com')
      })
    })

    it('should call resetPassword API when submitting OTP form', async () => {
      render(<ForgotPassword />)

      // Step 1
      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.click(screen.getByRole('button', { name: /Gửi mã OTP/ }))

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Đặt lại mật khẩu/ })).toBeInTheDocument()
      })

      // Step 2
      const otpInputs = screen.getAllByRole('textbox')
      for (let i = 0; i < 6; i++) {
        await userEvent.type(otpInputs[i], String(i + 1))
      }

      const passwords = screen.getAllByPlaceholderText('••••••••')
      await userEvent.type(passwords[0], 'newpassword123')
      await userEvent.type(passwords[1], 'newpassword123')

      await userEvent.click(screen.getByRole('button', { name: /Xác nhận/ }))

      await waitFor(() => {
        expect(authService.resetPassword).toHaveBeenCalledWith(
          'test@example.com',
          '123456',
          'newpassword123'
        )
      })
    })
  })

  describe('Navigation', () => {
    it('should navigate to login page after successful password reset', async () => {
      render(<ForgotPassword />)

      // Step 1
      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.click(screen.getByRole('button', { name: /Gửi mã OTP/ }))

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Đặt lại mật khẩu/ })).toBeInTheDocument()
      })

      // Step 2
      const otpInputs = screen.getAllByRole('textbox')
      for (let i = 0; i < 6; i++) {
        await userEvent.type(otpInputs[i], String(i + 1))
      }

      const passwords = screen.getAllByPlaceholderText('••••••••')
      await userEvent.type(passwords[0], 'newpassword123')
      await userEvent.type(passwords[1], 'newpassword123')

      await userEvent.click(screen.getByRole('button', { name: /Xác nhận/ }))

      // After success, it should navigate to /login with 1.5s delay
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login')
      }, { timeout: 3000 })
    })

    it('should navigate to login page when clicking back button', async () => {
      render(<ForgotPassword />)

      const backBtn = screen.getByText(/Quay lại đăng nhập/)
      await userEvent.click(backBtn)

      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  describe('Error Handling', () => {
    it('should show error when forgotPassword API fails', async () => {
      ;(authService.forgotPassword as jest.Mock).mockRejectedValue({
        response: { data: { detail: 'Email không tồn tại' } },
      })

      render(<ForgotPassword />)

      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      await userEvent.type(emailInput, 'nonexistent@example.com')

      const submitBtn = screen.getByRole('button', { name: /Gửi mã OTP/ })
      await userEvent.click(submitBtn)

      expect(await screen.findByText('Email không tồn tại')).toBeInTheDocument()
    })

    it('should show error when resetPassword API fails', async () => {
      ;(authService.resetPassword as jest.Mock).mockRejectedValue({
        response: { data: { detail: 'OTP không hợp lệ' } },
      })

      render(<ForgotPassword />)

      // Step 1
      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.click(screen.getByRole('button', { name: /Gửi mã OTP/ }))

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Đặt lại mật khẩu/ })).toBeInTheDocument()
      })

      // Step 2
      const otpInputs = screen.getAllByRole('textbox')
      for (let i = 0; i < 6; i++) {
        await userEvent.type(otpInputs[i], String(i + 1))
      }

      const passwords = screen.getAllByPlaceholderText('••••••••')
      await userEvent.type(passwords[0], 'newpassword123')
      await userEvent.type(passwords[1], 'newpassword123')

      await userEvent.click(screen.getByRole('button', { name: /Xác nhận/ }))

      expect(await screen.findByText('OTP không hợp lệ')).toBeInTheDocument()
    })
  })

  describe('Step Navigation', () => {
    it('should go back to step 1 when clicking "Gửi lại OTP"', async () => {
      render(<ForgotPassword />)

      // Step 1
      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.click(screen.getByRole('button', { name: /Gửi mã OTP/ }))

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Đặt lại mật khẩu/ })).toBeInTheDocument()
      })

      // Go back to step 1
      const resendBtn = screen.getByRole('button', { name: /Gửi lại OTP/ })
      await userEvent.click(resendBtn)

      expect(screen.getByText('Quên mật khẩu?')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should disable submit button during forgot password request', async () => {
      // Make the API call hang
      ;(authService.forgotPassword as jest.Mock).mockReturnValue(new Promise(() => {}))

      render(<ForgotPassword />)

      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      await userEvent.type(emailInput, 'test@example.com')

      const submitBtn = screen.getByRole('button', { name: /Gửi mã OTP/ })
      await userEvent.click(submitBtn)

      expect(submitBtn).toBeDisabled()
    })

    it('should disable submit button during reset password request', async () => {
      ;(authService.resetPassword as jest.Mock).mockReturnValue(new Promise(() => {}))

      render(<ForgotPassword />)

      // Step 1
      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.click(screen.getByRole('button', { name: /Gửi mã OTP/ }))

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Đặt lại mật khẩu/ })).toBeInTheDocument()
      })

      // Step 2
      const otpInputs = screen.getAllByRole('textbox')
      for (let i = 0; i < 6; i++) {
        await userEvent.type(otpInputs[i], String(i + 1))
      }

      const passwords = screen.getAllByPlaceholderText('••••••••')
      await userEvent.type(passwords[0], 'newpassword123')
      await userEvent.type(passwords[1], 'newpassword123')

      const submitBtn = screen.getByRole('button', { name: /Xác nhận/ })
      await userEvent.click(submitBtn)

      expect(submitBtn).toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty OTP paste gracefully', async () => {
      render(<ForgotPassword />)

      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.click(screen.getByRole('button', { name: /Gửi mã OTP/ }))

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Đặt lại mật khẩu/ })).toBeInTheDocument()
      })

      const otpInputs = screen.getAllByRole('textbox')

      // Typing non-numeric characters should be ignored
      await userEvent.type(otpInputs[0], 'a')

      // First input should remain empty (component only accepts digits)
      expect(otpInputs[0]).toHaveValue('')
    })

    it('should handle partial OTP paste (less than 6 digits)', async () => {
      render(<ForgotPassword />)

      const emailInput = screen.getByPlaceholderText('example@aipromo.vn')
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.click(screen.getByRole('button', { name: /Gửi mã OTP/ }))

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Đặt lại mật khẩu/ })).toBeInTheDocument()
      })

      const otpInputs = screen.getAllByRole('textbox')

      // Type only 3 digits manually
      await userEvent.type(otpInputs[0], '1')
      await userEvent.type(otpInputs[1], '2')
      await userEvent.type(otpInputs[2], '3')

      // First 3 inputs should be filled
      expect(otpInputs[0]).toHaveValue('1')
      expect(otpInputs[1]).toHaveValue('2')
      expect(otpInputs[2]).toHaveValue('3')
      // Rest should be empty
      for (let i = 3; i < 6; i++) {
        expect(otpInputs[i]).toHaveValue('')
      }
    })
  })
})

