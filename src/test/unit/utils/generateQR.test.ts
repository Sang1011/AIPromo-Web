/// <reference types="jest" />

import { generateQR } from '../../../utils/generateQR'
import QRCode from 'qrcode'

jest.mock('qrcode')

describe('generateQR', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => { })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Basic functionality', () => {
    it('should generate QR code as base64 data URL', async () => {
      const mockDataURL = 'data:image/png;base64,mock-qr-code'
        ; (QRCode.toDataURL as jest.Mock).mockResolvedValue(mockDataURL)

      const result = await generateQR('https://example.com')

      expect(result).toBe(mockDataURL)
      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        'https://example.com',
        {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          margin: 2,
          width: 300,
        }
      )
    })

    it('should use high error correction level', async () => {
      ; (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,mock')

      await generateQR('test')

      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        'test',
        expect.objectContaining({
          errorCorrectionLevel: 'H',
        })
      )
    })

    it('should use fixed width of 300px', async () => {
      ; (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,mock')

      await generateQR('test')

      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        'test',
        expect.objectContaining({
          width: 300,
        })
      )
    })
  })

  describe('Different input types', () => {
    it('should handle URL strings', async () => {
      ; (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,url')

      const result = await generateQR('https://example.com/event/123')

      expect(result).toContain('data:image/png')
    })

    it('should handle plain text', async () => {
      ; (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,text')

      const result = await generateQR('Simple text message')

      expect(result).toContain('data:image/png')
    })

    it('should handle long strings', async () => {
      const longText = 'a'.repeat(1000)
        ; (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,long')

      const result = await generateQR(longText)

      expect(result).toContain('data:image/png')
    })

    it('should handle special characters', async () => {
      ; (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,special')

      const result = await generateQR('Special chars: !@#$%^&*()_+{}|:"<>?')

      expect(result).toContain('data:image/png')
    })

    it('should handle unicode characters', async () => {
      ; (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,unicode')

      const result = await generateQR('Tiếng Việt có dấu')

      expect(result).toContain('data:image/png')
    })
  })

  describe('Error handling', () => {
    it('should throw error when QR generation fails', async () => {
      ; (QRCode.toDataURL as jest.Mock).mockRejectedValue(new Error('QR generation failed'))

      await expect(generateQR('test')).rejects.toThrow('QR generation failed')
    })

    it('should log error to console before throwing', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error')
        ; (QRCode.toDataURL as jest.Mock).mockRejectedValue(new Error('Failed'))

      await expect(generateQR('test')).rejects.toThrow()

      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should re-throw the original error', async () => {
      const originalError = new Error('Custom error')
        ; (QRCode.toDataURL as jest.Mock).mockRejectedValue(originalError)

      await expect(generateQR('test')).rejects.toThrow('Custom error')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty string', async () => {
      ; (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,empty')

      const result = await generateQR('')

      expect(result).toContain('data:image/png')
    })

    it('should handle numeric strings', async () => {
      ; (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,numeric')

      const result = await generateQR('1234567890')

      expect(result).toContain('data:image/png')
    })

    it('should handle JSON strings', async () => {
      const json = JSON.stringify({ id: '123', type: 'event' })
        ; (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,json')

      const result = await generateQR(json)

      expect(result).toContain('data:image/png')
    })
  })
})
