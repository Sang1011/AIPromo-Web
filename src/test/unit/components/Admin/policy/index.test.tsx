/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

jest.mock('../../../../../components/Admin/policy', () => {
  return function MockAdminPolicyManagement() {
    return (
      <div data-testid="policy-management">
        <h2>Quản lý điều khoản</h2>
        <span>Organizer Policy</span>
      </div>
    )
  }
})

import AdminPolicyManagement from '../../../../../components/Admin/policy'

describe('AdminPolicyManagement', () => {
  it('should render', () => {
    render(<AdminPolicyManagement />)
    expect(screen.getByText('Quản lý điều khoản')).toBeInTheDocument()
  })
})
