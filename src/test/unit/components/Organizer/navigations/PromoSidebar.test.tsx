/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

import PromoSidebar from '../../../../../components/Organizer/navigations/PromoSidebar'

describe('PromoSidebar', () => {
  describe('Render', () => {
    it('should render without crashing', () => {
      render(<PromoSidebar />)
      expect(screen.getByText('AIPromo Manager')).toBeInTheDocument()
    })

    it('should render tagline text', () => {
      render(<PromoSidebar />)
      expect(screen.getByText(/Quản lý sự kiện dễ dàng/)).toBeInTheDocument()
    })

    it('should render description text', () => {
      render(<PromoSidebar />)
      expect(screen.getByText(/Tất cả thông tin doanh thu/)).toBeInTheDocument()
    })

    it('should render download section title', () => {
      render(<PromoSidebar />)
      expect(screen.getByText(/Tải ứng dụng ngay/)).toBeInTheDocument()
    })

    it('should render QR code image', () => {
      render(<PromoSidebar />)
      const qrImage = screen.getByAltText('QR Code')
      expect(qrImage).toBeInTheDocument()
      expect(qrImage).toHaveAttribute('src', expect.stringContaining('googleusercontent.com'))
    })

    it('should render phone mockup', () => {
      render(<PromoSidebar />)
      const phoneMockup = screen.getByText('AIPromo Manager').closest('.glass')
      expect(phoneMockup).toBeInTheDocument()
    })

    it('should render with correct styling', () => {
      render(<PromoSidebar />)
      const sidebar = screen.getByText('AIPromo Manager').closest('.glass')
      expect(sidebar).toHaveClass('rounded-3xl', 'p-6', 'sticky')
    })
  })

  describe('Styling', () => {
    it('should use glass-morphism effect', () => {
      render(<PromoSidebar />)
      const sidebar = screen.getByText('AIPromo Manager').closest('.glass')
      expect(sidebar).toHaveClass('glass')
    })

    it('should render with rounded corners', () => {
      render(<PromoSidebar />)
      const sidebar = screen.getByText('AIPromo Manager').closest('.rounded-3xl')
      expect(sidebar).toBeInTheDocument()
    })

    it('should render phone mockup with correct dimensions', () => {
      render(<PromoSidebar />)
      const phoneElement = document.querySelector('.w-48.h-80')
      expect(phoneElement).toBeInTheDocument()
    })

    it('should render QR code with correct size', () => {
      render(<PromoSidebar />)
      const qrImage = screen.getByAltText('QR Code')
      expect(qrImage).toHaveClass('w-24', 'h-24')
    })
  })

  describe('Layout', () => {
    it('should render with vertical spacing', () => {
      render(<PromoSidebar />)
      const sidebar = screen.getByText('AIPromo Manager').closest('.space-y-8')
      expect(sidebar).toBeInTheDocument()
    })

    it('should render download section with border separator', () => {
      render(<PromoSidebar />)
      const downloadSection = screen.getByText(/Tải ứng dụng ngay/).closest('.border-t')
      expect(downloadSection).toBeInTheDocument()
    })

    it('should render phone mockup centered', () => {
      render(<PromoSidebar />)
      const phoneContainer = document.querySelector('.flex.justify-center')
      expect(phoneContainer).toBeInTheDocument()
    })

    it('should render glow effect behind phone', () => {
      render(<PromoSidebar />)
      const glowEffect = document.querySelector('.bg-primary\\/20.blur-\\[60px\\]')
      expect(glowEffect).toBeInTheDocument()
    })
  })
})
