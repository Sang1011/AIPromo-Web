/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import EventCard from '../../../../../components/Organizer/events/EventCards'
import type { EventItemMapUI } from '../../../../../components/Organizer/events/EventCards'

// Mock react-router-dom
const mockUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUseNavigate(),
}))

describe('EventCard', () => {
  const mockNavigate = jest.fn()

  const createMockEvent = (overrides: Partial<EventItemMapUI> = {}): EventItemMapUI => ({
    id: 'event-123',
    title: 'Test Event',
    image: 'https://example.com/banner.jpg',
    time: '01/12/2024 - 18/12/2024',
    location: 'Ho Chi Minh City',
    status: 'upcoming',
    statusLabel: 'Đang hoạt động',
    color: 'amber',
    statusCheck: 'Published',
    ...overrides,
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseNavigate.mockReturnValue(mockNavigate)
  })

  describe('Organizer View', () => {
    it('should render event title', () => {
      render(<EventCard event={createMockEvent()} />)
      expect(screen.getByText('Test Event')).toBeInTheDocument()
    })

    it('should render event image', () => {
      render(<EventCard event={createMockEvent()} />)
      const img = screen.getByAltText('Test Event')
      expect(img).toHaveAttribute('src', 'https://example.com/banner.jpg')
    })

    it('should render time and location', () => {
      render(<EventCard event={createMockEvent()} />)
      expect(screen.getByText('01/12/2024 - 18/12/2024')).toBeInTheDocument()
      expect(screen.getByText('Ho Chi Minh City')).toBeInTheDocument()
    })

    it('should render status badge', () => {
      render(<EventCard event={createMockEvent()} />)
      expect(screen.getByText('Đang hoạt động')).toBeInTheDocument()
    })

    it('should render organizer footer with action buttons', () => {
      render(<EventCard event={createMockEvent()} />)
      expect(screen.getByText('Tổng quan')).toBeInTheDocument()
      expect(screen.getByText('Thành viên')).toBeInTheDocument()
      expect(screen.getByText('Đơn hàng')).toBeInTheDocument()
      expect(screen.getByText('Sơ đồ')).toBeInTheDocument()
    })

    it('should render "Chỉnh sửa" button for Draft events', () => {
      render(<EventCard event={createMockEvent({ statusCheck: 'Draft' })} />)
      expect(screen.getByText('Chỉnh sửa')).toBeInTheDocument()
    })

    it('should render "Xem chi tiết" button for Published events', () => {
      render(<EventCard event={createMockEvent({ statusCheck: 'Published' })} />)
      expect(screen.getByText('Xem chi tiết')).toBeInTheDocument()
    })

    it('should navigate to correct event section when clicking footer button', async () => {
      render(<EventCard event={createMockEvent({ id: 'event-456' })} />)
      await userEvent.click(screen.getByText('Tổng quan'))
      expect(mockNavigate).toHaveBeenCalledWith('/organizer/my-events/event-456/overview')
    })

    it('should render reject reason when provided', () => {
      render(<EventCard event={createMockEvent({
        rejectReason: 'Content not appropriate',
        rejectReasonLabel: 'Từ chối duyệt',
        rejectColor: 'red',
      })} />)
      expect(screen.getByText('Từ chối duyệt:')).toBeInTheDocument()
      expect(screen.getByText('Content not appropriate')).toBeInTheDocument()
    })
  })

  describe('Member View', () => {
    it('should render member role badge', () => {
      render(<EventCard event={createMockEvent({
        permissions: ['CheckIn'],
      })} isMember />)
      expect(screen.getByText('Nhân viên check-in')).toBeInTheDocument()
    })

    it('should render session chips for member', () => {
      render(<EventCard event={createMockEvent({
        sessions: [
          { id: 's1', title: 'Session 1', startTime: '2024-12-01T10:00:00Z', endTime: '2024-12-01T12:00:00Z' },
          { id: 's2', title: 'Session 2', startTime: '2024-12-01T14:00:00Z', endTime: '2024-12-01T16:00:00Z' },
        ],
      })} isMember />)
      expect(screen.getByText('Session 1')).toBeInTheDocument()
      expect(screen.getByText('Session 2')).toBeInTheDocument()
    })

    it('should render permission tags for member', () => {
      render(<EventCard event={createMockEvent({
        permissions: ['CheckIn', 'ViewReports'],
      })} isMember />)
      expect(screen.getByText('Check-in')).toBeInTheDocument()
      expect(screen.getByText('Xem báo cáo')).toBeInTheDocument()
    })

    it('should render "Điều phối viên" for members with 2+ permissions', () => {
      render(<EventCard event={createMockEvent({
        permissions: ['CheckIn', 'ViewReports'],
      })} isMember />)
      expect(screen.getByText('Điều phối viên')).toBeInTheDocument()
    })

    it('should render member footer with limited actions for CheckIn only', () => {
      render(<EventCard event={createMockEvent({
        permissions: ['CheckIn'],
      })} isMember />)
      expect(screen.getByText('Check In')).toBeInTheDocument()
      expect(screen.queryByText('Tổng quan')).not.toBeInTheDocument()
    })

    it('should render member footer with overview and analytics for non-CheckIn members', () => {
      render(<EventCard event={createMockEvent({
        permissions: ['ViewReports'],
      })} isMember />)
      expect(screen.getByText('Tổng quan')).toBeInTheDocument()
      expect(screen.getByText('Phân tích')).toBeInTheDocument()
    })

    it('should not show location for member view', () => {
      render(<EventCard event={createMockEvent()} isMember />)
      expect(screen.queryByText('Ho Chi Minh City')).not.toBeInTheDocument()
    })

    it('should not show status badge for member view', () => {
      render(<EventCard event={createMockEvent()} isMember />)
      expect(screen.queryByText('Đang hoạt động')).not.toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should navigate to overview page', async () => {
      render(<EventCard event={createMockEvent({ id: 'evt-1' })} />)
      await userEvent.click(screen.getByText('Tổng quan'))
      expect(mockNavigate).toHaveBeenCalledWith('/organizer/my-events/evt-1/overview')
    })

    it('should navigate to members page', async () => {
      render(<EventCard event={createMockEvent({ id: 'evt-2' })} />)
      await userEvent.click(screen.getByText('Thành viên'))
      expect(mockNavigate).toHaveBeenCalledWith('/organizer/my-events/evt-2/members')
    })

    it('should navigate to edit page for Draft events', async () => {
      render(<EventCard event={createMockEvent({ id: 'evt-3', statusCheck: 'Draft' })} />)
      await userEvent.click(screen.getByText('Chỉnh sửa'))
      expect(mockNavigate).toHaveBeenCalledWith('/organizer/my-events/evt-3/edit')
    })
  })

  describe('Edge Cases', () => {
    it('should handle event without reject reason', () => {
      render(<EventCard event={createMockEvent()} />)
      expect(screen.queryByText(/Từ chối/)).not.toBeInTheDocument()
    })

    it('should handle member without sessions', () => {
      render(<EventCard event={createMockEvent({ sessions: [] })} isMember />)
      expect(screen.queryByText(/Session/)).not.toBeInTheDocument()
    })

    it('should handle member without permissions', () => {
      render(<EventCard event={createMockEvent({ permissions: [] })} isMember />)
      expect(screen.queryByText(/Check-in/)).not.toBeInTheDocument()
    })

    it('should handle very long event title', () => {
      render(<EventCard event={createMockEvent({ title: 'A'.repeat(100) })} />)
      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument()
    })
  })
})
