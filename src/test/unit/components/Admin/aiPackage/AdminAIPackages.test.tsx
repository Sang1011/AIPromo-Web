/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminAIPackages from '../../../../../components/Admin/aiPackage/AdminAIPackages'

const mockDispatch = jest.fn()
let mockPackageState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ PACKAGE: mockPackageState }),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-icons/md', () => ({
  MdAddCircle: () => <span data-testid="icon-add" />,
  MdRefresh: () => <span data-testid="icon-refresh" />,
  MdTrendingUp: () => <span data-testid="icon-trending" />,
}))

jest.mock('../../../../../components/Admin/aiPackage/AdminCreateAIPackageModal', () => ({
  __esModule: true,
  default: ({ isOpen }: any) => isOpen ? <div data-testid="create-modal" /> : null,
}))

jest.mock('../../../../../components/Admin/aiPackage/AdminDeletePackageConfirmModal', () => ({
  __esModule: true,
  default: ({ isOpen }: any) => isOpen ? <div data-testid="delete-modal" /> : null,
}))

jest.mock('../../../../../components/Admin/aiPackage/AdminEditAIPackageModal', () => ({
  __esModule: true,
  default: ({ isOpen }: any) => isOpen ? <div data-testid="edit-modal" /> : null,
}))

jest.mock('../../../../../components/Admin/aiPackage/AdminToggleStatusConfirmModal', () => ({
  __esModule: true,
  default: ({ isOpen }: any) => isOpen ? <div data-testid="toggle-modal" /> : null,
}))

jest.mock('../../../../../components/Admin/aiPackage/AdminViewAIPackageModal', () => ({
  __esModule: true,
  default: ({ isOpen }: any) => isOpen ? <div data-testid="view-modal" /> : null,
}))

jest.mock('../../../../../components/Admin/aiPackage/AdminPlanCard', () => ({
  __esModule: true,
  default: ({ pkg }: any) => <div data-testid="plan-card">{pkg.name}</div>,
}))

jest.mock('../../../../../pages/Organizer/SubscriptionPage', () => ({
  SectionTitle: ({ children }: any) => <h2 data-testid="section-title">{children}</h2>,
}))

describe('AdminAIPackages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
    mockPackageState = {
      list: [
        { id: '1', name: 'Basic', type: 'Subscription', price: 1000000, tokenQuota: 100, description: 'Basic plan', isActive: true },
        { id: '2', name: 'TopUp Pack', type: 'TopUp', price: 500000, tokenQuota: 500, description: 'Top up pack', isActive: true },
      ],
      loading: { list: false, overview: false },
      overview: {
        totalRevenue: { value: 50000000, monthlyGrowthRate: 10, isPositiveGrowth: true },
        mostActivePackage: { packageName: 'Basic', organizationsUsing: 5 },
      },
    }
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<AdminAIPackages />)
      })
      expect(screen.getByText('Quản lý gói AI')).toBeInTheDocument()
    })

    it('should show loading skeleton when loading', async () => {
      mockPackageState.loading = { list: true, overview: false }
      mockPackageState.list = []
      await act(async () => {
        render(<AdminAIPackages />)
      })
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('should display create button', async () => {
      await act(async () => {
        render(<AdminAIPackages />)
      })
      expect(screen.getByText('Tạo gói mới')).toBeInTheDocument()
    })

    it('should display section titles', async () => {
      await act(async () => {
        render(<AdminAIPackages />)
      })
      expect(screen.getByText('Subscription Plans')).toBeInTheDocument()
      expect(screen.getByText('TopUp Packages')).toBeInTheDocument()
    })

    it('should display package cards', async () => {
      await act(async () => {
        render(<AdminAIPackages />)
      })
      expect(screen.getAllByTestId('plan-card').length).toBe(2)
    })
  })
})
