/// <reference types="jest" />
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ReportTable from '../../../../../components/Organizer/overview/ReportTable'

// Mock the hook
const mockUseEventReports = jest.fn()
jest.mock('../../../../../hooks/useEventReport', () => ({
  useEventReports: () => mockUseEventReports(),
}))

describe('ReportTable', () => {
  const mockReports = [
    {
      id: 'report-1',
      eventName: 'Concert Night',
      fileName: 'concert_report_01-12-2024.xlsx',
      createdAt: '2024-12-01T10:00:00Z',
      createdBy: 'john@example.com',
    },
    {
      id: 'report-2',
      eventName: 'Tech Conference',
      fileName: 'tech_summary.xlsx',
      createdAt: '2024-12-02T14:30:00Z',
      createdBy: 'jane@example.com',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render table headers', async () => {
      mockUseEventReports.mockReturnValue({ reports: mockReports, loading: false })

      await act(async () => render(<ReportTable />))

      expect(screen.getByText('Sự kiện')).toBeInTheDocument()
      expect(screen.getByText('File')).toBeInTheDocument()
      expect(screen.getByText('Ngày tạo')).toBeInTheDocument()
      expect(screen.getByText('Người tạo')).toBeInTheDocument()
    })

    it('should render report rows', async () => {
      mockUseEventReports.mockReturnValue({ reports: mockReports, loading: false })

      await act(async () => render(<ReportTable />))

      expect(screen.getByText('Concert Night')).toBeInTheDocument()
      expect(screen.getByText('Tech Conference')).toBeInTheDocument()
    })

    it('should render file names', async () => {
      mockUseEventReports.mockReturnValue({ reports: mockReports, loading: false })

      await act(async () => render(<ReportTable />))

      expect(screen.getByText('concert_report_01-12-2024.xlsx')).toBeInTheDocument()
      expect(screen.getByText('tech_summary.xlsx')).toBeInTheDocument()
    })

    it('should render XLS badge', async () => {
      mockUseEventReports.mockReturnValue({ reports: mockReports, loading: false })

      await act(async () => render(<ReportTable />))

      expect(screen.getByText('XLS')).toBeInTheDocument()
    })

    it('should render formatted dates', async () => {
      mockUseEventReports.mockReturnValue({ reports: mockReports, loading: false })

      await act(async () => render(<ReportTable />))

      expect(screen.getByText('01/12/2024')).toBeInTheDocument()
    })

    it('should render creator emails', async () => {
      mockUseEventReports.mockReturnValue({ reports: mockReports, loading: false })

      await act(async () => render(<ReportTable />))

      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })

    it('should render pagination info', async () => {
      mockUseEventReports.mockReturnValue({ reports: mockReports, loading: false })

      await act(async () => render(<ReportTable />))

      expect(screen.getByText('Hiển thị')).toBeInTheDocument()
      expect(screen.getByText('kết quả')).toBeInTheDocument()
    })

    it('should render pagination buttons', async () => {
      mockUseEventReports.mockReturnValue({ reports: mockReports, loading: false })

      await act(async () => render(<ReportTable />))

      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show skeleton rows when loading', async () => {
      mockUseEventReports.mockReturnValue({ reports: [], loading: true })

      await act(async () => render(<ReportTable />))

      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should not show data rows when loading', async () => {
      mockUseEventReports.mockReturnValue({ reports: mockReports, loading: true })

      await act(async () => render(<ReportTable />))

      expect(screen.queryByText('Concert Night')).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty message when no reports', async () => {
      mockUseEventReports.mockReturnValue({ reports: [], loading: false })

      await act(async () => render(<ReportTable />))

      expect(screen.getByText('Chưa có báo cáo nào được tạo')).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('should show correct count for first page', async () => {
      const manyReports = Array.from({ length: 15 }, (_, i) => ({
        id: `report-${i}`,
        eventName: `Event ${i}`,
        fileName: `report-${i}.xlsx`,
        createdAt: '2024-12-01T10:00:00Z',
        createdBy: 'test@example.com',
      }))
      mockUseEventReports.mockReturnValue({ reports: manyReports, loading: false })

      await act(async () => render(<ReportTable />))

      expect(screen.getByText('Hiển thị')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('trong')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('should show page 1 as active', async () => {
      mockUseEventReports.mockReturnValue({ reports: mockReports, loading: false })

      await act(async () => render(<ReportTable />))

      const activePage = screen.getByText('1').closest('.bg-primary')
      expect(activePage).toBeInTheDocument()
    })

    it('should disable previous button on first page', async () => {
      mockUseEventReports.mockReturnValue({ reports: mockReports, loading: false })

      await act(async () => render(<ReportTable />))

      const prevButton = screen.getAllByRole('button')[0]
      expect(prevButton).toBeDisabled()
    })

    it('should enable next button when more pages exist', async () => {
      const manyReports = Array.from({ length: 15 }, (_, i) => ({
        id: `report-${i}`,
        eventName: `Event ${i}`,
        fileName: `report-${i}.xlsx`,
        createdAt: '2024-12-01T10:00:00Z',
        createdBy: 'test@example.com',
      }))
      mockUseEventReports.mockReturnValue({ reports: manyReports, loading: false })

      await act(async () => render(<ReportTable />))

      const nextButton = screen.getAllByRole('button')[1]
      expect(nextButton).not.toBeDisabled()
    })

    it('should navigate to next page when clicking next button', async () => {
      const manyReports = Array.from({ length: 15 }, (_, i) => ({
        id: `report-${i}`,
        eventName: `Event ${i}`,
        fileName: `report-${i}.xlsx`,
        createdAt: '2024-12-01T10:00:00Z',
        createdBy: 'test@example.com',
      }))
      mockUseEventReports.mockReturnValue({ reports: manyReports, loading: false })

      await act(async () => render(<ReportTable />))

      const nextButton = screen.getAllByRole('button')[1]
      await userEvent.click(nextButton)

      await screen.findByText('2')
      expect(screen.getByText('2')).toHaveClass('bg-primary')
    })

    it('should navigate to previous page when clicking prev button', async () => {
      const manyReports = Array.from({ length: 15 }, (_, i) => ({
        id: `report-${i}`,
        eventName: `Event ${i}`,
        fileName: `report-${i}.xlsx`,
        createdAt: '2024-12-01T10:00:00Z',
        createdBy: 'test@example.com',
      }))
      mockUseEventReports.mockReturnValue({ reports: manyReports, loading: false })

      await act(async () => render(<ReportTable />))

      // Go to page 2
      const nextButton = screen.getAllByRole('button')[1]
      await userEvent.click(nextButton)

      // Go back to page 1
      const prevButton = screen.getAllByRole('button')[0]
      await userEvent.click(prevButton)

      await screen.findByText('1')
      expect(screen.getByText('1')).toHaveClass('bg-primary')
    })

    it('should disable next button on last page', async () => {
      const manyReports = Array.from({ length: 15 }, (_, i) => ({
        id: `report-${i}`,
        eventName: `Event ${i}`,
        fileName: `report-${i}.xlsx`,
        createdAt: '2024-12-01T10:00:00Z',
        createdBy: 'test@example.com',
      }))
      mockUseEventReports.mockReturnValue({ reports: manyReports, loading: false })

      await act(async () => render(<ReportTable />))

      // Go to page 2 (last page)
      const nextButton = screen.getAllByRole('button')[1]
      await userEvent.click(nextButton)

      await screen.findByText('2')
      const nextButtonAfter = screen.getAllByRole('button')[1]
      expect(nextButtonAfter).toBeDisabled()
    })
  })

  describe('Styling', () => {
    it('should render with gradient background', async () => {
      mockUseEventReports.mockReturnValue({ reports: mockReports, loading: false })

      await act(async () => render(<ReportTable />))

      const table = screen.getByText('Sự kiện').closest('.rounded-2xl')
      expect(table).toHaveClass('bg-gradient-to-b')
    })

    it('should render with border', async () => {
      mockUseEventReports.mockReturnValue({ reports: mockReports, loading: false })

      await act(async () => render(<ReportTable />))

      const table = screen.getByText('Sự kiện').closest('.border-white\\/5')
      expect(table).toHaveClass('border-white/5')
    })

    it('should apply hover effect on rows', async () => {
      mockUseEventReports.mockReturnValue({ reports: mockReports, loading: false })

      await act(async () => render(<ReportTable />))

      const row = screen.getByText('Concert Night').closest('.hover\\:bg-white\\/5')
      expect(row).toBeInTheDocument()
    })

    it('should render XLS badge with primary color', async () => {
      mockUseEventReports.mockReturnValue({ reports: mockReports, loading: false })

      await act(async () => render(<ReportTable />))

      const xlsBadge = screen.getByText('XLS')
      expect(xlsBadge).toHaveClass('bg-primary/20', 'text-primary')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty reports array', async () => {
      mockUseEventReports.mockReturnValue({ reports: [], loading: false })

      await act(async () => render(<ReportTable />))

      expect(screen.getByText('Chưa có báo cáo nào được tạo')).toBeInTheDocument()
    })

    it('should handle reports with missing fields', async () => {
      const incompleteReports = [
        {
          id: 'report-1',
          eventName: '',
          fileName: '',
          createdAt: '2024-12-01T10:00:00Z',
          createdBy: '',
        },
      ]
      mockUseEventReports.mockReturnValue({ reports: incompleteReports, loading: false })

      const { container } = await act(async () => render(<ReportTable />))

      expect(container).toBeInTheDocument()
    })

    it('should handle exactly 10 reports (one page)', async () => {
      const tenReports = Array.from({ length: 10 }, (_, i) => ({
        id: `report-${i}`,
        eventName: `Event ${i}`,
        fileName: `report-${i}.xlsx`,
        createdAt: '2024-12-01T10:00:00Z',
        createdBy: 'test@example.com',
      }))
      mockUseEventReports.mockReturnValue({ reports: tenReports, loading: false })

      await act(async () => render(<ReportTable />))

      expect(screen.getByText('Hiển thị')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('should handle more than 10 reports (multiple pages)', async () => {
      const elevenReports = Array.from({ length: 11 }, (_, i) => ({
        id: `report-${i}`,
        eventName: `Event ${i}`,
        fileName: `report-${i}.xlsx`,
        createdAt: '2024-12-01T10:00:00Z',
        createdBy: 'test@example.com',
      }))
      mockUseEventReports.mockReturnValue({ reports: elevenReports, loading: false })

      await act(async () => render(<ReportTable />))

      expect(screen.getByText('Hiển thị')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('trong')).toBeInTheDocument()
      expect(screen.getByText('11')).toBeInTheDocument()
    })

    it('should handle reports with long file names', async () => {
      const longNameReports = [
        {
          id: 'report-1',
          eventName: 'Event',
          fileName: 'a'.repeat(100) + '.xlsx',
          createdAt: '2024-12-01T10:00:00Z',
          createdBy: 'test@example.com',
        },
      ]
      mockUseEventReports.mockReturnValue({ reports: longNameReports, loading: false })

      await act(async () => render(<ReportTable />))

      expect(screen.getByText('a'.repeat(100) + '.xlsx')).toBeInTheDocument()
    })
  })
})
