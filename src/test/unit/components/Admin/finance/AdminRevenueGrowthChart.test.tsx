/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminRevenueGrowthChart from '../../../../../components/Admin/finance/AdminRevenueGrowthChart'

// Mock the service
jest.mock('../../../../../services/adminReportsService', () => ({
  getSalesTrend: jest.fn().mockResolvedValue({
    data: {
      isSuccess: true,
      data: {
        chartData: [
          { dateLabel: '01/01', revenue: 1000000, transactions: 10 },
          { dateLabel: '02/01', revenue: 2000000, transactions: 20 },
        ],
      },
    },
  }),
}))

describe('AdminRevenueGrowthChart', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<AdminRevenueGrowthChart />)
      })
      // Wait for data to load
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(screen.getByText('Tăng trưởng Doanh thu')).toBeInTheDocument()
    })

    it('should display legend items', async () => {
      await act(async () => {
        render(<AdminRevenueGrowthChart />)
      })
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(screen.getByText('Doanh thu')).toBeInTheDocument()
      expect(screen.getByText('Phí nền tảng (15%)')).toBeInTheDocument()
    })
  })
})
