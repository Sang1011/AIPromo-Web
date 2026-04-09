/// <reference types="jest" />
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import LegalPage from '../../../pages/Organizer/LegalPage'

// ============================================================================
// MOCKS
// ============================================================================

const mockUseOutletContext = jest.fn()
const mockUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useOutletContext: () => mockUseOutletContext(),
  useNavigate: () => mockUseNavigate(),
}))

const mockDispatch = jest.fn()
let mockPolicyState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    POLICY: mockPolicyState,
  }),
  useDispatch: () => mockDispatch,
}))

jest.mock('../../store/policySlice', () => ({
  fetchAllPolicies: jest.fn(() => ({ type: 'POLICY/fetchAllPolicies' })),
}))

// ============================================================================
// TESTS
// ============================================================================

describe('LegalPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseOutletContext.mockReturnValue({ setConfig: jest.fn() })
    mockUseNavigate.mockReturnValue(jest.fn())
    mockPolicyState = { list: [], loading: false, error: null }
    mockDispatch.mockResolvedValue({})
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => render(<LegalPage />))
      expect(screen.queryByTestId('checkin-skeleton')).not.toBeInTheDocument()
    })

    it('should show loading skeletons when loading', async () => {
      mockPolicyState.loading = true
      render(<LegalPage />)
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBe(3)
    })

    it('should show empty state when no policies', async () => {
      mockPolicyState.list = []
      await act(async () => render(<LegalPage />))
      expect(screen.getByText('Chưa có điều khoản nào')).toBeInTheDocument()
    })

    it('should show error state when fetch fails', async () => {
      mockPolicyState.error = 'Network error'
      await act(async () => render(<LegalPage />))
      expect(screen.getByText('Không thể tải danh sách điều khoản')).toBeInTheDocument()
    })
  })

  describe('UI Elements', () => {
    it('should render policy list when available', async () => {
      mockPolicyState.list = [
        { id: '1', description: 'Terms of Service', type: 'TERMS' },
        { id: '2', description: 'Privacy Policy', type: 'PRIVACY' },
      ]

      await act(async () => render(<LegalPage />))

      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    })

    it('should render policy type labels', async () => {
      mockPolicyState.list = [{ id: '1', description: 'Test Policy', type: 'TERMS' }]
      await act(async () => render(<LegalPage />))
      expect(screen.getByText('TERMS')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should navigate to legal detail when clicking policy', async () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)
      mockPolicyState.list = [{ id: 'policy-123', description: 'Test Policy', type: 'TERMS' }]

      await act(async () => render(<LegalPage />))

      const policyButton = screen.getByText('Test Policy').closest('button')
      await userEvent.click(policyButton!)

      expect(navigate).toHaveBeenCalledWith('/organizer/legals/policy-123')
    })

    it('should retry fetching on error', async () => {
      const { fetchAllPolicies } = require('../../store/policySlice')
      mockPolicyState.error = 'Network error'

      await act(async () => render(<LegalPage />))

      const retryButton = screen.getByText('Thử lại')
      await userEvent.click(retryButton)

      expect(mockDispatch).toHaveBeenCalledWith(fetchAllPolicies())
    })
  })

  describe('API Calls', () => {
    it('should call fetchAllPolicies on mount', async () => {
      const { fetchAllPolicies } = require('../../store/policySlice')
      await act(async () => render(<LegalPage />))
      expect(mockDispatch).toHaveBeenCalledWith(fetchAllPolicies())
    })
  })

  describe('Edge Cases', () => {
    it('should handle policies with missing fields', async () => {
      mockPolicyState.list = [{ id: '1' }]
      await act(async () => render(<LegalPage />))
      expect(screen.queryByTestId('checkin-skeleton')).not.toBeInTheDocument()
    })

    it('should update page config on mount', async () => {
      const mockSetConfig = jest.fn()
      mockUseOutletContext.mockReturnValue({ setConfig: mockSetConfig })

      await act(async () => render(<LegalPage />))

      expect(mockSetConfig).toHaveBeenCalledWith({ title: 'Điều khoản cho Ban Tổ Chức' })
    })
  })
})
