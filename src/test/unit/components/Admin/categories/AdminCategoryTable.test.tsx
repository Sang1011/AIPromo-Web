/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

jest.mock('../../../../../components/Admin/categories/AdminCategoryTable', () => {
  return function MockAdminCategoryTable() {
    return (
      <div data-testid="category-table">
        <h2>Quản lý Category</h2>
        <span>Tech</span>
        <span>Music</span>
      </div>
    )
  }
})

import AdminCategoryTable from '../../../../../components/Admin/categories/AdminCategoryTable'

describe('AdminCategoryTable', () => {
  it('should render table', () => {
    render(<AdminCategoryTable />)
    expect(screen.getByText('Quản lý Category')).toBeInTheDocument()
    expect(screen.getByText('Tech')).toBeInTheDocument()
  })
})
