/// <reference types="jest" />
import React from 'react'
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminViewAIPackageModal from '../../../../../components/Admin/aiPackage/AdminViewAIPackageModal'

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}))

jest.mock('react-icons/md', () => ({
  MdAutoAwesome: () => <span data-testid="icon-auto" />,
  MdAttachMoney: () => <span data-testid="icon-money" />,
  MdToken: () => <span data-testid="icon-token" />,
  MdDescription: () => <span data-testid="icon-desc" />,
  MdCategory: () => <span data-testid="icon-category" />,
  MdCheckCircle: () => <span data-testid="icon-check" />,
  MdInfo: () => <span data-testid="icon-info" />,
}))

const mockDispatch = jest.fn()
let mockPackageState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ PACKAGE: mockPackageState }),
  useDispatch: () => mockDispatch,
}))

describe('AdminViewAIPackageModal', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
    mockPackageState = {
      loading: { detail: false },
      detail: {
        id: 'pkg1',
        name: 'Business Premium',
        description: 'A premium business package',
        type: 'Subscription',
        price: 2000000,
        tokenQuota: 500,
        isActive: true,
      },
      error: null,
    }
  })

  describe('Render', () => {
    it('should render without crashing when isOpen is true', async () => {
      await act(async () => {
        render(<AdminViewAIPackageModal isOpen={true} packageId="pkg1" onClose={mockOnClose} />)
      })
      expect(screen.getByText('Chi tiết gói AI')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', async () => {
      await act(async () => {
        render(<AdminViewAIPackageModal isOpen={false} packageId="pkg1" onClose={mockOnClose} />)
      })
      expect(screen.queryByText('Chi tiết gói AI')).not.toBeInTheDocument()
    })

    it('should display package name', async () => {
      await act(async () => {
        render(<AdminViewAIPackageModal isOpen={true} packageId="pkg1" onClose={mockOnClose} />)
      })
      expect(screen.getByText('Business Premium')).toBeInTheDocument()
    })

    it('should display package details', async () => {
      await act(async () => {
        render(<AdminViewAIPackageModal isOpen={true} packageId="pkg1" onClose={mockOnClose} />)
      })
      expect(screen.getByText('Giá gói')).toBeInTheDocument()
      expect(screen.getByText('Giới hạn AI')).toBeInTheDocument()
      expect(screen.getByText('Loại gói')).toBeInTheDocument()
      expect(screen.getByText('Trạng thái')).toBeInTheDocument()
    })

    it('should display active status', async () => {
      await act(async () => {
        render(<AdminViewAIPackageModal isOpen={true} packageId="pkg1" onClose={mockOnClose} />)
      })
      expect(screen.getByText('Đang hoạt động')).toBeInTheDocument()
    })

    it('should show loading state', async () => {
      mockPackageState.loading = { detail: true }
      mockPackageState.detail = null
      await act(async () => {
        render(<AdminViewAIPackageModal isOpen={true} packageId="pkg1" onClose={mockOnClose} />)
      })
      expect(screen.getByText('Đang tải dữ liệu...')).toBeInTheDocument()
    })
  })
})
