/// <reference types="jest" />
import React from 'react'
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminCreateAIPackageModal from '../../../../../components/Admin/aiPackage/AdminCreateAIPackageModal'

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}))

jest.mock('react-icons/md', () => ({
  MdSave: () => <span data-testid="icon-save" />,
}))

const mockDispatch = jest.fn()
let mockPackageState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ PACKAGE: mockPackageState }),
  useDispatch: () => mockDispatch,
}))

describe('AdminCreateAIPackageModal', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
    mockPackageState = {
      loading: { create: false },
      error: null,
    }
  })

  describe('Render', () => {
    it('should render without crashing when isOpen is true', async () => {
      await act(async () => {
        render(<AdminCreateAIPackageModal isOpen={true} onClose={mockOnClose} />)
      })
      expect(screen.getByText('Tạo gói AI mới')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', async () => {
      await act(async () => {
        render(<AdminCreateAIPackageModal isOpen={false} onClose={mockOnClose} />)
      })
      expect(screen.queryByText('Tạo gói AI mới')).not.toBeInTheDocument()
    })

    it('should display form fields', async () => {
      await act(async () => {
        render(<AdminCreateAIPackageModal isOpen={true} onClose={mockOnClose} />)
      })
      expect(screen.getByText('Tên gói dịch vụ')).toBeInTheDocument()
      expect(screen.getByText('Giá gói (VND/tháng)')).toBeInTheDocument()
      expect(screen.getByText('Số lượng nội dung AI tối đa (mỗi tháng)')).toBeInTheDocument()
    })

    it('should show cancel and submit buttons', async () => {
      await act(async () => {
        render(<AdminCreateAIPackageModal isOpen={true} onClose={mockOnClose} />)
      })
      expect(screen.getByText('Hủy bỏ')).toBeInTheDocument()
      expect(screen.getByText('Lưu gói mới')).toBeInTheDocument()
    })

    it('should display type selector', async () => {
      await act(async () => {
        render(<AdminCreateAIPackageModal isOpen={true} onClose={mockOnClose} />)
      })
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })
})
