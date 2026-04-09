/// <reference types="jest" />

import { clearOldOrderFromFirebase } from '../../../utils/orderFirebase'
import { remove, ref } from 'firebase/database'
import { db } from '../../../config/firebase'

jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  remove: jest.fn(),
}))

jest.mock('../../../config/firebase', () => ({
  db: {},
}))

describe('orderFirebase', () => {
  const mockRef = ref as jest.Mock
  const mockRemove = remove as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => { })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('clearOldOrderFromFirebase', () => {
    it('should remove order from Firebase when orderId exists', async () => {
      const mockOrderId = 'order-123'
      localStorage.setItem('currentOrderId', mockOrderId)
      mockRemove.mockResolvedValue(undefined)

      await clearOldOrderFromFirebase()

      expect(mockRef).toHaveBeenCalledWith(db, `pendingOrders/${mockOrderId}`)
      expect(mockRemove).toHaveBeenCalled()
    })

    it('should clear localStorage after successful removal', async () => {
      localStorage.setItem('currentOrderId', 'order-123')
      mockRemove.mockResolvedValue(undefined)

      await clearOldOrderFromFirebase()

      expect(localStorage.getItem('currentOrderId')).toBeNull()
    })

    it('should do nothing when currentOrderId is null', async () => {
      localStorage.removeItem('currentOrderId')

      await clearOldOrderFromFirebase()

      expect(mockRef).not.toHaveBeenCalled()
      expect(mockRemove).not.toHaveBeenCalled()
    })

    it('should do nothing when currentOrderId is empty string', async () => {
      localStorage.setItem('currentOrderId', '')

      await clearOldOrderFromFirebase()

      expect(mockRef).not.toHaveBeenCalled()
      expect(mockRemove).not.toHaveBeenCalled()
    })

    it('should throw error when Firebase remove fails', async () => {
      const mockOrderId = 'order-123'
      localStorage.setItem('currentOrderId', mockOrderId)
      mockRemove.mockRejectedValue(new Error('Firebase error'))

      await expect(clearOldOrderFromFirebase()).rejects.toThrow('Firebase error')
    })

    it('should not clear localStorage when remove fails', async () => {
      const mockOrderId = 'order-123'
      localStorage.setItem('currentOrderId', mockOrderId)
      mockRemove.mockRejectedValue(new Error('Firebase error'))

      await expect(clearOldOrderFromFirebase()).rejects.toThrow()

      expect(localStorage.getItem('currentOrderId')).toBe(mockOrderId)
    })
  })

  describe('Edge cases', () => {
    it('should handle whitespace-only orderId', async () => {
      localStorage.setItem('currentOrderId', '   ')
      mockRemove.mockResolvedValue(undefined)

      await clearOldOrderFromFirebase()

      // Whitespace string is truthy, so it will try to remove
      expect(mockRef).toHaveBeenCalled()
    })

    it('should handle special characters in orderId', async () => {
      const mockOrderId = 'order-123_abc!@#'
      localStorage.setItem('currentOrderId', mockOrderId)
      mockRemove.mockResolvedValue(undefined)

      await clearOldOrderFromFirebase()

      expect(mockRef).toHaveBeenCalledWith(db, `pendingOrders/${mockOrderId}`)
    })

    it('should handle very long orderId', async () => {
      const mockOrderId = 'a'.repeat(500)
      localStorage.setItem('currentOrderId', mockOrderId)
      mockRemove.mockResolvedValue(undefined)

      await clearOldOrderFromFirebase()

      expect(mockRef).toHaveBeenCalledWith(db, `pendingOrders/${mockOrderId}`)
    })
  })
})
