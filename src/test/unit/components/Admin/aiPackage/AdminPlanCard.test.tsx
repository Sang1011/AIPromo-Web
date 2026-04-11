/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminPlanCard from '../../../../../components/Admin/aiPackage/AdminPlanCard'

jest.mock('react-icons/md', () => ({
  MdDeleteOutline: () => <span data-testid="icon-delete" />,
  MdDescription: () => <span data-testid="icon-desc" />,
  MdEdit: () => <span data-testid="icon-edit" />,
  MdToken: () => <span data-testid="icon-token" />,
  MdVisibility: () => <span data-testid="icon-visibility" />,
}))

describe('AdminPlanCard', () => {
  const mockPkg = {
    id: 'pkg1',
    name: 'Business Premium',
    description: 'A premium business package',
    type: 'Subscription' as const,
    price: 2000000,
    tokenQuota: 500,
    isActive: true,
  }

  const mockProps = {
    pkg: mockPkg,
    onView: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onToggle: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<AdminPlanCard {...mockProps} />)
      })
      expect(screen.getByText('Business Premium')).toBeInTheDocument()
    })

    it('should display price', async () => {
      await act(async () => {
        render(<AdminPlanCard {...mockProps} />)
      })
      expect(screen.getByText('2.000.000')).toBeInTheDocument()
    })

    it('should display type badge', async () => {
      await act(async () => {
        render(<AdminPlanCard {...mockProps} />)
      })
      expect(screen.getByText('Subscription')).toBeInTheDocument()
    })

    it('should display token quota', async () => {
      await act(async () => {
        render(<AdminPlanCard {...mockProps} />)
      })
      expect(screen.getByText('500')).toBeInTheDocument()
    })

    it('should call onView when view button clicked', async () => {
      await act(async () => {
        render(<AdminPlanCard {...mockProps} />)
      })
      await act(async () => {
        screen.getByRole('button', { name: /view/i }).click()
      })
      expect(mockProps.onView).toHaveBeenCalledWith('pkg1')
    })

    it('should call onEdit when edit button clicked', async () => {
      await act(async () => {
        render(<AdminPlanCard {...mockProps} />)
      })
      await act(async () => {
        screen.getByRole('button', { name: /edit/i }).click()
      })
      expect(mockProps.onEdit).toHaveBeenCalledWith('pkg1')
    })
  })
})
