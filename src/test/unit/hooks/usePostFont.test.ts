/// <reference types="jest" />
import { renderHook } from '@testing-library/react'
import { usePostFont } from '../../../hooks/usePostFont'

describe('usePostFont', () => {
  beforeEach(() => {
    // Clean up any existing font links
    const existingLink = document.getElementById('post-block-fonts')
    if (existingLink) {
      document.head.removeChild(existingLink)
    }
  })

  afterEach(() => {
    // Clean up after each test
    const existingLink = document.getElementById('post-block-fonts')
    if (existingLink) {
      document.head.removeChild(existingLink)
    }
  })

  describe('Font loading', () => {
    it('should add Google Fonts link to document head', () => {
      expect(document.getElementById('post-block-fonts')).toBeNull()

      renderHook(() => usePostFont())

      const link = document.getElementById('post-block-fonts')
      expect(link).not.toBeNull()
      expect(link?.tagName).toBe('LINK')
      expect(link).toHaveAttribute('rel', 'stylesheet')
      expect(link).toHaveAttribute('href', expect.stringContaining('fonts.googleapis.com'))
    })

    it('should not add duplicate font links', () => {
      // Create existing link
      const existingLink = document.createElement('link')
      existingLink.id = 'post-block-fonts'
      existingLink.rel = 'stylesheet'
      existingLink.href = 'https://fonts.googleapis.com/css2?family=Test'
      document.head.appendChild(existingLink)

      expect(document.querySelectorAll('#post-block-fonts').length).toBe(1)

      renderHook(() => usePostFont())

      expect(document.querySelectorAll('#post-block-fonts').length).toBe(1)
    })

    it('should use correct font families', () => {
      renderHook(() => usePostFont())

      const link = document.getElementById('post-block-fonts')
      expect(link).toHaveAttribute('href', expect.stringContaining('Playfair+Display'))
      expect(link).toHaveAttribute('href', expect.stringContaining('DM+Sans'))
    })

    it('should use correct font weights', () => {
      renderHook(() => usePostFont())

      const link = document.getElementById('post-block-fonts')
      expect(link).toHaveAttribute('href', expect.stringContaining('wght@700;900'))
      expect(link).toHaveAttribute('href', expect.stringContaining('wght@400;500;600'))
    })
  })

  describe('Cleanup', () => {
    it('should remove font link on unmount', () => {
      const { unmount } = renderHook(() => usePostFont())

      expect(document.getElementById('post-block-fonts')).not.toBeNull()

      unmount()

      expect(document.getElementById('post-block-fonts')).toBeNull()
    })

    it('should handle cleanup when link is already removed', () => {
      const { unmount } = renderHook(() => usePostFont())

      // Manually remove before unmount
      const link = document.getElementById('post-block-fonts')
      if (link) {
        document.head.removeChild(link)
      }

      // Should not throw error
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Edge cases', () => {
    it('should handle document.head being undefined gracefully', () => {
      // Mock document.head to simulate SSR environment
      const originalHead = document.head
      Object.defineProperty(document, 'head', {
        value: undefined,
        writable: true,
      })

      // Should not crash
      expect(() => renderHook(() => usePostFont())).not.toThrow()

      // Restore
      Object.defineProperty(document, 'head', {
        value: originalHead,
        writable: true,
      })
    })

    it('should handle createElement failure', () => {
      const originalCreateElement = document.createElement
      document.createElement = jest.fn().mockImplementation(() => {
        throw new Error('createElement failed')
      })

      // Should not crash
      expect(() => renderHook(() => usePostFont())).not.toThrow()

      // Restore
      document.createElement = originalCreateElement
    })
  })
})
