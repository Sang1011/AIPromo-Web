/// <reference types="jest" />
import { act, render, screen } from '@testing-library/react'

import ReportManagementPage from '../../../pages/Organizer/ReportManagementPage'

// ============================================================================
// MOCKS
// ============================================================================

const mockUseOutletContext = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useOutletContext: () => mockUseOutletContext(),
}))

jest.mock('../../../components/Organizer/overview/ReportTable', () => ({
  __esModule: true,
  default: () => <div data-testid="report-table" />,
}))

// ============================================================================
// TESTS
// ============================================================================

describe('ReportManagementPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseOutletContext.mockReturnValue({ setConfig: jest.fn() })
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => render(<ReportManagementPage />))
      expect(screen.getByTestId('report-table')).toBeInTheDocument()
    })
  })

  describe('Page Config', () => {
    it('should set page title on mount', async () => {
      const mockSetConfig = jest.fn()
      mockUseOutletContext.mockReturnValue({ setConfig: mockSetConfig })

      await act(async () => render(<ReportManagementPage />))

      expect(mockSetConfig).toHaveBeenCalledWith({
        title: 'Quản lý báo cáo',
      })
    })

    it('should clear config on unmount', async () => {
      const mockSetConfig = jest.fn()
      mockUseOutletContext.mockReturnValue({ setConfig: mockSetConfig })

      const { unmount } = await act(async () => render(<ReportManagementPage />))

      unmount()

      expect(mockSetConfig).toHaveBeenCalledWith({})
    })
  })
})
