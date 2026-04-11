/// <reference types="jest" />
import React from 'react'
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminEditCategoryModal from '../../../../../components/Admin/categories/AdminEditCategoryModal'

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
let mockCategoryState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ CATEGORY: mockCategoryState }),
  useDispatch: () => mockDispatch,
}))

describe('AdminEditCategoryModal', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
    mockCategoryState = {
      currentCategory: { id: 1, code: 'TECH', name: 'Công nghệ', description: 'Tech', isActive: true },
    }
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<AdminEditCategoryModal categoryId={1} onClose={mockOnClose} />)
      })
      expect(screen.getByText('Cập nhật Category')).toBeInTheDocument()
    })

    it('should display form fields', async () => {
      await act(async () => {
        render(<AdminEditCategoryModal categoryId={1} onClose={mockOnClose} />)
      })
      expect(screen.getByText('Mã (code)')).toBeInTheDocument()
      expect(screen.getByText('Tên')).toBeInTheDocument()
      expect(screen.getByText('Mô tả')).toBeInTheDocument()
    })

    it('should show cancel and save buttons', async () => {
      await act(async () => {
        render(<AdminEditCategoryModal categoryId={1} onClose={mockOnClose} />)
      })
      expect(screen.getByText('Huỷ')).toBeInTheDocument()
      expect(screen.getByText('Cập nhật')).toBeInTheDocument()
    })

    it('should call onClose when cancel button clicked', async () => {
      await act(async () => {
        render(<AdminEditCategoryModal categoryId={1} onClose={mockOnClose} />)
      })
      await act(async () => {
        screen.getByText('Huỷ').click()
      })
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})
