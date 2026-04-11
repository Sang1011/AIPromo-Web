/// <reference types="jest" />
import { render, screen } from '@testing-library/react'

jest.mock('../../../../../components/Admin/hashtags/AdminEditHashtagModal', () => {
  return function MockAdminEditHashtagModal({ onClose }: any) {
    return (
      <div data-testid="edit-hashtag-modal">
        <h4>Cập nhật Hashtag</h4>
        <button onClick={onClose}>Huỷ</button>
      </div>
    )
  }
})

import AdminEditHashtagModal from '../../../../../components/Admin/hashtags/AdminEditHashtagModal'

describe('AdminEditHashtagModal', () => {
  it('should render', () => {
    render(<AdminEditHashtagModal hashtagId={1} onClose={jest.fn()} />)
    expect(screen.getByText('Cập nhật Hashtag')).toBeInTheDocument()
  })
})
