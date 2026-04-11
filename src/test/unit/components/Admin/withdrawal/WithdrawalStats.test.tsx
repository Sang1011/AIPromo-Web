/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import WithdrawalStats from '../../../../../components/Admin/withdrawal/WithdrawalStats'

let mockWithdrawalState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ WITHDRAWAL: mockWithdrawalState }),
}))

jest.mock('react-icons/md', () => ({
  MdQueryStats: () => <span data-testid="icon-query" />,
  MdPendingActions: () => <span data-testid="icon-pending" />,
  MdPayments: () => <span data-testid="icon-payments" />,
  MdReport: () => <span data-testid="icon-report" />,
}))

describe('WithdrawalStats', () => {
  beforeEach(() => {
    mockWithdrawalState = {
      withdrawalList: {
        data: {
          items: [
            { id: '1', status: 'Pending', amount: 5000000 },
            { id: '2', status: 'Approved', amount: 3000000 },
          ],
          totalCount: 2,
        },
      },
    }
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<WithdrawalStats />)
      })
      expect(screen.getByText('Tổng Số Yêu Cầu')).toBeInTheDocument()
    })

    it('should display total request count', async () => {
      await act(async () => {
        render(<WithdrawalStats />)
      })
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should display pending count', async () => {
      await act(async () => {
        render(<WithdrawalStats />)
      })
      expect(screen.getByText('Chờ Phê Duyệt')).toBeInTheDocument()
    })

    it('should display total withdrawal amount', async () => {
      await act(async () => {
        render(<WithdrawalStats />)
      })
      expect(screen.getByText('Tổng Tiền Rút')).toBeInTheDocument()
    })

    it('should handle empty withdrawal list', async () => {
      mockWithdrawalState.withdrawalList = { data: { items: [], totalCount: 0 } }
      await act(async () => {
        render(<WithdrawalStats />)
      })
      expect(screen.getAllByText('0').length).toBeGreaterThan(0)
    })
  })
})
