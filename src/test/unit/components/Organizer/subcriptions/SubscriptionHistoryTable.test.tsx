/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

import SubscriptionHistoryTable, { type SubscriptionHistoryItem } from '../../../../../components/Organizer/subcriptions/SubscriptionHistoryTable'

describe('SubscriptionHistoryTable', () => {
  const mockData: SubscriptionHistoryItem[] = [
    {
      id: '1',
      transactionCode: 'SUB-20250415',
      planName: 'Pro',
      planTier: 'pro',
      periodStart: '15/04/2025',
      periodEnd: '15/07/2025',
      amount: 399000,
      purchasedAt: '15/04/2025',
      status: 'success',
    },
    {
      id: '2',
      transactionCode: 'SUB-20250115',
      planName: 'Pro',
      planTier: 'pro',
      periodStart: '15/01/2025',
      periodEnd: '15/04/2025',
      amount: 399000,
      purchasedAt: '15/01/2025',
      status: 'expired',
    },
    {
      id: '3',
      transactionCode: 'SUB-20241015',
      planName: 'Free',
      planTier: 'free',
      periodStart: '15/10/2024',
      periodEnd: '15/01/2025',
      amount: 0,
      purchasedAt: '15/10/2024',
      status: 'expired',
    },
  ]

  describe('Render', () => {
    it('should render table header', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      expect(screen.getByText('Lịch sử thanh toán')).toBeInTheDocument()
    })

    it('should render transaction count', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      expect(screen.getByText('3 giao dịch')).toBeInTheDocument()
    })

    it('should render table column headers', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      expect(screen.getByText('Mã giao dịch')).toBeInTheDocument()
      expect(screen.getByText('Gói')).toBeInTheDocument()
      expect(screen.getByText('Kỳ hạn')).toBeInTheDocument()
      expect(screen.getByText('Số tiền')).toBeInTheDocument()
      expect(screen.getByText('Ngày mua')).toBeInTheDocument()
      expect(screen.getByText('Trạng thái')).toBeInTheDocument()
    })

    it('should render transaction codes', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      expect(screen.getByText('#SUB-20250415')).toBeInTheDocument()
      expect(screen.getByText('#SUB-20250115')).toBeInTheDocument()
    })

    it('should render plan names with tier styling', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      expect(screen.getByText('Pro')).toBeInTheDocument()
      expect(screen.getByText('Free')).toBeInTheDocument()
    })

    it('should render period ranges', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      expect(screen.getByText('15/04/2025 – 15/07/2025')).toBeInTheDocument()
    })

    it('should render formatted amounts', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      expect(screen.getByText('399.000 ₫')).toBeInTheDocument()
    })

    it('should render "Miễn phí" for zero amount', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      expect(screen.getByText('Miễn phí')).toBeInTheDocument()
    })

    it('should render purchased dates', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      expect(screen.getByText('15/04/2025')).toBeInTheDocument()
    })
  })

  describe('Status Display', () => {
    it('should render success status', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      expect(screen.getByText('Thành công')).toBeInTheDocument()
    })

    it('should render expired status', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      expect(screen.getAllByText('Đã hết hạn')).toHaveLength(2)
    })

    it('should render pending status', () => {
      const pendingData: SubscriptionHistoryItem[] = [
        {
          id: '4',
          transactionCode: 'SUB-20250716',
          planName: 'Business',
          planTier: 'business',
          periodStart: '16/07/2025',
          periodEnd: '16/08/2025',
          amount: 999000,
          purchasedAt: '—',
          status: 'pending',
        },
      ]
      render(<SubscriptionHistoryTable data={pendingData} />)
      expect(screen.getByText('Chờ xử lý')).toBeInTheDocument()
    })

    it('should render failed status', () => {
      const failedData: SubscriptionHistoryItem[] = [
        {
          id: '5',
          transactionCode: 'SUB-FAIL',
          planName: 'Pro',
          planTier: 'pro',
          periodStart: '01/01/2025',
          periodEnd: '01/02/2025',
          amount: 399000,
          purchasedAt: '01/01/2025',
          status: 'failed',
        },
      ]
      render(<SubscriptionHistoryTable data={failedData} />)
      expect(screen.getByText('Thất bại')).toBeInTheDocument()
    })
  })

  describe('Invoice Button', () => {
    it('should show invoice button for success status', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      expect(screen.getByText('Hoá đơn')).toBeInTheDocument()
    })

    it('should show invoice button for expired status', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      const invoiceButtons = screen.getAllByText('Hoá đơn')
      expect(invoiceButtons.length).toBeGreaterThan(0)
    })

    it('should show dash for pending status', () => {
      const pendingData: SubscriptionHistoryItem[] = [
        {
          id: '4',
          transactionCode: 'SUB-20250716',
          planName: 'Business',
          planTier: 'business',
          periodStart: '16/07/2025',
          periodEnd: '16/08/2025',
          amount: 999000,
          purchasedAt: '—',
          status: 'pending',
        },
      ]
      render(<SubscriptionHistoryTable data={pendingData} />)
      expect(screen.getByText('—')).toBeInTheDocument()
    })

    it('should show dash for failed status', () => {
      const failedData: SubscriptionHistoryItem[] = [
        {
          id: '5',
          transactionCode: 'SUB-FAIL',
          planName: 'Pro',
          planTier: 'pro',
          periodStart: '01/01/2025',
          periodEnd: '01/02/2025',
          amount: 399000,
          purchasedAt: '01/01/2025',
          status: 'failed',
        },
      ]
      render(<SubscriptionHistoryTable data={failedData} />)
      expect(screen.getByText('—')).toBeInTheDocument()
    })
  })

  describe('Plan Tier Styling', () => {
    it('should style free tier with slate color', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      const freeTier = screen.getByText('Free')
      expect(freeTier).toHaveClass('text-slate-400')
    })

    it('should style pro tier with amber color', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      const proTier = screen.getByText('Pro')
      expect(proTier).toHaveClass('text-amber-400')
    })

    it('should style business tier with purple color', () => {
      const businessData: SubscriptionHistoryItem[] = [
        {
          id: '6',
          transactionCode: 'SUB-BIZ',
          planName: 'Business',
          planTier: 'business',
          periodStart: '01/01/2025',
          periodEnd: '01/02/2025',
          amount: 999000,
          purchasedAt: '01/01/2025',
          status: 'success',
        },
      ]
      render(<SubscriptionHistoryTable data={businessData} />)
      const businessTier = screen.getByText('Business')
      expect(businessTier).toHaveClass('text-purple-400')
    })
  })

  describe('Default Data', () => {
    it('should render with mock data when no data prop provided', () => {
      render(<SubscriptionHistoryTable />)
      expect(screen.getByText('Lịch sử thanh toán')).toBeInTheDocument()
      expect(screen.getByText('4 giao dịch')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should render with dark background', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      const table = screen.getByText('Lịch sử thanh toán').closest('.rounded-2xl')
      expect(table).toHaveClass('bg-[#18122B]')
    })

    it('should render with border', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      const table = screen.getByText('Lịch sử thanh toán').closest('.border')
      expect(table).toHaveClass('border-white/8')
    })

    it('should render table header with bottom border', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      const header = screen.getByText('Lịch sử thanh toán').closest('.border-b')
      expect(header).toHaveClass('border-b', 'border-white/8')
    })

    it('should render transaction rows with hover effect', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      const row = screen.getByText('#SUB-20250415').closest('tr')
      expect(row).toHaveClass('hover:bg-white/[0.025]')
    })

    it('should render transaction codes with mono font', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      const code = screen.getByText('#SUB-20250415')
      expect(code).toHaveClass('font-mono')
    })

    it('should render amounts with bold font', () => {
      render(<SubscriptionHistoryTable data={mockData} />)
      const amount = screen.getByText('399.000 ₫')
      expect(amount).toHaveClass('font-semibold')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty data array', () => {
      render(<SubscriptionHistoryTable data={[]} />)
      expect(screen.getByText('Lịch sử thanh toán')).toBeInTheDocument()
      expect(screen.getByText('0 giao dịch')).toBeInTheDocument()
    })

    it('should handle very long transaction codes', () => {
      const longCodeData: SubscriptionHistoryItem[] = [
        {
          id: '1',
          transactionCode: 'A'.repeat(100),
          planName: 'Pro',
          planTier: 'pro',
          periodStart: '01/01/2025',
          periodEnd: '01/02/2025',
          amount: 399000,
          purchasedAt: '01/01/2025',
          status: 'success',
        },
      ]
      render(<SubscriptionHistoryTable data={longCodeData} />)
      expect(screen.getByText('#' + 'A'.repeat(100))).toBeInTheDocument()
    })

    it('should handle large amounts', () => {
      const largeAmountData: SubscriptionHistoryItem[] = [
        {
          id: '1',
          transactionCode: 'SUB-LARGE',
          planName: 'Business',
          planTier: 'business',
          periodStart: '01/01/2025',
          periodEnd: '01/02/2025',
          amount: 10000000,
          purchasedAt: '01/01/2025',
          status: 'success',
        },
      ]
      render(<SubscriptionHistoryTable data={largeAmountData} />)
      expect(screen.getByText('10.000.000 ₫')).toBeInTheDocument()
    })

    it('should handle special characters in plan names', () => {
      const specialData: SubscriptionHistoryItem[] = [
        {
          id: '1',
          transactionCode: 'SUB-SPEC',
          planName: 'Pro <Premium>',
          planTier: 'pro',
          periodStart: '01/01/2025',
          periodEnd: '01/02/2025',
          amount: 399000,
          purchasedAt: '01/01/2025',
          status: 'success',
        },
      ]
      render(<SubscriptionHistoryTable data={specialData} />)
      expect(screen.getByText('Pro <Premium>')).toBeInTheDocument()
    })

    it('should handle many transactions', () => {
      const manyData = Array.from({ length: 20 }, (_, i) => ({
        id: String(i),
        transactionCode: `SUB-${i}`,
        planName: 'Pro',
        planTier: 'pro' as const,
        periodStart: `01/${String(i + 1).padStart(2, '0')}/2025`,
        periodEnd: `01/${String(i + 2).padStart(2, '0')}/2025`,
        amount: 399000,
        purchasedAt: `01/${String(i + 1).padStart(2, '0')}/2025`,
        status: 'success' as const,
      }))
      render(<SubscriptionHistoryTable data={manyData} />)
      expect(screen.getByText('20 giao dịch')).toBeInTheDocument()
    })
  })
})
