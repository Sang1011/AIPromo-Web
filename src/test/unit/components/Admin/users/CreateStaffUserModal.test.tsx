/// <reference types="jest" />
import React from 'react'
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import CreateStaffUserModal from '../../../../../components/Admin/users/CreateStaffUserModal'

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}))

jest.mock('react-icons/fi', () => ({
  FiX: () => <span data-testid="icon-close" />,
}))

jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
}))

const mockCreateStaffUser = jest.fn().mockResolvedValue({})
jest.mock('../../../../../services/userService', () => ({
  __esModule: true,
  default: {
    createStaffUser: () => mockCreateStaffUser(),
  },
}))

describe('CreateStaffUserModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render without crashing when isOpen is true', async () => {
      await act(async () => {
        render(<CreateStaffUserModal {...defaultProps} />)
      })
      expect(screen.getByText('Tạo tài khoản Staff')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', async () => {
      await act(async () => {
        render(<CreateStaffUserModal {...defaultProps} isOpen={false} />)
      })
      expect(screen.queryByText('Tạo tài khoản Staff')).not.toBeInTheDocument()
    })

    it('should display form fields', async () => {
      await act(async () => {
        render(<CreateStaffUserModal {...defaultProps} />)
      })
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Username')).toBeInTheDocument()
      expect(screen.getByText('Password')).toBeInTheDocument()
    })

    it('should display required field indicators', async () => {
      await act(async () => {
        render(<CreateStaffUserModal {...defaultProps} />)
      })
      const emailLabel = screen.getByText('Email')
      expect(emailLabel.parentElement?.querySelector('.text-red-400')).toBeInTheDocument()
    })

    it('should show cancel and submit buttons', async () => {
      await act(async () => {
        render(<CreateStaffUserModal {...defaultProps} />)
      })
      expect(screen.getByText('Huỷ')).toBeInTheDocument()
      expect(screen.getByText('Tạo tài khoản')).toBeInTheDocument()
    })

    it('should show role as Staff auto-set', async () => {
      await act(async () => {
        render(<CreateStaffUserModal {...defaultProps} />)
      })
      expect(screen.getByText('Staff')).toBeInTheDocument()
    })
  })
})
