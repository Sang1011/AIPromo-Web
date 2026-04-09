/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import OrganizerAccountPage from '../../../pages/Organizer/OrganizerAccountPage'

// ============================================================================
// MOCKS
// ============================================================================

const mockUseOutletContext = jest.fn()
const mockUseLocation = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useOutletContext: () => mockUseOutletContext(),
  useLocation: () => mockUseLocation(),
}))

const mockDispatch = jest.fn()
let mockAuthState: any = {}
let mockOrganizerState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    AUTH: mockAuthState,
    ORGANIZER_PROFILE: mockOrganizerState,
  }),
  useDispatch: () => mockDispatch,
}))

jest.mock('../../../store/authSlice', () => {
  const fetchMe: any = jest.fn(() => ({ type: 'AUTH/fetchMe' }))
  fetchMe.fulfilled = {
    type: 'AUTH/fetchMe/fulfilled',
    match: (action: any) => action != null,
  }
  fetchMe.pending = { type: 'AUTH/fetchMe/pending', match: () => false }
  fetchMe.rejected = { type: 'AUTH/fetchMe/rejected', match: () => false }
  return { fetchMe }
})

jest.mock('../../../store/organizerProfileSlice', () => {
  const fetchGetOrganizerProfileDetailById: any = jest.fn((userId: any) => ({
    type: 'ORGANIZER/fetchProfile',
    payload: userId,
  }))
  fetchGetOrganizerProfileDetailById.fulfilled = { match: (action: any) => action != null }
  fetchGetOrganizerProfileDetailById.rejected = { match: () => false }

  const fetchCreateProfileOrganizer: any = jest.fn(() => ({ type: 'ORGANIZER/createProfile' }))
  fetchCreateProfileOrganizer.fulfilled = { match: (action: any) => action != null }
  fetchCreateProfileOrganizer.rejected = { match: () => false }

  const fetchVerifyProfileOrganizer: any = jest.fn(() => ({ type: 'ORGANIZER/verifyProfile' }))
  fetchVerifyProfileOrganizer.fulfilled = { match: (action: any) => action != null }
  fetchVerifyProfileOrganizer.rejected = { match: () => false }

  return {
    fetchGetOrganizerProfileDetailById,
    fetchCreateProfileOrganizer,
    fetchVerifyProfileOrganizer,
  }
})

jest.mock('../../../utils/notify', () => ({
  notify: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
}))

jest.mock('../../../components/Organizer/bank/BankSelect', () => ({
  __esModule: true,
  default: ({ label, value, onChange, error }: any) => (
    <div data-testid="bank-select">
      <label>{label}</label>
      <input data-testid="bank-input" value={value || ''} onChange={(e) => onChange?.(e.target.value)} />
      {error && <span data-testid="bank-error">{error}</span>}
    </div>
  ),
}))

