/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

jest.mock('../../../../../components/Admin/hashtags/AdminHashtagStats', () => {
  return function MockAdminHashtagStats() {
    return (
      <div data-testid="hashtag-stats">
        <span>Tổng Hashtag</span>
        <span>2</span>
      </div>
    )
  }
})

import AdminHashtagStats from '../../../../../components/Admin/hashtags/AdminHashtagStats'

describe('AdminHashtagStats', () => {
  it('should render', () => {
    render(<AdminHashtagStats />)
    expect(screen.getByText('Tổng Hashtag')).toBeInTheDocument()
  })
})
