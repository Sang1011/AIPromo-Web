/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminUserManagementTable from '../../../../../components/Admin/users/AdminUserManagementTable'

const mockDispatch = jest.fn()
let mockUserState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ USER: mockUserState }),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-icons/md', () => ({
  MdPersonAdd: () => <span data-testid="icon-add" />,
  MdMoreVert: () => <span data-testid="icon-more" />,
}))

jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
}))

jest.mock('../../../../../components/Admin/users/CreateStaffUserModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: any) => isOpen ? <div data-testid="create-modal" onClick={onClose}>Modal</div> : null,
}))

jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader" />,
}))

describe('AdminUserManagementTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    })
    mockUserState = {
      users: [
        {
          userId: '1',
          firstName: 'John',
          lastName: 'Doe',
          userName: 'johndoe',
          email: 'john@example.com',
          roles: ['Admin'],
          status: 'Active',
          birthday: '1990-01-01',
        },
      ],
      pagination: { totalCount: 1 },
      loading: false,
    }
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<AdminUserManagementTable />)
      })
      expect(screen.getByText('Quản lý Người dùng')).toBeInTheDocument()
    })

    it('should show loading state', async () => {
      mockUserState.loading = true
      await act(async () => {
        render(<AdminUserManagementTable />)
      })
      expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('should show add user button', async () => {
      await act(async () => {
        render(<AdminUserManagementTable />)
      })
      expect(screen.getByText('Thêm người dùng')).toBeInTheDocument()
    })

    it('should render table headers', async () => {
      await act(async () => {
        render(<AdminUserManagementTable />)
      })
      expect(screen.getByText('Người dùng')).toBeInTheDocument()
      expect(screen.getByText('Vai trò')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('should open create modal when add button clicked', async () => {
      await act(async () => {
        render(<AdminUserManagementTable />)
      })
      const addBtn = screen.getByText('Thêm người dùng')
      await act(async () => {
        addBtn.click()
      })
      expect(screen.getByTestId('create-modal')).toBeInTheDocument()
    })
  })
})
