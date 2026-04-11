/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import HistoryEvent from '../../../pages/HistoryEvent'

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => jest.fn(),
}))

jest.mock('../../../../components/Header', () => {
  return function MockHeader() {
    return <header data-testid="mock-header">Header</header>
  }
})

jest.mock('../../../../components/Footer', () => {
  return function MockFooter() {
    return <footer data-testid="mock-footer">Footer</footer>
  }
})

// ============================================================================
// TESTS
// ============================================================================

describe('HistoryEvent', () => {
  describe('Render', () => {
    it('should render HistoryEvent page with Header and Footer', () => {
      render(<HistoryEvent />)
      expect(screen.getByTestId('mock-header')).toBeInTheDocument()
      expect(screen.getByTestId('mock-footer')).toBeInTheDocument()
    })

    it('should render page heading', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('Lịch sử mua vé')).toBeInTheDocument()
    })

    it('should render ticket count indicator', () => {
      render(<HistoryEvent />)
      expect(
        screen.getByText('Hệ thống đang lưu trữ 5 vé của bạn')
      ).toBeInTheDocument()
    })

    it('should render search input', () => {
      render(<HistoryEvent />)
      expect(screen.getByPlaceholderText('Tìm kiếm vé...')).toBeInTheDocument()
    })

    it('should render filter button', () => {
      render(<HistoryEvent />)
      expect(screen.getByRole('button', { name: /Lọc nâng cao/ })).toBeInTheDocument()
    })
  })

  describe('Tabs', () => {
    it('should render all tabs', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('Tất cả')).toBeInTheDocument()
      expect(screen.getAllByText('Sắp diễn ra').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Đã hoàn thành').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Đã hủy').length).toBeGreaterThanOrEqual(1)
    })

    it('should show correct counts for each tab', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('05')).toBeInTheDocument()
      // "01" appears multiple times (tab count + quantities)
      expect(screen.getAllByText('01').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('03').length).toBeGreaterThanOrEqual(1)
    })

    it('should have "Tất cả" tab as active by default', () => {
      render(<HistoryEvent />)
      const allTab = screen.getByText('Tất cả')
      expect(allTab).toHaveClass('text-primary')
    })
  })

  describe('Event Cards', () => {
    it('should render upcoming event card', () => {
      render(<HistoryEvent />)
      expect(
        screen.getByText('AI Tech Summit 2024: Future is Now')
      ).toBeInTheDocument()
    })

    it('should render completed event card', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('Music Festival: Neon Night 2023')).toBeInTheDocument()
    })

    it('should render cancelled event card', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('Workshop: UI Design with AI')).toBeInTheDocument()
    })
  })

  describe('Event Card Details - Upcoming Event', () => {
    it('should render event status badge', () => {
      render(<HistoryEvent />)
      expect(screen.getAllByText('Sắp diễn ra').length).toBeGreaterThanOrEqual(1)
    })

    it('should render ticket type badge', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('Vé VIP')).toBeInTheDocument()
    })

    it('should render order number', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('#AP-99231')).toBeInTheDocument()
    })

    it('should render event date', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('Thứ 7, 12/10/2024')).toBeInTheDocument()
    })

    it('should render event location', () => {
      render(<HistoryEvent />)
      expect(
        screen.getByText('Trung tâm Hội nghị Quốc gia, Hà Nội')
      ).toBeInTheDocument()
    })

    it('should render quantity information', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('02')).toBeInTheDocument()
    })

    it('should render total price', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('1.200.000đ')).toBeInTheDocument()
    })

    it('should render "Xem vé QR" button', () => {
      render(<HistoryEvent />)
      expect(screen.getByRole('button', { name: /Xem vé QR/ })).toBeInTheDocument()
    })

    it('should render "Chi tiết đơn hàng" button', () => {
      render(<HistoryEvent />)
      expect(screen.getByRole('button', { name: /Chi tiết đơn hàng/ })).toBeInTheDocument()
    })
  })

  describe('Event Card Details - Completed Event', () => {
    it('should render completed status badge', () => {
      render(<HistoryEvent />)
      const badges = screen.getAllByText('Đã hoàn thành')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('should render order number', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('#AP-88412')).toBeInTheDocument()
    })

    it('should render event date', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('20/09/2023')).toBeInTheDocument()
    })

    it('should render event location', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('Sân vận động Mỹ Đình, Hà Nội')).toBeInTheDocument()
    })

    it('should render total price', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('450.000đ')).toBeInTheDocument()
    })

    it('should render "Gửi đánh giá" button', () => {
      render(<HistoryEvent />)
      expect(screen.getByRole('button', { name: /Gửi đánh giá/ })).toBeInTheDocument()
    })

    it('should render "Chi tiết" button', () => {
      render(<HistoryEvent />)
      // "Chi tiết" appears in two buttons
      expect(screen.getAllByRole('button', { name: /Chi tiết/ }).length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Event Card Details - Cancelled Event', () => {
    it('should render cancelled status badge', () => {
      render(<HistoryEvent />)
      expect(screen.getAllByText('Đã hủy').length).toBeGreaterThanOrEqual(1)
    })

    it('should render order number', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('#AP-77610')).toBeInTheDocument()
    })

    it('should render event date', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('05/08/2023')).toBeInTheDocument()
    })

    it('should render event location', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('Creative Hub, District 1, HCM')).toBeInTheDocument()
    })

    it('should render refunded amount label', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('Đã hoàn tiền')).toBeInTheDocument()
    })

    it('should render refunded amount', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('200.000đ')).toBeInTheDocument()
    })

    it('should render "Lý do hủy" button', () => {
      render(<HistoryEvent />)
      expect(screen.getByRole('button', { name: /Lý do hủy/ })).toBeInTheDocument()
    })

    it('should render disabled "Không khả dụng" button', () => {
      render(<HistoryEvent />)
      const disabledBtn = screen.getByRole('button', { name: /Không khả dụng/ })
      // The button uses cursor-not-allowed class instead of disabled attribute
      expect(disabledBtn).toHaveClass('cursor-not-allowed')
    })
  })

  describe('Visual Elements', () => {
    it('should render event images', () => {
      render(<HistoryEvent />)
      // Images are set via inline style backgroundImage
      const containers = document.querySelectorAll('[style*="background-image"]')
      expect(containers.length).toBeGreaterThanOrEqual(3)
    })

    it('should render material icons for calendar', () => {
      render(<HistoryEvent />)
      expect(screen.getAllByText('calendar_month').length).toBeGreaterThanOrEqual(1)
    })

    it('should render material icons for location', () => {
      render(<HistoryEvent />)
      expect(screen.getAllByText('location_on').length).toBeGreaterThanOrEqual(1)
    })

    it('should render material icons for QR code', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('qr_code_2')).toBeInTheDocument()
    })
  })

  describe('Load More', () => {
    it('should render "Xem thêm lịch sử" button', () => {
      render(<HistoryEvent />)
      expect(screen.getByRole('button', { name: /Xem thêm lịch sử/ })).toBeInTheDocument()
    })

    it('should render pagination info', () => {
      render(<HistoryEvent />)
      expect(screen.getByText('Hiển thị 3 trên tổng số 5 vé')).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('should allow typing in search input', async () => {
      render(<HistoryEvent />)
      const searchInput = screen.getByPlaceholderText('Tìm kiếm vé...')
      await userEvent.type(searchInput, 'AI Tech')
      expect(searchInput).toHaveValue('AI Tech')
    })
  })

  describe('Layout Structure', () => {
    it('should render cards with glass-card class', () => {
      render(<HistoryEvent />)
      const glassCards = document.querySelectorAll('.glass-card')
      expect(glassCards.length).toBe(3)
    })

    it('should render upcoming event card with full opacity', () => {
      render(<HistoryEvent />)
      const glassCards = document.querySelectorAll('.glass-card')
      // First card should not have opacity class
      expect(glassCards[0]).not.toHaveClass('opacity-90')
    })

    it('should render completed event card with reduced opacity', () => {
      render(<HistoryEvent />)
      const glassCards = document.querySelectorAll('.glass-card')
      // Second card should have opacity-90
      expect(glassCards[1]).toHaveClass('opacity-90')
    })

    it('should render cancelled event card with further reduced opacity', () => {
      render(<HistoryEvent />)
      const glassCards = document.querySelectorAll('.glass-card')
      // Third card should have opacity-70
      expect(glassCards[2]).toHaveClass('opacity-70')
    })
  })

  describe('Responsive Design', () => {
    it('should render responsive layout classes', () => {
      render(<HistoryEvent />)
      const mainElement = document.querySelector('main')
      expect(mainElement).toHaveClass('py-24')
    })
  })

  describe('Edge Cases', () => {
    it('should render without crashing when no data is provided', () => {
      // The page uses hardcoded data, so it should always render
      expect(() => render(<HistoryEvent />)).not.toThrow()
    })

    it('should handle empty search input gracefully', () => {
      render(<HistoryEvent />)
      const searchInput = screen.getByPlaceholderText('Tìm kiếm vé...')
      expect(searchInput).toHaveValue('')
    })
  })
})
