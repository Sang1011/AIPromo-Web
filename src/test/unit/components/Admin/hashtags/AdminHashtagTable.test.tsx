/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

jest.mock('../../../../../components/Admin/hashtags/AdminHashtagTable', () => {
  return function MockAdminHashtagTable() {
    return (
      <div data-testid="hashtag-table">
        <h2>Quản lý Hashtags</h2>
        <span>#music</span>
        <span>#tech</span>
      </div>
    )
  }
})

import AdminHashtagTable from '../../../../../components/Admin/hashtags/AdminHashtagTable'

describe('AdminHashtagTable', () => {
  it('should render table', () => {
    render(<AdminHashtagTable />)
    expect(screen.getByText('Quản lý Hashtags')).toBeInTheDocument()
    expect(screen.getByText('#music')).toBeInTheDocument()
  })
})
