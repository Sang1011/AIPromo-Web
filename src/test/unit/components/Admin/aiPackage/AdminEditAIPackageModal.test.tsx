/// <reference types="jest" />
import React from 'react'
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminEditAIPackageModal from '../../../../../components/Admin/aiPackage/AdminEditAIPackageModal'

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}))

jest.mock('react-icons/md', () => ({
  MdSave: () => <span data-testid="icon-save" />,
  MdAutoAwesome: () => <span data-testid="icon-auto" />,
}))

const mockDispatch = jest.fn()
let mockPackageState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ PACKAGE: mockPackageState }),
  useDispatch: () => mockDispatch,
}))

describe('AdminEditAIPackageModal', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
    mockPackageState = {
      loading: { update: false, detail: false },
      detail: {
        id: 'pkg1',
        name: 'Test Package',
        description: 'Test description',
        type: 'Subscription',
        price: 1000000,
        tokenQuota: 100,
        isActive: true,
      },
      error: null,
    }
  })

  describe('Render', () => {
    it('should render without crashing when isOpen is true', async () => {
      await act(async () => {
        render(<AdminEditAIPackageModal isOpen={true} packageId="pkg1" onClose={mockOnClose} />)
      })
      expect(screen.getByText('Chỉnh sửa gói AI')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', async () => {
      await act(async () => {
        render(<AdminEditAIPackageModal isOpen={false} packageId="pkg1" onClose={mockOnClose} />)
      })
      expect(screen.queryByText('Chỉnh sửa gói AI')).not.toBeInTheDocument()
    })

    it('should display form fields', async () => {
      await act(async () => {
        render(<AdminEditAIPackageModal isOpen={true} packageId="pkg1" onClose={mockOnClose} />)
      })
      expect(screen.getByText('Tên gói dịch vụ')).toBeInTheDocument()
      expect(screen.getByText('Giá gói (VND/tháng)')).toBeInTheDocument()
    })

    it('should show cancel and save buttons', async () => {
      await act(async () => {
        render(<AdminEditAIPackageModal isOpen={true} packageId="pkg1" onClose={mockOnClose} />)
      })
      expect(screen.getByText('Hủy bỏ')).toBeInTheDocument()
      expect(screen.getByText('Lưu thay đổi')).toBeInTheDocument()
    })
  })
})
