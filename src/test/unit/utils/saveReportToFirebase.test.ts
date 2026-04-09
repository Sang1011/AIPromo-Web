/// <reference types="jest" />

import { saveReportToFirebase } from '../../../utils/saveReportToFirebase'
import { ref, push, set } from 'firebase/database'
import { db } from '../../../config/firebase'

jest.mock('firebase/database', () => ({
  ref: jest.fn(() => 'mock-ref'),
  push: jest.fn(() => 'mock-push'),
  set: jest.fn(() => Promise.resolve()),
}))

jest.mock('../../config/firebase', () => ({
  db: {},
}))

describe('saveReportToFirebase', () => {
  const mockRef = ref as jest.Mock
  const mockPush = push as jest.Mock
  const mockSet = set as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => { })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Basic functionality', () => {
    it('should save report to Firebase with correct path', async () => {
      mockSet.mockResolvedValue(undefined)

      await saveReportToFirebase({
        eventId: 'event-123',
        eventName: 'Test Event',
        fileName: 'report.xlsx',
        createdBy: 'user@example.com',
        createdAt: '2024-12-01T10:00:00Z',
      })

      expect(mockRef).toHaveBeenCalledWith(db, expect.stringContaining('reports'))
      expect(mockPush).toHaveBeenCalled()
      expect(mockSet).toHaveBeenCalled()
    })

    it('should sanitize email by replacing dots with commas', async () => {
      mockSet.mockResolvedValue(undefined)

      await saveReportToFirebase({
        eventId: 'event-123',
        eventName: 'Test Event',
        fileName: 'report.xlsx',
        createdBy: 'user.name@example.com',
        createdAt: '2024-12-01T10:00:00Z',
      })

      expect(mockRef).toHaveBeenCalledWith(db, expect.stringContaining('user,name@example,com'))
      expect(mockRef).not.toHaveBeenCalledWith(db, expect.stringContaining('user.name@example.com'))
    })

    it('should include eventId in path', async () => {
      mockSet.mockResolvedValue(undefined)

      await saveReportToFirebase({
        eventId: 'event-456',
        eventName: 'Test Event',
        fileName: 'report.xlsx',
        createdBy: 'user@example.com',
        createdAt: '2024-12-01T10:00:00Z',
      })

      expect(mockRef).toHaveBeenCalledWith(db, expect.stringContaining('event-456'))
    })
  })

  describe('Data saving', () => {
    it('should save correct report data', async () => {
      mockSet.mockResolvedValue(undefined)

      const reportData = {
        eventId: 'event-123',
        eventName: 'Test Event',
        fileName: 'report.xlsx',
        createdBy: 'user@example.com',
        createdAt: '2024-12-01T10:00:00Z',
      }

      await saveReportToFirebase(reportData)

      expect(mockSet).toHaveBeenCalledWith(expect.anything(), reportData)
    })

    it('should generate unique push key', async () => {
      mockSet.mockResolvedValue(undefined)

      await saveReportToFirebase({
        eventId: 'event-123',
        eventName: 'Test Event',
        fileName: 'report.xlsx',
        createdBy: 'user@example.com',
        createdAt: '2024-12-01T10:00:00Z',
      })

      expect(mockPush).toHaveBeenCalled()
    })
  })

  describe('Error handling', () => {
    it('should throw error when Firebase set fails', async () => {
      mockSet.mockRejectedValue(new Error('Firebase write failed'))

      await expect(
        saveReportToFirebase({
          eventId: 'event-123',
          eventName: 'Test Event',
          fileName: 'report.xlsx',
          createdBy: 'user@example.com',
          createdAt: '2024-12-01T10:00:00Z',
        })
      ).rejects.toThrow('Firebase write failed')
    })

    it('should log error before throwing', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error')
      mockSet.mockRejectedValue(new Error('Write failed'))

      await expect(saveReportToFirebase({
        eventId: 'event-123',
        eventName: 'Test Event',
        fileName: 'report.xlsx',
        createdBy: 'user@example.com',
        createdAt: '2024-12-01T10:00:00Z',
      })).rejects.toThrow()

      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('Edge cases', () => {
    it('should handle email without dots', async () => {
      mockSet.mockResolvedValue(undefined)

      await saveReportToFirebase({
        eventId: 'event-123',
        eventName: 'Test Event',
        fileName: 'report.xlsx',
        createdBy: 'user@example.com',
        createdAt: '2024-12-01T10:00:00Z',
      })

      expect(mockRef).toHaveBeenCalled()
    })

    it('should handle multiple dots in email', async () => {
      mockSet.mockResolvedValue(undefined)

      await saveReportToFirebase({
        eventId: 'event-123',
        eventName: 'Test Event',
        fileName: 'report.xlsx',
        createdBy: 'first.last@sub.domain.com',
        createdAt: '2024-12-01T10:00:00Z',
      })

      expect(mockRef).toHaveBeenCalledWith(
        db,
        expect.stringContaining('first,last@sub,domain,com')
      )
    })

    it('should handle long event names', async () => {
      mockSet.mockResolvedValue(undefined)

      await saveReportToFirebase({
        eventId: 'event-123',
        eventName: 'A'.repeat(200),
        fileName: 'report.xlsx',
        createdBy: 'user@example.com',
        createdAt: '2024-12-01T10:00:00Z',
      })

      expect(mockSet).toHaveBeenCalled()
    })

    it('should handle special characters in filename', async () => {
      mockSet.mockResolvedValue(undefined)

      await saveReportToFirebase({
        eventId: 'event-123',
        eventName: 'Test Event',
        fileName: 'report_2024-12-01_v1.0.xlsx',
        createdBy: 'user@example.com',
        createdAt: '2024-12-01T10:00:00Z',
      })

      expect(mockSet).toHaveBeenCalled()
    })

    it('should handle unicode characters in eventName', async () => {
      mockSet.mockResolvedValue(undefined)

      await saveReportToFirebase({
        eventId: 'event-123',
        eventName: 'Sự kiện tiếng Việt',
        fileName: 'report.xlsx',
        createdBy: 'user@example.com',
        createdAt: '2024-12-01T10:00:00Z',
      })

      expect(mockSet).toHaveBeenCalled()
    })
  })
})
