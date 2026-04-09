/// <reference types="jest" />
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Step4Policy from '../../../../../components/Organizer/steps/Step4Policy'

// Mock Redux
const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('../../../../../store/eventSlice', () => ({
  fetchUpdateEventPolicy: jest.fn(() => ({ type: 'EVENT/updatePolicy', payload: {} })),
  fetchRequestPublishEvent: jest.fn(() => ({ type: 'EVENT/publish', payload: {} })),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}))

jest.mock('../../../../../utils/notify', () => ({
  notify: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
}))

jest.mock('../../../../../components/Organizer/shared/UnsavedBanner', () => ({
  __esModule: true,
  UnsavedBanner: ({ saving, onSave }: any) => (
    <div data-testid="unsaved-banner">
      <button data-testid="save-banner" onClick={onSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  ),
}))

describe('Step4Policy', () => {
  const mockOnBack = jest.fn()
  const mockNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockResolvedValue({})
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }))
  })

  describe('Render', () => {
    it('should render policy editor', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate />))
      expect(screen.getByText(/Chính sách sự kiện/)).toBeInTheDocument()
    })

    it('should render default policy sections', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate />))
      expect(screen.getByText('Điều kiện tham dự')).toBeInTheDocument()
      expect(screen.getByText('Chính sách check-in')).toBeInTheDocument()
      expect(screen.getByText('Chính sách chuyển nhượng vé')).toBeInTheDocument()
      expect(screen.getByText('Điều khoản trách nhiệm')).toBeInTheDocument()
    })

    it('should render policy items', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate />))
      expect(screen.getByText(/Người tham dự phải mang theo vé/)).toBeInTheDocument()
    })

    it('should render add section button', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate />))
      expect(screen.getByText(/Thêm điều khoản/)).toBeInTheDocument()
    })

    it('should render agreement checkbox', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate />))
      expect(screen.getByText(/Tôi đồng ý/)).toBeInTheDocument()
    })

    it('should render action buttons', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate />))
      expect(screen.getByText('Quay lại')).toBeInTheDocument()
      expect(screen.getByText('Lưu lại')).toBeInTheDocument()
    })

    it('should render publish button for Draft events', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate eventData={{ status: 'Draft' } as any} />))
      expect(screen.getByText(/Lưu và gửi yêu cầu duyệt/)).toBeInTheDocument()
    })
  })

  describe('Policy Sections', () => {
    it('should render section titles as editable inputs', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate />))
      const titleInputs = screen.getAllByPlaceholderText('Tiêu đề điều khoản...')
      expect(titleInputs.length).toBeGreaterThanOrEqual(4)
    })

    it('should render policy items as editable inputs', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate />))
      const itemInputs = screen.getAllByPlaceholderText('Nội dung điều khoản...')
      expect(itemInputs.length).toBeGreaterThan(0)
    })

    it('should allow editing section titles', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate />))
      const titleInput = screen.getByDisplayValue('Điều kiện tham dự')
      await userEvent.clear(titleInput)
      await userEvent.type(titleInput, 'New Title')
      expect(titleInput).toHaveValue('New Title')
    })

    it('should allow editing policy items', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate />))
      const firstItem = screen.getByDisplayValue(/Người tham dự phải mang theo vé/)
      await userEvent.clear(firstItem)
      await userEvent.type(firstItem, 'Updated policy text')
      expect(firstItem).toHaveValue('Updated policy text')
    })

    it('should allow adding new items to sections', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate />))
      const addItemButtons = screen.getAllByText('+ Thêm dòng')
      await userEvent.click(addItemButtons[0])
      // Should add new empty item
    })

    it('should allow removing items from sections', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate />))
      const removeButtons = screen.getAllByText('×')
      await userEvent.click(removeButtons[0])
    })

    it('should allow adding new sections', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate />))
      const addSectionButton = screen.getByText('+ Thêm điều khoản')
      await userEvent.click(addSectionButton)
      // Should add new section
    })

    it('should allow removing sections', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate />))
      const removeSectionButtons = screen.getAllByText('Xóa mục')
      await userEvent.click(removeSectionButtons[0])
    })
  })

  describe('Validation', () => {
    it('should show warning for empty section title', async () => {
      const { notify } = require('../../../../../utils/notify')
      await act(async () => render(<Step4Policy isAllowUpdate />))
      const titleInput = screen.getByDisplayValue('Điều kiện tham dự')
      await userEvent.clear(titleInput)
      const saveButton = screen.getByText('Lưu lại')
      await userEvent.click(saveButton)
      await waitFor(() => {
        expect(notify.warning).toHaveBeenCalledWith('Tiêu đề điều khoản không được để trống')
      })
    })

    it('should show warning for empty policy item', async () => {
      const { notify } = require('../../../../../utils/notify')
      await act(async () => render(<Step4Policy isAllowUpdate />))
      const firstItem = screen.getByDisplayValue(/Người tham dự phải mang theo vé/)
      await userEvent.clear(firstItem)
      const saveButton = screen.getByText('Lưu lại')
      await userEvent.click(saveButton)
      await waitFor(() => {
        expect(notify.warning).toHaveBeenCalledWith('Nội dung điều khoản không được để trống')
      })
    })
  })

  describe('Form Submission', () => {
    it('should dispatch update policy when saving', async () => {
      const { fetchUpdateEventPolicy } = require('../../../../../store/eventSlice')
      await act(async () => render(<Step4Policy isAllowUpdate />))
      const saveButton = screen.getByText('Lưu lại')
      await userEvent.click(saveButton)
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchUpdateEventPolicy(expect.any(Object)))
      })
    })

    it('should call onBack when clicking back', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate onBack={mockOnBack} />))
      const backButton = screen.getByText('Quay lại')
      await userEvent.click(backButton)
      expect(mockOnBack).toHaveBeenCalled()
    })

    it('should show success notification after save', async () => {
      const { notify } = require('../../../../../utils/notify')
      await act(async () => render(<Step4Policy isAllowUpdate />))
      const saveButton = screen.getByText('Lưu lại')
      await userEvent.click(saveButton)
      await waitFor(() => {
        expect(notify.success).toHaveBeenCalledWith('Lưu chính sách thành công!')
      })
    })
  })

  describe('Publish Flow', () => {
    it('should require agreement before publishing', async () => {
      const { notify } = require('../../../../../utils/notify')
      await act(async () => render(<Step4Policy isAllowUpdate eventData={{ status: 'Draft', id: 'event-123' } as any} />))
      const publishButton = screen.getByText(/Lưu và gửi yêu cầu duyệt/)
      await userEvent.click(publishButton)
      await waitFor(() => {
        expect(notify.warning).toHaveBeenCalledWith('Bạn cần đồng ý với điều khoản trước khi gửi duyệt')
      })
    })

    it('should dispatch publish request after agreement', async () => {
      const { fetchRequestPublishEvent } = require('../../../../../store/eventSlice')
      await act(async () => render(<Step4Policy isAllowUpdate eventData={{ status: 'Draft', id: 'event-123' } as any} />))
      const checkbox = screen.getByRole('checkbox')
      await userEvent.click(checkbox)
      const publishButton = screen.getByText(/Lưu và gửi yêu cầu duyệt/)
      await userEvent.click(publishButton)
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(fetchRequestPublishEvent('event-123'))
      })
    })
  })

  describe('Agreement Checkbox', () => {
    it('should store agreement in localStorage', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate />))
      const checkbox = screen.getByRole('checkbox')
      await userEvent.click(checkbox)
      expect(localStorage.getItem('organizer_terms_agreed')).toBe('true')
    })

    it('should load agreement from localStorage', async () => {
      localStorage.setItem('organizer_terms_agreed', 'true')
      await act(async () => render(<Step4Policy isAllowUpdate />))
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })
  })

  describe('Disabled State', () => {
    it('should disable all inputs when isAllowUpdate is false', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate={false} />))
      const titleInputs = screen.getAllByPlaceholderText('Tiêu đề điều khoản...')
      titleInputs.forEach(input => {
        expect(input).toBeDisabled()
      })
    })

    it('should disable buttons when isAllowUpdate is false', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate={false} />))
      const saveButton = screen.getByText('Lưu lại')
      expect(saveButton).toBeDisabled()
    })

    it('should disable checkbox when isAllowUpdate is false', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate={false} />))
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
    })
  })

  describe('Loading State', () => {
    it('should show loading text while saving', async () => {
      mockDispatch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      await act(async () => render(<Step4Policy isAllowUpdate />))
      const saveButton = screen.getByText('Lưu lại')
      await userEvent.click(saveButton)
      await waitFor(() => {
        expect(screen.getByText('Đang lưu...')).toBeInTheDocument()
      })
    })

    it('should show loading text while publishing', async () => {
      mockDispatch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      await act(async () => render(<Step4Policy isAllowUpdate eventData={{ status: 'Draft', id: 'event-123' } as any} />))
      const checkbox = screen.getByRole('checkbox')
      await userEvent.click(checkbox)
      const publishButton = screen.getByText(/Lưu và gửi yêu cầu duyệt/)
      await userEvent.click(publishButton)
      await waitFor(() => {
        expect(screen.getByText('Đang gửi...')).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle null eventData', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate eventData={null} />))
      expect(screen.getByText(/Chính sách sự kiện/)).toBeInTheDocument()
    })

    it('should handle empty sections array', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate />))
      // Should still render with default sections
      expect(screen.getByText('Điều kiện tham dự')).toBeInTheDocument()
    })

    it('should handle very long policy text', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate />))
      const firstItem = screen.getByDisplayValue(/Người tham dự phải mang theo vé/)
      await userEvent.clear(firstItem)
      await userEvent.type(firstItem, 'A'.repeat(500))
      expect(firstItem).toHaveValue('A'.repeat(500))
    })

    it('should handle special characters in policy text', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate />))
      const firstItem = screen.getByDisplayValue(/Người tham dự phải mang theo vé/)
      await userEvent.clear(firstItem)
      await userEvent.type(firstItem, 'Test <Special> & "Characters"')
      expect(firstItem).toHaveValue('Test <Special> & "Characters"')
    })

    it('should handle non-Draft status (no publish button)', async () => {
      await act(async () => render(<Step4Policy isAllowUpdate eventData={{ status: 'Published' } as any} />))
      expect(screen.queryByText(/Lưu và gửi yêu cầu duyệt/)).not.toBeInTheDocument()
    })

    it('should convert sections to HTML format before saving', async () => {
      const { fetchUpdateEventPolicy } = require('../../../../../store/eventSlice')
      await act(async () => render(<Step4Policy isAllowUpdate />))
      const saveButton = screen.getByText('Lưu lại')
      await userEvent.click(saveButton)
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          fetchUpdateEventPolicy({
            eventId: undefined,
            policy: expect.stringContaining('<h3>'),
          })
        )
      })
    })
  })
})
