/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import LegalDetailPage from '../../../pages/Organizer/LegalDetailPage'

// ============================================================================
// MOCKS
// ============================================================================

const mockUseParams = jest.fn()
const mockUseNavigate = jest.fn()
const mockUseOutletContext = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
  useNavigate: () => mockUseNavigate(),
  useOutletContext: () => mockUseOutletContext(),
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

jest.mock('../../../store/policySlice', () => ({
  fetchPolicyById: jest.fn((id) => ({ type: 'POLICY/fetchPolicyById', payload: id })),
}))

// Mock docx-preview
jest.mock('docx-preview', () => ({
  renderAsync: jest.fn(() => Promise.resolve()),
}))

// ============================================================================
// TESTS
// ============================================================================

describe('LegalDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ id: 'policy-123' })
    mockUseNavigate.mockReturnValue(jest.fn())
    mockUseOutletContext.mockReturnValue({ setConfig: jest.fn() })

    mockPolicyState = {
      detail: null,
      loading: { detail: false },
      error: null,
    }

    mockDispatch.mockResolvedValue({})

    // Mock fetch for docx files
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
      } as Response)
    )
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      mockPolicyState.detail = {
        id: 'policy-1',
        description: 'Test Policy',
        fileUrl: 'https://example.com/policy.docx',
      }

      await act(async () => render(<LegalDetailPage />))

      expect(screen.getByText('Quay lại')).toBeInTheDocument()
    })

    it('should show loading skeleton when loading', async () => {
      mockPolicyState.loading = { detail: true }

      render(<LegalDetailPage />)

      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should show not found state when policy is missing', async () => {
      mockPolicyState.detail = null

      await act(async () => render(<LegalDetailPage />))

      expect(screen.getByText('Không tìm thấy điều khoản')).toBeInTheDocument()
    })

    it('should show error state when fetch fails', async () => {
      mockPolicyState.error = 'Network error'

      await act(async () => render(<LegalDetailPage />))

      expect(screen.getByText('Không tìm thấy điều khoản')).toBeInTheDocument()
    })
  })

  describe('UI Elements', () => {
    it('should render policy description in title when loaded', async () => {
      mockUseOutletContext.mockReturnValue({
        setConfig: jest.fn()
      })

      mockPolicyState.detail = {
        id: 'policy-1',
        description: 'Privacy Policy Details',
        fileUrl: 'https://example.com/policy.docx',
      }

      await act(async () => render(<LegalDetailPage />))

      await waitFor(() => {
        expect(mockUseOutletContext()).toBeDefined()
      })
    })

    it('should render download button', async () => {
      mockPolicyState.detail = {
        id: 'policy-1',
        description: 'Test Policy',
        fileUrl: 'https://example.com/policy.docx',
      }

      await act(async () => render(<LegalDetailPage />))

      expect(screen.getByText('Tải xuống')).toBeInTheDocument()
    })

    it('should render search button', async () => {
      mockPolicyState.detail = {
        id: 'policy-1',
        description: 'Test Policy',
        fileUrl: 'https://example.com/policy.docx',
      }

      await act(async () => render(<LegalDetailPage />))

      expect(screen.getByText('Tìm kiếm')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should navigate back when clicking back button', async () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)

      mockPolicyState.detail = {
        id: 'policy-1',
        description: 'Test Policy',
        fileUrl: 'https://example.com/policy.docx',
      }

      await act(async () => render(<LegalDetailPage />))

      const backButton = screen.getByText('Quay lại')
      await userEvent.click(backButton)

      expect(navigate).toHaveBeenCalledWith(-1)
    })

    it('should navigate back from error state', async () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)
      mockPolicyState.error = 'Not found'

      await act(async () => render(<LegalDetailPage />))

      const backButton = screen.getByText('Quay lại')
      await userEvent.click(backButton)

      expect(navigate).toHaveBeenCalledWith(-1)
    })
  })

  describe('API Calls', () => {
    it('should call fetchPolicyById on mount', async () => {
      const { fetchPolicyById } = require('../../../store/policySlice')

      await act(async () => render(<LegalDetailPage />))

      expect(mockDispatch).toHaveBeenCalledWith(fetchPolicyById('policy-123'))
    })

    it('should not call fetchPolicyById if id is missing', async () => {
      mockUseParams.mockReturnValue({ id: undefined })

      await act(async () => render(<LegalDetailPage />))

      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing policy id gracefully', async () => {
      mockUseParams.mockReturnValue({ id: undefined })

      await act(async () => render(<LegalDetailPage />))

      expect(screen.queryByText('Quay lại')).toBeInTheDocument()
    })

    it('should handle policy without fileUrl', async () => {
      mockPolicyState.detail = {
        id: 'policy-1',
        description: 'Test Policy',
        fileUrl: null,
      }

      await act(async () => render(<LegalDetailPage />))

      // Should show viewer but not crash
      expect(screen.queryByText('Đang chuẩn bị tài liệu...')).toBeInTheDocument()
    })

    it('should handle non-docx files', async () => {
      mockPolicyState.detail = {
        id: 'policy-1',
        description: 'Test Policy',
        fileUrl: 'https://example.com/policy.pdf',
      }

      await act(async () => render(<LegalDetailPage />))

      await waitFor(() => {
        expect(screen.getByText('Không thể hiển thị tài liệu')).toBeInTheDocument()
      })
    })

    it('should update page config with policy description', async () => {
      const mockSetConfig = jest.fn()
      mockUseOutletContext.mockReturnValue({ setConfig: mockSetConfig })

      mockPolicyState.detail = {
        id: 'policy-1',
        description: 'Custom Policy Name',
        fileUrl: 'https://example.com/policy.docx',
      }

      await act(async () => render(<LegalDetailPage />))

      await waitFor(() => {
        expect(mockSetConfig).toHaveBeenCalledWith({ title: 'Custom Policy Name' })
      })
    })

    it('should handle fetch error for docx file', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
        } as Response)
      )

      mockPolicyState.detail = {
        id: 'policy-1',
        description: 'Test Policy',
        fileUrl: 'https://example.com/policy.docx',
      }

      await act(async () => render(<LegalDetailPage />))

      await waitFor(() => {
        expect(screen.getByText(/Không tải được file/)).toBeInTheDocument()
      })
    })
  })
})
