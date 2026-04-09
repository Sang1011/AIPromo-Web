/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

import OrdersTable from '../../../../../components/Organizer/orders/OrdersTable'
import type { OrderItemOrganizer } from '../../../../../types/ticketing/ticketing'

describe('OrdersTable', () => {
  const createMockOrder = (overrides: Partial<OrderItemOrganizer> = {}): OrderItemOrganizer => ({
    orderId: 'ORD-12345678',
    createdAt: '2024-12-01T10:30:00Z',
    buyerName: 'John Doe',
    buyerEmail: 'john@example.com',
    originalPrice: 500000,
    discountAmount: 50000,
    voucherCode: 'SAVE10',
    totalPrice: 450000,
    status: 'paid',
    ...overrides,
  })

  describe('Render', () => {
    it('should render order count', () => {
      const orders = [createMockOrder(), createMockOrder()]
      render(<OrdersTable orders={orders} />)
      expect(screen.getByText('Có')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('đơn hàng')).toBeInTheDocument()
    })

    it('should render table headers', () => {
      render(<OrdersTable orders={[createMockOrder()]} />)
      expect(screen.getByText('Order ID')).toBeInTheDocument()
      expect(screen.getByText('Ngày tạo')).toBeInTheDocument()
      expect(screen.getByText('Người mua')).toBeInTheDocument()
      expect(screen.getByText('Giá gốc')).toBeInTheDocument()
      expect(screen.getByText('Giảm giá')).toBeInTheDocument()
      expect(screen.getByText('Thành tiền')).toBeInTheDocument()
      expect(screen.getByText('Trạng thái')).toBeInTheDocument()
    })

    it('should render order ID (truncated)', () => {
      render(<OrdersTable orders={[createMockOrder({ orderId: 'ORD-ABCDEFGH' })]} />)
      expect(screen.getByText('ORD-ABCD…')).toBeInTheDocument()
    })

    it('should show full order ID on hover via title attribute', () => {
      render(<OrdersTable orders={[createMockOrder({ orderId: 'ORD-12345678' })]} />)
      const orderIdElement = screen.getByText('ORD-1234…')
      expect(orderIdElement).toHaveAttribute('title', 'ORD-12345678')
    })

    it('should render formatted date', () => {
      render(<OrdersTable orders={[createMockOrder()]} />)
      expect(screen.getByText('01/12/2024')).toBeInTheDocument()
    })

    it('should render buyer name and email', () => {
      render(<OrdersTable orders={[createMockOrder()]} />)
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('should render formatted prices', () => {
      render(<OrdersTable orders={[createMockOrder()]} />)
      expect(screen.getByText('500.000')).toBeInTheDocument()
      expect(screen.getByText('450.000')).toBeInTheDocument()
    })

    it('should render voucher code with badge', () => {
      render(<OrdersTable orders={[createMockOrder()]} />)
      expect(screen.getByText('SAVE10')).toBeInTheDocument()
    })

    it('should render discount amount', () => {
      render(<OrdersTable orders={[createMockOrder()]} />)
      expect(screen.getByText('-50.000')).toBeInTheDocument()
    })

    it('should render status badge', () => {
      render(<OrdersTable orders={[createMockOrder()]} />)
      expect(screen.getByText('Hoàn thành')).toBeInTheDocument()
    })
  })

  describe('Status Mapping', () => {
    it('should map pending status correctly', () => {
      render(<OrdersTable orders={[createMockOrder({ status: 'pending' })]} />)
      expect(screen.getByText('Chờ xử lý')).toBeInTheDocument()
    })

    it('should map paid status correctly', () => {
      render(<OrdersTable orders={[createMockOrder({ status: 'paid' })]} />)
      expect(screen.getByText('Hoàn thành')).toBeInTheDocument()
    })

    it('should map cancelled status correctly', () => {
      render(<OrdersTable orders={[createMockOrder({ status: 'cancelled' })]} />)
      expect(screen.getByText('Đã huỷ')).toBeInTheDocument()
    })

    it('should handle unknown status with fallback', () => {
      render(<OrdersTable orders={[createMockOrder({ status: 'unknown' })]} />)
      expect(screen.getByText('unknown')).toBeInTheDocument()
    })
  })

  describe('Voucher Display', () => {
    it('should show voucher badge when voucher code exists', () => {
      render(<OrdersTable orders={[createMockOrder({ voucherCode: 'DISCOUNT20' })]} />)
      expect(screen.getByText('DISCOUNT20')).toBeInTheDocument()
    })

    it('should show dash when no voucher code', () => {
      render(<OrdersTable orders={[createMockOrder({ voucherCode: '', discountAmount: 0 })]} />)
      expect(screen.getByText('—')).toBeInTheDocument()
    })

    it('should show dash when voucher code is whitespace', () => {
      render(<OrdersTable orders={[createMockOrder({ voucherCode: '   ' })]} />)
      expect(screen.getByText('—')).toBeInTheDocument()
    })

    it('should show saved amount when discount > 0', () => {
      render(<OrdersTable orders={[createMockOrder({ discountAmount: 100000 })]} />)
      expect(screen.getByText('Tiết kiệm 100.000')).toBeInTheDocument()
    })

    it('should not show saved amount when discount is 0', () => {
      render(<OrdersTable orders={[createMockOrder({ discountAmount: 0 })]} />)
      expect(screen.queryByText(/Tiết kiệm/)).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty message when no orders', () => {
      render(<OrdersTable orders={[]} />)
      expect(screen.getByText('Không có đơn hàng nào')).toBeInTheDocument()
    })

    it('should not show table headers when empty', () => {
      render(<OrdersTable orders={[]} />)
      expect(screen.queryByText('Order ID')).not.toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should render with gradient background', () => {
      render(<OrdersTable orders={[createMockOrder()]} />)
      const table = screen.getByText('Order ID').closest('.rounded-2xl')
      expect(table).toHaveClass('bg-gradient-to-b')
    })

    it('should render with border', () => {
      render(<OrdersTable orders={[createMockOrder()]} />)
      const table = screen.getByText('Order ID').closest('.rounded-2xl')
      expect(table).toHaveClass('border-white/5')
    })

    it('should apply hover effect on rows', () => {
      render(<OrdersTable orders={[createMockOrder()]} />)
      const orderRow = screen.getByText('ORD-1234…').closest('.hover\\:bg-white\\/\\[0\\.03\\]')
      expect(orderRow).toBeInTheDocument()
    })

    it('should render order ID with mono font and violet color', () => {
      render(<OrdersTable orders={[createMockOrder()]} />)
      const orderIdElement = screen.getByText('ORD-1234…')
      expect(orderIdElement).toHaveClass('font-mono', 'text-violet-400')
    })

    it('should render status badge with correct colors for paid status', () => {
      render(<OrdersTable orders={[createMockOrder()]} />)
      const statusBadge = screen.getByText('Hoàn thành')
      expect(statusBadge).toHaveClass('bg-emerald-400/15', 'text-emerald-300')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long order IDs', () => {
      const longOrderId = 'A'.repeat(50)
      render(<OrdersTable orders={[createMockOrder({ orderId: longOrderId })]} />)
      expect(screen.getByText('AAAAAAAA…')).toBeInTheDocument()
      expect(screen.getByTitle(longOrderId)).toBeInTheDocument()
    })

    it('should handle orders without buyer name', () => {
      render(<OrdersTable orders={[createMockOrder({ buyerName: '' })]} />)
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('should handle orders without buyer email', () => {
      render(<OrdersTable orders={[createMockOrder({ buyerEmail: '' })]} />)
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should handle large price values', () => {
      render(<OrdersTable orders={[createMockOrder({ originalPrice: 1000000000 })]} />)
      expect(screen.getByText('1.000.000.000')).toBeInTheDocument()
    })

    it('should handle zero prices', () => {
      render(<OrdersTable orders={[createMockOrder({ originalPrice: 0, totalPrice: 0 })]} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle negative discount (surcharge)', () => {
      render(<OrdersTable orders={[createMockOrder({ discountAmount: -100000 })]} />)
      expect(screen.getByText('Tiết kiệm')).toBeInTheDocument()
    })

    it('should render many orders correctly', () => {
      const manyOrders = Array.from({ length: 10 }, (_, i) =>
        createMockOrder({ orderId: `ORD-${i}` })
      )
      render(<OrdersTable orders={manyOrders} />)
      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })
})
