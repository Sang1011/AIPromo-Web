/// <reference types="jest" />

import { injectImageBlock } from '../../../utils/injectImageBlock'
import type { ContentBlock } from '../../../types/post/post'

describe('injectImageBlock', () => {
  describe('Basic functionality', () => {
    it('should return original array when imageUrl is null', () => {
      const blocks: ContentBlock[] = [
        { type: 'paragraph', text: 'Test' },
      ]
      const result = injectImageBlock(blocks, null)

      expect(result).toBe(blocks)
    })

    it('should insert image block when no existing image', () => {
      const blocks: ContentBlock[] = [
        { type: 'paragraph', text: 'Test content' },
      ]
      const result = injectImageBlock(blocks, 'https://example.com/image.jpg')

      expect(result).toHaveLength(2)
      expect(result[1]).toEqual({
        type: 'image',
        src: 'https://example.com/image.jpg',
        alt: 'Post image',
      })
    })

    it('should replace existing image block', () => {
      const blocks: ContentBlock[] = [
        { type: 'paragraph', text: 'Test' },
        { type: 'image', src: 'https://old.com/old.jpg', alt: 'Old image' },
        { type: 'paragraph', text: 'More content' },
      ]
      const result = injectImageBlock(blocks, 'https://new.com/new.jpg')

      expect(result).toHaveLength(3)
      expect(result.find(b => b.type === 'image')).toEqual({
        type: 'image',
        src: 'https://new.com/new.jpg',
        alt: 'Post image',
      })
    })

    it('should insert after first heading block', () => {
      const blocks: ContentBlock[] = [
        { type: 'heading', level: 1, text: 'Title' },
        { type: 'paragraph', text: 'Content' },
      ]
      const result = injectImageBlock(blocks, 'https://example.com/image.jpg')

      expect(result).toHaveLength(3)
      expect(result[1]).toEqual({
        type: 'image',
        src: 'https://example.com/image.jpg',
        alt: 'Post image',
      })
    })

    it('should insert at index 0 when no heading exists', () => {
      const blocks: ContentBlock[] = [
        { type: 'paragraph', text: 'Content 1' },
      ]
      const result = injectImageBlock(blocks, 'https://example.com/image.jpg')

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        type: 'image',
        src: 'https://example.com/image.jpg',
        alt: 'Post image',
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle empty blocks array', () => {
      const blocks: ContentBlock[] = []
      const result = injectImageBlock(blocks, 'https://example.com/image.jpg')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        type: 'image',
        src: 'https://example.com/image.jpg',
        alt: 'Post image',
      })
    })

    it('should return new array (immutability)', () => {
      const blocks: ContentBlock[] = [
        { type: 'paragraph', text: 'Test' },
      ]
      const result = injectImageBlock(blocks, 'https://example.com/image.jpg')

      expect(result).not.toBe(blocks)
    })
  })
})
