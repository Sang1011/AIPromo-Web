/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminConfirmStatusModal from '../../../../../components/Admin/categories/AdminConfirmStatusModal'

jest.mock('react-icons/fi', () => ({
  FiX: () => <span data-testid="icon-close" />,
}))

describe('AdminConfirmStatusModal', () => {
  const defaultProps = {
    onCancel: jest.fn(),
    onConfirm: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<AdminConfirmStatusModal {...defaultProps} title="Confirm Action" message="Test message" />)
      })
      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    })

    it('should display default title', async () => {
      await act(async () => {
        render(<AdminConfirmStatusModal {...defaultProps} title="Custom Title" />)
      })
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('should display custom message', async () => {
      await act(async () => {
        render(<AdminConfirmStatusModal {...defaultProps} message="Bạn có chắc?" />)
      })
      expect(screen.getByText('Bạn có chắc?')).toBeInTheDocument()
    })

    it('should show cancel and confirm buttons', async () => {
      await act(async () => {
        render(<AdminConfirmStatusModal {...defaultProps} title="Confirm" />)
      })
      expect(screen.getByText('Huỷ')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Xác nhận/ })).toBeInTheDocument()
    })

    it('should show loading text when confirming', async () => {
      await act(async () => {
        render(<AdminConfirmStatusModal {...defaultProps} confirming={true} />)
      })
      expect(screen.getByText('Đang xử lý...')).toBeInTheDocument()
    })

    it('should call onCancel when cancel button clicked', async () => {
      await act(async () => {
        render(<AdminConfirmStatusModal {...defaultProps} />)
      })
      await act(async () => {
        screen.getByText('Huỷ').click()
      })
      expect(defaultProps.onCancel).toHaveBeenCalled()
    })

    it('should call onConfirm when confirm button clicked', async () => {
      await act(async () => {
        render(<AdminConfirmStatusModal {...defaultProps} title="Confirm" />)
      })
      await act(async () => {
        screen.getByRole('button', { name: /Xác nhận/ }).click()
      })
      expect(defaultProps.onConfirm).toHaveBeenCalled()
    })
  })
})
