/// <reference types="jest" />
import React from 'react'
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminToggleStatusConfirmModal from '../../../../../components/Admin/aiPackage/AdminToggleStatusConfirmModal'

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}))

jest.mock('react-icons/md', () => ({
  MdToggleOn: () => <span data-testid="icon-toggle" />,
}))

const mockDispatch = jest.fn()
let mockPackageState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ PACKAGE: mockPackageState }),
  useDispatch: () => mockDispatch,
}))

describe('AdminToggleStatusConfirmModal', () => {
  const mockOnClose = jest.fn()
  const mockOnConfirm = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
    mockPackageState = {
      loading: { toggleStatus: false },
    }
  })

  describe('Render', () => {
    it('should render without crashing when isOpen is true', async () => {
      await act(async () => {
        render(
          <AdminToggleStatusConfirmModal
            isOpen={true}
            packageId="pkg1"
            packageName="Test Package"
            currentStatus={true}
            onClose={mockOnClose}
            onConfirm={mockOnConfirm}
          />
        )
      })
      expect(screen.getByText('Xác nhận chuyển trạng thái')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', async () => {
      await act(async () => {
        render(
          <AdminToggleStatusConfirmModal
            isOpen={false}
            packageId="pkg1"
            packageName="Test Package"
            currentStatus={true}
            onClose={mockOnClose}
            onConfirm={mockOnConfirm}
          />
        )
      })
      expect(screen.queryByText('Xác nhận chuyển trạng thái')).not.toBeInTheDocument()
    })

    it('should display package name', async () => {
      await act(async () => {
        render(
          <AdminToggleStatusConfirmModal
            isOpen={true}
            packageId="pkg1"
            packageName="Test Package"
            currentStatus={true}
            onClose={mockOnClose}
            onConfirm={mockOnConfirm}
          />
        )
      })
      expect(screen.getByText(/Test Package/)).toBeInTheDocument()
    })

    it('should show deactivate option when currently active', async () => {
      await act(async () => {
        render(
          <AdminToggleStatusConfirmModal
            isOpen={true}
            packageId="pkg1"
            packageName="Test Package"
            currentStatus={true}
            onClose={mockOnClose}
            onConfirm={mockOnConfirm}
          />
        )
      })
      expect(screen.getByText(/tạm ngưng/)).toBeInTheDocument()
    })

    it('should show cancel and confirm buttons', async () => {
      await act(async () => {
        render(
          <AdminToggleStatusConfirmModal
            isOpen={true}
            packageId="pkg1"
            packageName="Test Package"
            currentStatus={true}
            onClose={mockOnClose}
            onConfirm={mockOnConfirm}
          />
        )
      })
      expect(screen.getByText('Hủy bỏ')).toBeInTheDocument()
      expect(screen.getByText('Tạm ngưng')).toBeInTheDocument()
    })
  })
})
