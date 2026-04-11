/// <reference types="jest" />
import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import AdminUserStats from '../../../../../components/Admin/users/AdminUserStats'

let mockUserState: any = {}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({ USER: mockUserState }),
}))

jest.mock('react-icons/md', () => ({
  MdGroup: () => <span data-testid="icon-group" />,
  MdBusinessCenter: () => <span data-testid="icon-business" />,
  MdPerson: () => <span data-testid="icon-person" />,
}))

describe('AdminUserStats', () => {
  beforeEach(() => {
    mockUserState = {
      users: [
        { userId: '1', roles: ['Organizer'], firstName: 'John', lastName: 'Doe' },
        { userId: '2', roles: ['Attendee'], firstName: 'Jane', lastName: 'Smith' },
        { userId: '3', roles: ['Organizer', 'Attendee'], firstName: 'Bob', lastName: 'Lee' },
      ],
    }
  })

  describe('Render', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<AdminUserStats />)
      })
      expect(screen.getByText('Tổng Người dùng')).toBeInTheDocument()
    })

    it('should display total users', async () => {
      await act(async () => {
        render(<AdminUserStats />)
      })
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should display organizer count', async () => {
      await act(async () => {
        render(<AdminUserStats />)
      })
      expect(screen.getByText('Người tổ chức')).toBeInTheDocument()
    })

    it('should display attendee count', async () => {
      await act(async () => {
        render(<AdminUserStats />)
      })
      expect(screen.getByText('Người tham dự')).toBeInTheDocument()
    })

    it('should handle empty users array', async () => {
      mockUserState.users = []
      await act(async () => {
        render(<AdminUserStats />)
      })
      expect(screen.getAllByText('0').length).toBeGreaterThan(0)
    })
  })
})
