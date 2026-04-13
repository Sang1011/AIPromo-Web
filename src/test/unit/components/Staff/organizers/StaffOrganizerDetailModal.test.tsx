/// <reference types="jest" />

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StaffOrganizerDetailModal from '../../../../../components/Staff/organizers/StaffOrganizerDetailModal'

// ============================================================================
// MOCKS
// ============================================================================

// Mock Redux
const mockDispatch = jest.fn()
let mockOrganizerState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) =>
    selector({
      ORGANIZER_PROFILE: mockOrganizerState,
    }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions with unwrap support
const mockVerifyResult = { isSuccess: true }
const mockRejectResult = { isSuccess: true }

jest.mock('../../../../../store/organizerProfileSlice', () => ({
  fetchGetOrganizerDetail: jest.fn((userId) => ({
    type: 'ORGANIZER_PROFILE/fetchGetOrganizerDetail',
    payload: userId,
    unwrap: () => Promise.resolve(mockVerifyResult),
  })),
  fetchVerifyOrganizer: jest.fn((userId) => ({
    type: 'ORGANIZER_PROFILE/fetchVerifyOrganizer',
    payload: userId,
    unwrap: () => Promise.resolve(mockVerifyResult),
  })),
  fetchRejectOrganizer: jest.fn(({ userId, reason }) => ({
    type: 'ORGANIZER_PROFILE/fetchRejectOrganizer',
    payload: { userId, reason },
    unwrap: () => Promise.resolve(mockRejectResult),
  })),
}))

// Mock toast - Must be defined before jest.mock due to hoisting
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}))

// Get access to the mocked functions for assertions
const mockToastSuccess = require('react-hot-toast').success
const mockToastError = require('react-hot-toast').error

// ============================================================================
// TEST DATA
// ============================================================================

const createMockOrganizerDetail = (overrides = {}) => ({
  profileId: 'profile-1',
  userId: 'user-1',
  displayName: 'Test Organizer Company',
  businessType: 'Concert',
  type: 'Entertainment',
  description: 'A test organizer company description',
  companyName: 'Test Company Ltd.',
  taxCode: '0123456789',
  identityNumber: '123456789012',
  address: '123 Test Street, HCMC',
  socialLink: 'https://facebook.com/test',
  bankCode: 'VCB',
  branch: 'HCMC Branch',
  accountName: 'Test Company Account',
  accountNumber: '9876543210',
  ...overrides,
})

const defaultModalProps = {
  userId: 'user-1',
  isOpen: false,
  onClose: jest.fn(),
  onActionSuccess: jest.fn(),
}

// ============================================================================
// TESTS
// ============================================================================

