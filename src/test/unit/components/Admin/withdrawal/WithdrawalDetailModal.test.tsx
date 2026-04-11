/// <reference types="jest" />
import React from 'react'
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import WithdrawalDetailModal from '../../../../../components/Admin/withdrawal/WithdrawalDetailModal'

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}))

jest.mock('react-icons/md', () => ({
  MdClose: () => <span data-testid="icon-close" />,
  MdAccountBalanceWallet: () => <span data-testid="icon-wallet" />,
  MdNotes: () => <span data-testid="icon-notes" />,
  MdContentCopy: () => <span data-testid="icon-copy" />,
  MdVerifiedUser: () => <span data-testid="icon-verified" />,
  MdCancel: () => <span data-testid="icon-cancel" />,
  MdCheckCircle: () => <span data-testid="icon-check" />,
  MdPlayCircle: () => <span data-testid="icon-play" />,
}))

const mockDispatch = jest.fn()
let mockWithdrawalState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ WITHDRAWAL: mockWithdrawalState }),
  useDispatch: () => mockDispatch,
}))

jest.mock('../../../../../components/Admin/withdrawal/AdminNoteModal', () => ({
  __esModule: true,
  default: ({ isOpen }: any) => isOpen ? <div data-testid="note-modal" /> : null,
}))

describe('WithdrawalDetailModal', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
    mockWithdrawalState = {
      withdrawalDetail: {
        id: 'w1',
        amount: 5000000,
        status: 'Pending',
        bankName: 'Vietcombank',
        bankAccountNumber: '1234567890',
        userId: 'user1',
        notes: 'Test notes',
        createdAt: '2024-01-01T10:00:00Z',
      },
      loading: false,
      actionLoading: false,
    }
  })

  describe('Render', () => {
    it('should render without crashing when isOpen is true', async () => {
      await act(async () => {
        render(<WithdrawalDetailModal isOpen={true} onClose={mockOnClose} withdrawalId="w1" />)
      })
      expect(screen.getByText('Chi tiết yêu cầu rút tiền')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', async () => {
      await act(async () => {
        render(
          <WithdrawalDetailModal isOpen={false} onClose={mockOnClose} withdrawalId="w1" />
        )
      })
      expect(screen.queryByText('Chi tiết yêu cầu rút tiền')).not.toBeInTheDocument()
    })

    it('should display withdrawal amount', async () => {
      await act(async () => {
        render(<WithdrawalDetailModal isOpen={true} onClose={mockOnClose} withdrawalId="w1" />)
      })
      expect(screen.getByText('5.000.000')).toBeInTheDocument()
    })

    it('should display bank information', async () => {
      await act(async () => {
        render(<WithdrawalDetailModal isOpen={true} onClose={mockOnClose} withdrawalId="w1" />)
      })
      expect(screen.getByText('Vietcombank')).toBeInTheDocument()
    })

    it('should show action buttons for Pending status', async () => {
      await act(async () => {
        render(<WithdrawalDetailModal isOpen={true} onClose={mockOnClose} withdrawalId="w1" />)
      })
      expect(screen.getByText('Từ chối')).toBeInTheDocument()
      expect(screen.getByText('Phê duyệt')).toBeInTheDocument()
    })
  })
})
