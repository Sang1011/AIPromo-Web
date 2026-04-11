/// <reference types="jest" />
import React from 'react'
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminFloatingMenu from '../../../../../components/Admin/categories/AdminFloatingMenu'

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}))

describe('AdminFloatingMenu', () => {
  const mockOnClose = jest.fn()
  const mockRect = {
    bottom: 100,
    right: 200,
    top: 80,
    left: 150,
    width: 50,
    height: 30,
  } as DOMRect

  const mockItems = [
    { key: 'active', label: 'Hoạt động', onClick: jest.fn(), active: true },
    { key: 'paused', label: 'Tạm dừng', onClick: jest.fn(), active: false },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    global.innerHeight = 800
    global.innerWidth = 1200
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<AdminFloatingMenu rect={mockRect} items={mockItems} onClose={mockOnClose} />)
      })
      expect(screen.getByText('Hoạt động')).toBeInTheDocument()
      expect(screen.getByText('Tạm dừng')).toBeInTheDocument()
    })

    it('should render all menu items', async () => {
      await act(async () => {
        render(<AdminFloatingMenu rect={mockRect} items={mockItems} onClose={mockOnClose} />)
      })
      expect(screen.getAllByRole('button')).toHaveLength(2)
    })

    it('should call onClick and onClose when item clicked', async () => {
      await act(async () => {
        render(<AdminFloatingMenu rect={mockRect} items={mockItems} onClose={mockOnClose} />)
      })
      await act(async () => {
        screen.getByText('Hoạt động').click()
      })
      expect(mockItems[0].onClick).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})