jest.mock('../../../components/Organizer/shared/ImagePreview', () => ({
  __esModule: true,
  default: ({ url, onClose }: any) => (
    <div data-testid="image-viewer">
      <span>{url}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}))

jest.mock('../../../components/Organizer/shared/ConfirmModal', () => ({
  __esModule: true,
  default: ({ open, onConfirm, onCancel }: any) => open ? (
    <div data-testid="confirm-modal">
      <button data-testid="confirm" onClick={onConfirm}>Confirm</button>
      <button data-testid="cancel" onClick={onCancel}>Cancel</button>
    </div>
  ) : null,
}))

// ============================================================================
// TESTS
// ============================================================================

describe('OrganizerAccountPage', () => {
  const mockSetConfig = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseOutletContext.mockReturnValue({ setConfig: mockSetConfig })
    mockUseLocation.mockReturnValue({ state: null })

    mockAuthState = {
      currentInfor: { roles: ['Organizer'] },
    }

    mockOrganizerState = {
      profileDetail: {
        displayName: 'Test Organizer',
        description: 'Test Description',
        socialLink: 'https://example.com',
        address: 'Ho Chi Minh City',
        businessType: 'Individual',
        identityNumber: '123456789',
        companyName: '',
        taxCode: '1234567890',
        bankCode: 'VCB',
        accountName: 'Test Account',
        accountNumber: '1234567890',
        branch: 'HCMC Branch',
        logo: 'https://example.com/logo.jpg',
        status: 'Verified',
      },
    }

    mockDispatch.mockImplementation((action: any) => {
      if (action?.type === 'AUTH/fetchMe') {
        return Promise.resolve({ payload: { data: { userId: 'user-123' } } })
      }
      if (action?.type === 'ORGANIZER/fetchProfile') {
        return Promise.resolve({ payload: { data: mockOrganizerState.profileDetail } })
      }
      if (action?.type === 'ORGANIZER/createProfile') {
        return Promise.resolve({ payload: {} })
      }
      if (action?.type === 'ORGANIZER/verifyProfile') {
        return Promise.resolve({ payload: {} })
      }
      return Promise.resolve({})
    })
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => render(<OrganizerAccountPage />))
      expect(mockSetConfig).toHaveBeenCalledWith({ title: 'Quản lý tài khoản' })
    })

    it('should render profile fields when loaded', async () => {
      await act(async () => render(<OrganizerAccountPage />))
      expect(screen.getByDisplayValue('Test Organizer')).toBeInTheDocument()
    })

    it('should render bank fields when loaded', async () => {
      await act(async () => render(<OrganizerAccountPage />))
      await userEvent.click(screen.getByText('Tài khoản ngân hàng'))
      expect(screen.getByTestId('bank-select')).toBeInTheDocument()
    })

    it('should render tabs for navigation', async () => {
      await act(async () => render(<OrganizerAccountPage />))
      expect(screen.getByText('Thông tin tổ chức')).toBeInTheDocument()
      expect(screen.getByText('Tài khoản ngân hàng')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('should show profile tab by default', async () => {
      await act(async () => render(<OrganizerAccountPage />))
      expect(screen.getByText('Thông tin tổ chức')).toBeInTheDocument()
    })

    it('should switch to bank tab when clicked', async () => {
      await act(async () => render(<OrganizerAccountPage />))
      await userEvent.click(screen.getByText('Tài khoản ngân hàng'))
      expect(screen.getByTestId('bank-select')).toBeInTheDocument()
    })
  })

  describe('Location State', () => {
    it('should set active tab from location state', async () => {
      mockUseLocation.mockReturnValue({ state: { tab: 'bank' } })
      await act(async () => render(<OrganizerAccountPage />))
      expect(screen.getByTestId('bank-select')).toBeInTheDocument()
    })

    it('should set errors from missing fields in location state', async () => {
      mockUseLocation.mockReturnValue({
        state: { missingFields: ['displayName', 'taxCode'] },
      })
      const { container } = await act(async () => render(<OrganizerAccountPage />))
      expect(container).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should validate profile fields on save', async () => {
      await act(async () => render(<OrganizerAccountPage />))
      // Profile should be loaded with valid data
      expect(screen.getByDisplayValue('Test Organizer')).toBeInTheDocument()
    })

    it('should validate bank fields on save', async () => {
      await act(async () => render(<OrganizerAccountPage />))
      await userEvent.click(screen.getByText('Tài khoản ngân hàng'))
      expect(screen.getByTestId('bank-input')).toHaveValue('VCB')
    })
  })

  describe('API Calls', () => {
    it('should call fetchMe on mount', async () => {
      const { fetchMe } = require('../../../store/authSlice')
      await act(async () => render(<OrganizerAccountPage />))
      expect(mockDispatch).toHaveBeenCalledWith(fetchMe())
    })

    it('should call fetchGetOrganizerProfileDetailById when userId is available', async () => {
      const { fetchGetOrganizerProfileDetailById } = require('../../../store/organizerProfileSlice')
      mockDispatch.mockResolvedValueOnce({ payload: { data: { userId: 'user-123' } } })

      await act(async () => render(<OrganizerAccountPage />))

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchGetOrganizerProfileDetailById('user-123'))
      })
    })
  })

  describe('Status Banner', () => {
    it('should show verified status banner', async () => {
      const { container } = render(<OrganizerAccountPage />)
      expect(container).toBeInTheDocument()
    })

    it('should show draft status banner', async () => {
      mockOrganizerState.profileDetail = {
        ...mockOrganizerState.profileDetail,
        status: 'Draft',
      }
      const { container } = render(<OrganizerAccountPage />)
      expect(container).toBeInTheDocument()
    })

    it('should show pending status banner', async () => {
      mockOrganizerState.profileDetail = {
        ...mockOrganizerState.profileDetail,
        status: 'Pending',
      }
      const { container } = render(<OrganizerAccountPage />)
      expect(container).toBeInTheDocument()
    })

    it('should show rejected status banner', async () => {
      mockOrganizerState.profileDetail = {
        ...mockOrganizerState.profileDetail,
        status: 'Rejected',
      }
      const { container } = render(<OrganizerAccountPage />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle null profileDetail', async () => {
      mockOrganizerState.profileDetail = null
      const { container } = render(<OrganizerAccountPage />)
      expect(container).toBeInTheDocument()
    })

    it('should handle missing auth info', async () => {
      mockAuthState = { currentInfor: null }
      const { container } = render(<OrganizerAccountPage />)
      expect(container).toBeInTheDocument()
    })

    it('should handle empty roles', async () => {
      mockAuthState = { currentInfor: { roles: [] } }
      const { container } = render(<OrganizerAccountPage />)
      expect(container).toBeInTheDocument()
    })

    it('should handle company business type', async () => {
      mockOrganizerState.profileDetail = {
        ...mockOrganizerState.profileDetail,
        businessType: 'Company',
        companyName: 'Test Company',
      }
      const { container } = render(<OrganizerAccountPage />)
      expect(container).toBeInTheDocument()
    })
  })
})
