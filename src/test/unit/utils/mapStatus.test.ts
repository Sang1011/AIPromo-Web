/// <reference types="jest" />

import { mapStatus, convertFilterToApiStatus } from '../../../utils/mapStatus'
import type { FilterStatus } from '../../../components/Organizer/shared/StatusFilters'

describe('mapStatus', () => {
  describe('mapStatus function', () => {
    it('should map Published status correctly', () => {
      const result = mapStatus('Published')
      expect(result).toEqual({
        status: 'upcoming',
        label: 'Đang hoạt động',
        color: 'amber',
      })
    })

    it('should map Draft status correctly', () => {
      const result = mapStatus('Draft')
      expect(result).toEqual({
        status: 'draft',
        label: 'Bản nháp',
        color: 'slate',
      })
    })

    it('should map Suspended status correctly', () => {
      const result = mapStatus('Suspended')
      expect(result).toEqual({
        status: 'suspend',
        label: 'Trì hoãn',
        color: 'cyan',
      })
    })

    it('should map Cancelled status correctly', () => {
      const result = mapStatus('Cancelled')
      expect(result).toEqual({
        status: 'past',
        label: 'Đã huỷ',
        color: 'red',
      })
    })

    it('should map PendingReview status correctly', () => {
      const result = mapStatus('PendingReview')
      expect(result).toEqual({
        status: 'pending',
        label: 'Chờ duyệt',
        color: 'blue',
      })
    })

    it('should map PendingCancellation status correctly', () => {
      const result = mapStatus('PendingCancellation')
      expect(result).toEqual({
        status: 'pending',
        label: 'Chờ huỷ',
        color: 'orange',
      })
    })

    it('should map Completed status correctly', () => {
      const result = mapStatus('Completed')
      expect(result).toEqual({
        status: 'past',
        label: 'Đã kết thúc',
        color: 'emerald',
      })
    })

    it('should handle unknown status with fallback', () => {
      const result = mapStatus('UnknownStatus' as any)
      expect(result).toEqual({
        status: 'draft',
        label: 'UnknownStatus',
        color: 'slate',
      })
    })
  })

  describe('convertFilterToApiStatus', () => {
    it('should map Draft filter to API status', () => {
      const result = convertFilterToApiStatus('Draft' as FilterStatus)
      expect(result).toBe('draft')
    })

    it('should map Pending filter to multiple API statuses', () => {
      const result = convertFilterToApiStatus('Pending' as FilterStatus)
      expect(result).toContain('pendingreview')
      expect(result).toContain('pendingcancellation')
      expect(result).toBe('pendingreview,pendingcancellation')
    })

    it('should map Upcoming filter to API status', () => {
      const result = convertFilterToApiStatus('Upcoming' as FilterStatus)
      expect(result).toBe('published')
    })

    it('should map Past filter to API status', () => {
      const result = convertFilterToApiStatus('Past' as FilterStatus)
      expect(result).toContain('completed')
      expect(result).toContain('cancelled')
    })

    it('should map Suspend filter to API status', () => {
      const result = convertFilterToApiStatus('Suspend' as FilterStatus)
      expect(result).toBe('suspended')
    })

    it('should return lowercase string', () => {
      const result = convertFilterToApiStatus('Draft' as FilterStatus)
      expect(result).toBe(result.toLowerCase())
    })
  })
})