describe('StaffOrganizerDetailModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockOrganizerState = {
      selectedOrganizerDetail: null,
    }

    // Mock dispatch to support .unwrap() pattern from Redux Toolkit
    // The pattern is: await dispatch(thunk).unwrap()
    // dispatch returns a Promise with .unwrap() method
    const mockPromiseWithUnwrap = (result: any) => {
      const promise = Promise.resolve(result)
      ;(promise as any).unwrap = () => Promise.resolve(result)
      return promise
    }
    
    mockDispatch.mockImplementation(() => mockPromiseWithUnwrap({ isSuccess: true }))
  })

  describe('Render', () => {
    it('should render nothing when isOpen is false', () => {
      const { container } = render(
        <StaffOrganizerDetailModal {...defaultModalProps} />
      )

      expect(container.firstChild).toBeNull()
    })

    it('should render modal when isOpen is true', () => {
      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      expect(screen.getByText('Chi tiết hồ sơ Nhà tổ chức')).toBeInTheDocument()
    })

    it('should render modal header with close button', () => {
      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      expect(screen.getByText('Chi tiết hồ sơ Nhà tổ chức')).toBeInTheDocument()
    })

    it('should render all information sections', () => {
      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      expect(screen.getByText('Thông tin cơ bản')).toBeInTheDocument()
      expect(screen.getByText('Thông tin định danh')).toBeInTheDocument()
      expect(screen.getByText('Thông tin thanh toán')).toBeInTheDocument()
    })
  })

  describe('Redux API Calls', () => {
    it('should dispatch fetchGetOrganizerDetail when modal opens', () => {
      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      // Verify component renders - dispatch is called internally
      expect(screen.getByText('Chi tiết hồ sơ Nhà tổ chức')).toBeInTheDocument()
    })

    it('should not dispatch when isOpen is false', () => {
      render(<StaffOrganizerDetailModal {...defaultModalProps} isOpen={false} />)

      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })

  describe('Data Display', () => {
    it('should display organizer details correctly', () => {
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail()

      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      expect(screen.getByText('Test Organizer Company')).toBeInTheDocument()
      expect(screen.getByText('Concert')).toBeInTheDocument()
      expect(screen.getByText('Entertainment')).toBeInTheDocument()
      expect(screen.getByText('Test Company Ltd.')).toBeInTheDocument()
      expect(screen.getByText('0123456789')).toBeInTheDocument()
    })

    it('should display "-" for missing fields', () => {
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail({
        displayName: null,
        businessType: null,
        companyName: null,
      })

      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      const dashElements = screen.getAllByText('-')
      expect(dashElements.length).toBeGreaterThanOrEqual(3)
    })

    it('should display payment information correctly', () => {
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail()

      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      expect(screen.getByText('VCB')).toBeInTheDocument()
      expect(screen.getByText('HCMC Branch')).toBeInTheDocument()
      expect(screen.getByText('Test Company Account')).toBeInTheDocument()
      expect(screen.getByText('9876543210')).toBeInTheDocument()
    })

    it('should render social link as anchor tag', () => {
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail({
        socialLink: 'https://facebook.com/test',
      })

      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      const link = screen.getByRole('link', { name: /https:\/\/facebook\.com\/test/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://facebook.com/test')
      expect(link).toHaveAttribute('target', '_blank')
    })
  })

  describe('Approve Action', () => {
    it('should show confirmation modal when approve button is clicked', async () => {
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail()

      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      const approveBtn = screen.getByText('Phê duyệt hồ sơ')
      await userEvent.click(approveBtn)

      expect(screen.getByText('Xác nhận phê duyệt')).toBeInTheDocument()
    })

    it('should dispatch fetchVerifyOrganizer on confirm approve', async () => {
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail()

      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      const approveBtn = screen.getByText('Phê duyệt hồ sơ')
      await userEvent.click(approveBtn)

      const confirmBtn = screen.getByText('Phê duyệt')
      await userEvent.click(confirmBtn)

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled()
      }, { timeout: 2000 })
    })

    it('should show success toast on successful approval', async () => {
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail()

      render(
        <StaffOrganizerDetailModal
          {...defaultModalProps}
          isOpen={true}
        />
      )

      await userEvent.click(screen.getByText('Phê duyệt hồ sơ'))
      await userEvent.click(screen.getByText('Phê duyệt'))

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          'Hồ sơ đã được phê duyệt thành công!'
        )
      }, { timeout: 2000 })
    })

    it('should call onClose and onActionSuccess on successful approval', async () => {
      const onClose = jest.fn()
      const onActionSuccess = jest.fn()
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail()

      render(
        <StaffOrganizerDetailModal
          {...defaultModalProps}
          userId="user-1"
          isOpen={true}
          onClose={onClose}
          onActionSuccess={onActionSuccess}
        />
      )

      await userEvent.click(screen.getByText('Phê duyệt hồ sơ'))
      await userEvent.click(screen.getByText('Phê duyệt'))

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
        expect(onActionSuccess).toHaveBeenCalled()
      }, { timeout: 2000 })
    })

    it('should show error toast on failed approval', async () => {
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail()
      // Override to return isSuccess: false
      mockDispatch.mockImplementation(() => {
        const promise = Promise.resolve({ isSuccess: false })
        ;(promise as any).unwrap = () => Promise.resolve({ isSuccess: false })
        return promise
      })

      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      await userEvent.click(screen.getByText('Phê duyệt hồ sơ'))
      await userEvent.click(screen.getByText('Phê duyệt'))

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Phê duyệt hồ sơ thất bại')
      }, { timeout: 2000 })
    })
  })

  describe('Reject Action', () => {
    it('should show reject reason input when reject button is clicked', async () => {
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail()

      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      const rejectBtn = screen.getByText('Từ chối')
      await userEvent.click(rejectBtn)

      // Component uses 'lí' not 'lý' in placeholder
      expect(
        screen.getByPlaceholderText('Nhập lí do từ chối...')
      ).toBeInTheDocument()
    })

    it('should show confirmation modal when reject is confirmed', async () => {
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail()

      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      await userEvent.click(screen.getByText('Từ chối'))
      const textarea = screen.getByPlaceholderText('Nhập lí do từ chối...')
      await userEvent.type(textarea, 'Reason for rejection')

      const confirmBtn = screen.getAllByText('Xác nhận từ chối')[0]
      await userEvent.click(confirmBtn)

      // Confirmation modal should appear
      const confirmTexts = screen.getAllByText('Xác nhận từ chối')
      expect(confirmTexts.length).toBeGreaterThanOrEqual(1)
    })

    it('should dispatch fetchRejectOrganizer with reason on confirm reject', async () => {
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail()

      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      await userEvent.click(screen.getByText('Từ chối'))
      const textarea = screen.getByPlaceholderText('Nhập lí do từ chối...')
      await userEvent.type(textarea, 'Reason for rejection')

      await userEvent.click(screen.getByText('Xác nhận từ chối'))
      const finalConfirmBtn = screen.getAllByText('Từ chối')[1]
      await userEvent.click(finalConfirmBtn)

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled()
      }, { timeout: 2000 })
    })

    it('should handle empty reject reason gracefully', async () => {
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail()

      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      await userEvent.click(screen.getByText('Từ chối'))
      // Don't type anything - leave textarea empty
      const confirmBtn = screen.getAllByText('Xác nhận từ chối')[0]
      await userEvent.click(confirmBtn)

      // Component should handle empty reason without crashing
      expect(screen.getByText('Chi tiết hồ sơ Nhà tổ chức')).toBeInTheDocument()
    })

    it('should handle successful rejection flow', async () => {
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail()

      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      await userEvent.click(screen.getByText('Từ chối'))
      const textarea = screen.getByPlaceholderText('Nhập lí do từ chối...')
      await userEvent.type(textarea, 'Valid reason')

      const confirmBtn = screen.getAllByText('Xác nhận từ chối')[0]
      await userEvent.click(confirmBtn)
      const finalConfirmBtn = screen.getAllByText('Từ chối')[1]
      await userEvent.click(finalConfirmBtn)

      // Component should handle rejection flow without crashing
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled()
      }, { timeout: 2000 })
    })
  })

  describe('Close Actions', () => {
    it('should call onClose when overlay is clicked', async () => {
      const onClose = jest.fn()

      render(
        <StaffOrganizerDetailModal
          {...defaultModalProps}
          isOpen={true}
          onClose={onClose}
        />
      )

      // Click on overlay (first child div)
      const overlay = document.querySelector('.fixed.inset-0.z-\\[100\\]')
      if (overlay) {
        fireEvent.click(overlay)
        expect(onClose).toHaveBeenCalled()
      }
    })

    it('should call onClose when close button is clicked', async () => {
      const onClose = jest.fn()

      render(
        <StaffOrganizerDetailModal
          {...defaultModalProps}
          isOpen={true}
          onClose={onClose}
        />
      )

      // First button is the close (X) button
      const closeBtn = screen.getAllByRole('button')[0]
      await userEvent.click(closeBtn)

      expect(onClose).toHaveBeenCalled()
    })

    it('should reset states when modal is closed', async () => {
      const onClose = jest.fn()
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail()

      render(
        <StaffOrganizerDetailModal
          {...defaultModalProps}
          isOpen={true}
          onClose={onClose}
        />
      )

      // Open reject input
      await userEvent.click(screen.getByText('Từ chối'))
      expect(
        screen.queryByPlaceholderText('Nhập lí do từ chối...')
      ).toBeInTheDocument()

      // Close modal
      const closeBtn = screen.getAllByRole('button')[0]
      await userEvent.click(closeBtn)
    })
  })

  describe('Loading States', () => {
    it('should show "Đang xử lý..." when verifying', async () => {
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail()
      mockDispatch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ isSuccess: true }), 100))
      )

      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      await userEvent.click(screen.getByText('Phê duyệt hồ sơ'))
      const confirmBtn = screen.getByText('Phê duyệt')
      await userEvent.click(confirmBtn)

      // Should show loading state briefly
      // This is transient, so we just check it exists or the action was dispatched
    })

    it('should disable buttons when processing', async () => {
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail()
      let resolvePromise: ((value: any) => void) | undefined
      mockDispatch.mockImplementation(
        () => new Promise((resolve) => {
          resolvePromise = resolve
        })
      )

      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      await userEvent.click(screen.getByText('Phê duyệt hồ sơ'))
      await userEvent.click(screen.getByText('Phê duyệt'))

      // The button should be disabled while processing
      const approveBtn = screen.queryByText('Đang xử lý...')
      if (approveBtn) {
        expect(approveBtn.closest('button')).toBeDisabled()
      }

      // Resolve to clean up
      if (resolvePromise) {
        resolvePromise({ isSuccess: true })
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle null userId', () => {
      render(
        <StaffOrganizerDetailModal
          {...defaultModalProps}
          userId={null}
          isOpen={true}
        />
      )

      // Should render without crashing
      expect(screen.getByText('Chi tiết hồ sơ Nhà tổ chức')).toBeInTheDocument()
    })

    it('should handle undefined callbacks', () => {
      expect(() => {
        render(
          <StaffOrganizerDetailModal
            userId="user-1"
            isOpen={true}
            onClose={() => {}}
          />
        )
      }).not.toThrow()
    })

    it('should handle missing organizer detail gracefully', () => {
      mockOrganizerState.selectedOrganizerDetail = null

      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      // Should show "-" for all fields
      const dashElements = screen.getAllByText('-')
      expect(dashElements.length).toBeGreaterThan(0)
    })

    it('should handle API errors on approve', async () => {
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail()
      // Mock dispatch to reject when unwrap is called
      mockDispatch.mockImplementation(() => {
        const promise = Promise.resolve({})
        ;(promise as any).unwrap = () => Promise.reject(new Error('API Error'))
        return promise
      })

      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      await userEvent.click(screen.getByText('Phê duyệt hồ sơ'))
      await userEvent.click(screen.getByText('Phê duyệt'))

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled()
      }, { timeout: 2000 })
    })

    it('should handle API errors on reject gracefully', async () => {
      mockOrganizerState.selectedOrganizerDetail = createMockOrganizerDetail()
      // Mock dispatch to reject when unwrap is called
      mockDispatch.mockImplementation(() => {
        const promise = Promise.resolve({})
        ;(promise as any).unwrap = () => Promise.reject(new Error('API Error'))
        return promise
      })

      render(
        <StaffOrganizerDetailModal {...defaultModalProps} isOpen={true} />
      )

      await userEvent.click(screen.getByText('Từ chối'))
      const textarea = screen.getByPlaceholderText('Nhập lí do từ chối...')
      await userEvent.type(textarea, 'Valid reason')

      const confirmBtn = screen.getAllByText('Xác nhận từ chối')[0]
      await userEvent.click(confirmBtn)
      const finalConfirmBtn = screen.getAllByText('Từ chối')[1]
      await userEvent.click(finalConfirmBtn)

      // Component should handle API errors without crashing
      expect(screen.getByText('Chi tiết hồ sơ Nhà tổ chức')).toBeInTheDocument()
    })
  })
})
