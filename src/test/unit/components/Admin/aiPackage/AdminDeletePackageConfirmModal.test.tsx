/// <reference types="jest" />
import React from 'react'
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminDeletePackageConfirmModal from '../../../../../components/Admin/aiPackage/AdminDeletePackageConfirmModal'

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}))

jest.mock('react-icons/md', () => ({
  MdDeleteOutline: () => <span data-testid="icon-delete" />,
  MdWarning: () => <span data-testid="icon-warning" />,
}))

const mockDispatch = jest.fn()
let mockPackageState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ PACKAGE: mockPackageState }),
  useDispatch: () => mockDispatch,
}))

describe('AdminDeletePackageConfirmModal', () => {
  const mockOnClose = jest.fn()
  const mockOnConfirm = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
    mockPackageState = {
      loading: { delete: false },
    }
  })

  describe('Render', () => {
    it('should render without crashing when isOpen is true', async () => {
      await act(async () => {
        render(
          <AdminDeletePackageConfirmModal
            isOpen={true}
            packageId="pkg1"
            packageName="Test Package"
            onClose={mockOnClose}
            onConfirm={mockOnConfirm}
          />
        )
      })
      expect(screen.getByText('Xác nhận xóa gói')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', async () => {
      await act(async () => {
        render(
          <AdminDeletePackageConfirmModal
            isOpen={false}
            packageId="pkg1"
            packageName="Test Package"
            onClose={mockOnClose}
            onConfirm={mockOnConfirm}
          />
        )
      })
      expect(screen.queryByText('Xác nhận xóa gói')).not.toBeInTheDocument()
    })

    it('should display package name', async () => {
      await act(async () => {
        render(
          <AdminDeletePackageConfirmModal
            isOpen={true}
            packageId="pkg1"
            packageName="Test Package"
            onClose={mockOnClose}
            onConfirm={mockOnConfirm}
          />
        )
      })
      expect(screen.getByText(/Test Package/)).toBeInTheDocument()
    })

    it('should show cancel and delete buttons', async () => {
      await act(async () => {
        render(
          <AdminDeletePackageConfirmModal
            isOpen={true}
            packageId="pkg1"
            packageName="Test Package"
            onClose={mockOnClose}
            onConfirm={mockOnConfirm}
          />
        )
      })
      expect(screen.getByText('Hủy bỏ')).toBeInTheDocument()
      expect(screen.getByText('Xóa gói')).toBeInTheDocument()
    })
  })
})
