/// <reference types="jest" />

import { parseBodyToBlocks, serializeBlocksToBody } from '../../../utils/renderPostContent'
import type { ContentBlock } from '../../../types/post/post'

describe('renderPostContent', () => {
  describe('parseBodyToBlocks', () => {
    it('should parse valid JSON string to blocks array', () => {
      const body = JSON.stringify([
        { type: 'paragraph', text: 'Test content' },
        { type: 'heading', level: 1, text: 'Title' },
      ])

      const result = parseBodyToBlocks(body)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ type: 'paragraph', text: 'Test content' })
      expect(result[1]).toEqual({ type: 'heading', level: 1, text: 'Title' })
    })

    it('should return empty array for invalid JSON', () => {
      const result = parseBodyToBlocks('invalid json')
      expect(result).toEqual([])
    })

    it('should return empty array for empty string', () => {
      const result = parseBodyToBlocks('')
      expect(result).toEqual([])
    })

    it('should return empty array for non-array JSON', () => {
      const result = parseBodyToBlocks('{"type": "paragraph"}')
      expect(result).toEqual([])
    })

    it('should return empty array for null JSON', () => {
      const result = parseBodyToBlocks('null')
      expect(result).toEqual([])
    })
  })

  describe('serializeBlocksToBody', () => {
    it('should serialize blocks array to JSON string', () => {
      const blocks: ContentBlock[] = [
        { type: 'paragraph', text: 'Test content' },
        { type: 'heading', level: 1, text: 'Title' },
      ]

      const result = serializeBlocksToBody(blocks)
      const parsed = JSON.parse(result)

      expect(parsed).toHaveLength(2)
      expect(parsed[0]).toEqual({ type: 'paragraph', text: 'Test content' })
    })

    it('should handle empty blocks array', () => {
      const blocks: ContentBlock[] = []
      const result = serializeBlocksToBody(blocks)

      expect(result).toBe('[]')
    })

    it('should preserve block properties', () => {
      const blocks: ContentBlock[] = [
        { type: 'heading', level: 1, text: 'Title' },
        { type: 'image', src: 'https://example.com/image.jpg', alt: 'Image' },
      ]

      const result = serializeBlocksToBody(blocks)
      const parsed = JSON.parse(result)

      expect(parsed[0].level).toBe(1)
      expect(parsed[1].src).toBe('https://example.com/image.jpg')
      expect(parsed[1].alt).toBe('Image')
    })
  })

  describe('Round-trip conversion', () => {
    it('should preserve data through parse -> serialize -> parse cycle', () => {
      const original = JSON.stringify([
        { type: 'paragraph', text: 'Test' },
        { type: 'heading', level: 1, text: 'Title' },
      ])

      const blocks = parseBodyToBlocks(original)
      const serialized = serializeBlocksToBody(blocks)
      const reparsed = parseBodyToBlocks(serialized)

      expect(reparsed).toEqual(blocks)
    })
  })
})
