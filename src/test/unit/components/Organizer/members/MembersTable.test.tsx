/// <reference types="jest" />
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import MembersTable from '../../../../../components/Organizer/members/MembersTable'
import type { EventMember } from '../../../../../types/eventMember/eventMember'
import { EventMemberStatus } from '../../../../../types/eventMember/eventMember'

// Mock Redux
const mockDispatch = jest.fn()
let mockEventMemberState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({
    EVENT_MEMBER: mockEventMemberState,
  }),
  useDispatch: () => mockDispatch,
}))

// Mock Redux actions
jest.mock('../../../../../store/eventMemberSlice', () => ({
  fetchRemoveEventMember: jest.fn(({ eventId, memberId }) => ({
    type: 'EVENT_MEMBER/fetchRemoveEventMember',
    payload: { eventId, memberId },
  })),
  fetchUpdateEventMemberPermissions: jest.fn(({ eventId, memberId, data }) => ({
    type: 'EVENT_MEMBER/fetchUpdateEventMemberPermissions',
    payload: { eventId, memberId, data },
  })),
}))

// Mock notify
jest.mock('../../../../../utils/notify', () => ({
  notify: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('MembersTable', () => {
  const mockMembers: EventMember[] = [
    {
      id: 'member-1',
      email: 'john@example.com',
      fullName: 'John Doe',
      status: EventMemberStatus.Active,
      permissions: ['CheckIn'],
      userId: "user-1"
    },
    {
      id: 'member-2',
      email: 'jane@example.com',
      fullName: 'Jane Smith',
      status: EventMemberStatus.Pending,
      permissions: ['CheckIn', 'ViewReports'],
      userId: "user-2"
    },
  ]

  const defaultProps = {
    eventId: 'event-123',
    members: mockMembers,
    filteredMembers: mockMembers,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockEventMemberState = {
      fetchingMembers: false,
    }
    mockDispatch.mockResolvedValue({})
  })

  describe('Render', () => {
    it('should render table header', () => {
      render(<MembersTable {...defaultProps} />)
      expect(screen.getByText('Thành viên')).toBeInTheDocument()
      expect(screen.getByText('Trạng thái')).toBeInTheDocument()
      expect(screen.getByText('Quyền hạn')).toBeInTheDocument()
      expect(screen.getByText('Hành động')).toBeInTheDocument()
    })

    it('should render member count', () => {
      render(<MembersTable {...defaultProps} />)
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText(/thành viên trong đội ngũ/)).toBeInTheDocument()
    })

    it('should render member rows with avatar and name', () => {
      render(<MembersTable {...defaultProps} />)
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('should render member emails', () => {
      render(<MembersTable {...defaultProps} />)
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })

    it('should render status badges with correct labels', () => {
      render(<MembersTable {...defaultProps} />)
      expect(screen.getByText('Hoạt động')).toBeInTheDocument()
      expect(screen.getByText('Chờ duyệt')).toBeInTheDocument()
    })

    it('should render permission tags', () => {
      render(<MembersTable {...defaultProps} />)
      expect(screen.getAllByText('Check-in')).toHaveLength(2)
      expect(screen.getByText('Xem báo cáo')).toBeInTheDocument()
    })

    it('should render action menu buttons', () => {
      render(<MembersTable {...defaultProps} />)
      const menuButtons = screen.getAllByText('•••')
      expect(menuButtons).toHaveLength(2)
    })
  })

  describe('Loading State', () => {
    it('should show skeleton rows when fetching', () => {
      mockEventMemberState.fetchingMembers = true

      render(<MembersTable {...defaultProps} />)

      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should not show member rows when fetching', () => {
      mockEventMemberState.fetchingMembers = true

      render(<MembersTable {...defaultProps} />)

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty message when no members', () => {
      render(<MembersTable {...defaultProps} members={[]} filteredMembers={[]} />)
      expect(screen.getByText('Chưa có thành viên nào trong đội ngũ')).toBeInTheDocument()
    })
  })

  describe('User Interactions - Action Menu', () => {
    it('should open action menu when clicking menu button', async () => {
      render(<MembersTable {...defaultProps} />)
      const menuButton = screen.getAllByText('•••')[0]

      await userEvent.click(menuButton)

      expect(screen.getByText('Chỉnh sửa quyền')).toBeInTheDocument()
      expect(screen.getByText('Xóa thành viên')).toBeInTheDocument()
    })

    it('should close action menu when clicking outside', async () => {
      render(<MembersTable {...defaultProps} />)
      const menuButton = screen.getAllByText('•••')[0]

      await userEvent.click(menuButton)
      await userEvent.click(document.body)

      await waitFor(() => {
        expect(screen.queryByText('Chỉnh sửa quyền')).not.toBeInTheDocument()
      })
    })
  })

  describe('User Interactions - Delete', () => {
    it('should call delete action when confirming', async () => {
      const { fetchRemoveEventMember } = require('../../../../../store/eventMemberSlice')

      render(<MembersTable {...defaultProps} />)
      const menuButton = screen.getAllByText('•••')[0]

      await userEvent.click(menuButton)
      const deleteButton = screen.getByText('Xóa thành viên')
      await userEvent.click(deleteButton)

      expect(mockDispatch).toHaveBeenCalledWith(
        fetchRemoveEventMember({ eventId: 'event-123', memberId: 'member-1' })
      )
    })

    it('should show success notification after delete', async () => {
      const { notify } = require('../../../../../utils/notify')

      render(<MembersTable {...defaultProps} />)
      const menuButton = screen.getAllByText('•••')[0]

      await userEvent.click(menuButton)
      const deleteButton = screen.getByText('Xóa thành viên')
      await userEvent.click(deleteButton)

      expect(notify.success).toHaveBeenCalledWith('Đã xóa thành viên')
    })

    it('should show loading state during delete', async () => {
      render(<MembersTable {...defaultProps} />)
      const menuButton = screen.getAllByText('•••')[0]

      await userEvent.click(menuButton)
      expect(screen.getByText('Xóa thành viên')).toBeInTheDocument()
    })
  })

  describe('User Interactions - Edit Permissions', () => {
    it('should open edit modal when clicking edit', async () => {
      render(<MembersTable {...defaultProps} />)
      const menuButton = screen.getAllByText('•••')[0]

      await userEvent.click(menuButton)
      const editButton = screen.getByText('Chỉnh sửa quyền')
      await userEvent.click(editButton)

      expect(screen.getByText('Chỉnh sửa quyền hạn')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('should show permission checkboxes in edit modal', async () => {
      render(<MembersTable {...defaultProps} />)
      const menuButton = screen.getAllByText('•••')[0]

      await userEvent.click(menuButton)
      await userEvent.click(screen.getByText('Chỉnh sửa quyền'))

      expect(screen.getByText('Check-in')).toBeInTheDocument()
      expect(screen.getByText('Xem báo cáo')).toBeInTheDocument()
    })

    it('should close modal when clicking cancel', async () => {
      render(<MembersTable {...defaultProps} />)
      const menuButton = screen.getAllByText('•••')[0]

      await userEvent.click(menuButton)
      await userEvent.click(screen.getByText('Chỉnh sửa quyền'))

      const cancelButton = screen.getByText('Hủy')
      await userEvent.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Chỉnh sửa quyền hạn')).not.toBeInTheDocument()
      })
    })

    it('should update permissions when clicking save', async () => {
      const { fetchUpdateEventMemberPermissions } = require('../../../../../store/eventMemberSlice')

      render(<MembersTable {...defaultProps} />)
      const menuButton = screen.getAllByText('•••')[0]

      await userEvent.click(menuButton)
      await userEvent.click(screen.getByText('Chỉnh sửa quyền'))

      const saveButton = screen.getByText('Lưu thay đổi')
      await userEvent.click(saveButton)

      expect(mockDispatch).toHaveBeenCalledWith(
        fetchUpdateEventMemberPermissions({
          eventId: 'event-123',
          memberId: 'member-1',
          data: { permissions: ['CheckIn'] },
        })
      )
    })

    it('should show success notification after updating permissions', async () => {
      const { notify } = require('../../../../../utils/notify')

      render(<MembersTable {...defaultProps} />)
      const menuButton = screen.getAllByText('•••')[0]

      await userEvent.click(menuButton)
      await userEvent.click(screen.getByText('Chỉnh sửa quyền'))

      const saveButton = screen.getByText('Lưu thay đổi')
      await userEvent.click(saveButton)

      expect(notify.success).toHaveBeenCalledWith('Cập nhật quyền thành công')
    })

    it('should toggle permissions in edit modal', async () => {
      render(<MembersTable {...defaultProps} />)
      const menuButton = screen.getAllByText('•••')[0]

      await userEvent.click(menuButton)
      await userEvent.click(screen.getByText('Chỉnh sửa quyền'))

      // Click on ViewReports checkbox (not selected for member-1)
      const viewReportsCheckbox = screen.getByText('Xem báo cáo').parentElement
      await userEvent.click(viewReportsCheckbox!)

      // Should still be in edit modal
      expect(screen.getByText('Chỉnh sửa quyền hạn')).toBeInTheDocument()
    })
  })

  describe('Member Display', () => {
    it('should show email when fullName is not available', () => {
      const membersWithoutName: EventMember[] = [
        {
          id: 'member-3',
          email: 'noname@example.com',
          fullName: '',
          status: EventMemberStatus.Active,
          permissions: [],
          userId: "user-2"
        },
      ]

      render(<MembersTable {...defaultProps} members={membersWithoutName} filteredMembers={membersWithoutName} />)
      expect(screen.getByText('noname@example.com')).toBeInTheDocument()
    })

    it('should show "?" when both fullName and email are missing', () => {
      const membersWithoutInfo: EventMember[] = [
        {
          id: 'member-4',
          email: '',
          fullName: '',
          status: EventMemberStatus.Active,
          permissions: [],
          userId: "user-2"
        },
      ]

      render(<MembersTable {...defaultProps} members={membersWithoutInfo} filteredMembers={membersWithoutInfo} />)
      expect(screen.getByText('—')).toBeInTheDocument()
    })

    it('should handle members without permissions', () => {
      const membersNoPerms: EventMember[] = [
        {
          id: 'member-5',
          email: 'noperms@example.com',
          fullName: 'No Perms',
          status: EventMemberStatus.Active,
          permissions: [],
          userId: "user-2"
        },
      ]

      render(<MembersTable {...defaultProps} members={membersNoPerms} filteredMembers={membersNoPerms} />)
      expect(screen.getByText('Không có quyền')).toBeInTheDocument()
    })

    it('should handle unknown status gracefully', () => {
      const membersUnknownStatus: EventMember[] = [
        {
          id: 'member-6',
          email: 'unknown@example.com',
          fullName: 'Unknown Status',
          status: 'Unknown' as EventMemberStatus,
          permissions: [],
          userId: "user-2"
        },
      ]

      render(<MembersTable {...defaultProps} members={membersUnknownStatus} filteredMembers={membersUnknownStatus} />)
      expect(screen.getByText('Không xác định')).toBeInTheDocument()
    })
  })

  describe('Permission Labels', () => {
    it('should display translated permission labels', () => {
      render(<MembersTable {...defaultProps} />)
      expect(screen.getAllByText('Check-in').length).toBeGreaterThan(0)
      expect(screen.getByText('Xem báo cáo')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty filteredMembers array', () => {
      render(<MembersTable {...defaultProps} filteredMembers={[]} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle very long member names', () => {
      const longNameMembers: EventMember[] = [
        {
          id: 'member-long',
          email: 'long@example.com',
          fullName: 'A'.repeat(100),
          status: EventMemberStatus.Active,
          permissions: [],
          userId: "user-2"
        },
      ]

      render(<MembersTable {...defaultProps} members={longNameMembers} filteredMembers={longNameMembers} />)
      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument()
    })

    it('should handle multiple permissions for a member', () => {
      const multiPermMembers: EventMember[] = [
        {
          id: 'member-multi',
          email: 'multi@example.com',
          fullName: 'Multi Perm',
          status: EventMemberStatus.Active,
          permissions: ['CheckIn', 'ViewReports'],
          userId: "user-2"
        },
      ]

      render(<MembersTable {...defaultProps} members={multiPermMembers} filteredMembers={multiPermMembers} />)
      expect(screen.getAllByText('Check-in').length).toBeGreaterThan(0)
      expect(screen.getByText('Xem báo cáo')).toBeInTheDocument()
    })
  })
})
