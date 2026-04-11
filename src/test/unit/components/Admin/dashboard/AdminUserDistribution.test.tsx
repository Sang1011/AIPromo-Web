/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminUserDistribution from '../../../../../components/Admin/dashboard/AdminUserDistribution'

let mockReportsState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ ADMIN_REPORTS: mockReportsState }),
}))

describe('AdminUserDistribution', () => {
  beforeEach(() => {
    mockReportsState = {
      data: {
        userDistribution: {
          organizers: { percentage: 30, count: 150 },
          attendees: { percentage: 70, count: 350 },
          growthRate: 15,
        },
      },
      loading: false,
    }
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<AdminUserDistribution />)
      })
      expect(screen.getByText('Phân bổ Người dùng')).toBeInTheDocument()
    })

    it('should show loading skeleton when loading', async () => {
      mockReportsState.loading = true
      mockReportsState.data = null
      await act(async () => {
        render(<AdminUserDistribution />)
      })
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('should display growth rate', async () => {
      await act(async () => {
        render(<AdminUserDistribution />)
      })
      expect(screen.getByText('15%')).toBeInTheDocument()
    })

    it('should display user distribution labels', async () => {
      await act(async () => {
        render(<AdminUserDistribution />)
      })
      expect(screen.getByText('Người tham dự')).toBeInTheDocument()
      expect(screen.getByText('Người tổ chức')).toBeInTheDocument()
    })
  })
})
