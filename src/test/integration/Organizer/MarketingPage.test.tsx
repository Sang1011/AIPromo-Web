/// <reference types="jest" />
import { act, render, screen } from '@testing-library/react'

import MarketingPage from '../../../pages/Organizer/MarketingPage'

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('../../components/Organizer/marketing/MarketingPerformanceBarChart', () => ({
  __esModule: true,
  default: () => <div data-testid="marketing-performance-chart" />,
}))

jest.mock('../../components/Organizer/marketing/PromptFormMarketing', () => ({
  __esModule: true,
  default: () => <div data-testid="prompt-form-marketing" />,
}))

jest.mock('../../components/Organizer/marketing/MarketingTable', () => ({
  __esModule: true,
  default: () => <div data-testid="marketing-table" />,
}))

// ============================================================================
// TESTS
// ============================================================================

describe('MarketingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => render(<MarketingPage />))
      expect(screen.getByTestId('marketing-performance-chart')).toBeInTheDocument()
    })

    it('should render all main sections', async () => {
      await act(async () => render(<MarketingPage />))

      expect(screen.getByTestId('marketing-performance-chart')).toBeInTheDocument()
      expect(screen.getByTestId('prompt-form-marketing')).toBeInTheDocument()
      expect(screen.getByTestId('marketing-table')).toBeInTheDocument()
    })
  })

  describe('UI Elements', () => {
    it('should render section title', async () => {
      await act(async () => render(<MarketingPage />))
      expect(screen.getByText('Tạo nội dung mới với AI')).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should render with correct container classes', async () => {
      await act(async () => render(<MarketingPage />))

      const container = screen.getByTestId('marketing-performance-chart').parentElement
      expect(container).toHaveClass('p-8', 'space-y-10', 'max-w-7xl', 'mx-auto')
    })
  })
})
