/// <reference types="jest" />
import React from 'react'
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminCreateHashtagModal from '../../../../../components/Admin/hashtags/AdminCreateHashtagModal'

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

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

describe('AdminCreateHashtagModal', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<AdminCreateHashtagModal onClose={mockOnClose} />)
      })
      expect(screen.getByText('Tạo Hashtag mới')).toBeInTheDocument()
    })

    it('should display name input field', async () => {
      await act(async () => {
        render(<AdminCreateHashtagModal onClose={mockOnClose} />)
      })
      expect(screen.getByText('Tên')).toBeInTheDocument()
    })

    it('should show cancel and create buttons', async () => {
      await act(async () => {
        render(<AdminCreateHashtagModal onClose={mockOnClose} />)
      })
      expect(screen.getByText('Huỷ')).toBeInTheDocument()
      expect(screen.getByText('Tạo')).toBeInTheDocument()
    })

    it('should call onClose when cancel button clicked', async () => {
      await act(async () => {
        render(<AdminCreateHashtagModal onClose={mockOnClose} />)
      })
      await act(async () => {
        screen.getByText('Huỷ').click()
      })
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})
