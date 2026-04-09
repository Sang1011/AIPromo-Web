/// <reference types="jest" />

import { buildContextPrompt } from '../../../utils/buildContextPrompt'
import type { GetEventDetailResponse } from '../../../types/event/event'

describe('buildContextPrompt', () => {
  const createMockEvent = (overrides: Partial<GetEventDetailResponse> = {}): GetEventDetailResponse => ({
    id: 'event-123',
    organizerId: 'org-1',
    title: 'Test Event',
    status: 'Published',
    bannerUrl: 'https://example.com/banner.jpg',
    specImage: 'https://example.com/spec.jpg',
    location: 'Ho Chi Minh City',
    mapUrl: 'https://maps.example.com/event',
    description: 'This is a test event description',
    urlPath: 'test-event',
    ticketSaleStartAt: '2024-12-01T00:00:00Z',
    ticketSaleEndAt: '2024-12-01T10:00:00Z',
    eventStartAt: '2024-12-01T12:00:00Z',
    eventEndAt: '2024-12-01T18:00:00Z',
    policy: 'Standard policy applies',
    isEmailReminderEnabled: false,
    createdAt: '2024-11-01T10:00:00Z',
    modifiedAt: '2024-11-15T14:30:00Z',
    hashtags: [{ id: 1, name: '#event' }, { id: 2, name: '#test' }],
    categories: [{ id: 1, name: 'Music' }, { id: 2, name: 'Entertainment' }],
    images: [
      { id: 'img-1', imageUrl: 'https://example.com/image1.jpg' },
      { id: 'img-2', imageUrl: 'https://example.com/image2.jpg' },
    ],
    actorImages: [
      { id: '1', name: 'Actor 1', major: 'CEO', image: 'https://example.com/actor1.jpg' },
      { id: '2', name: 'Actor 2', major: 'Ca sĩ', image: 'https://example.com/actor2.jpg' },
    ],
    sessions: [
      {
        id: 'session-1',
        title: 'Session 1',
        description: 'First session',
        startTime: '2024-12-01T10:00:00Z',
        endTime: '2024-12-01T12:00:00Z',
      },
      {
        id: 'session-2',
        title: 'Session 2',
        description: 'Second session',
        startTime: '2024-12-01T14:00:00Z',
        endTime: '2024-12-01T16:00:00Z',
      },
    ],
    ticketTypes: [],
    ...overrides,
  })

  describe('Basic functionality', () => {
    it('should build prompt with event title', () => {
      const event = createMockEvent()
      const result = buildContextPrompt(event)

      expect(result).toContain('Test Event')
    })

    it('should build prompt with event description', () => {
      const event = createMockEvent()
      const result = buildContextPrompt(event)

      expect(result).toContain('This is a test event description')
    })

    it('should build prompt with location', () => {
      const event = createMockEvent()
      const result = buildContextPrompt(event)

      expect(result).toContain('Ho Chi Minh City')
    })

    it('should include hashtags', () => {
      const event = createMockEvent()
      const result = buildContextPrompt(event)

      expect(result).toContain('#event')
      expect(result).toContain('#test')
    })

    it('should include categories', () => {
      const event = createMockEvent()
      const result = buildContextPrompt(event)

      expect(result).toContain('Music')
      expect(result).toContain('Entertainment')
    })

    it('should include session information', () => {
      const event = createMockEvent()
      const result = buildContextPrompt(event)

      expect(result).toContain('Session 1')
      expect(result).toContain('Session 2')
    })

    it('should include CTA URL with event urlPath', () => {
      const event = createMockEvent()
      const result = buildContextPrompt(event)

      expect(result).toContain('test-event')
    })
  })

  describe('Tone parameter', () => {
    it('should include tone when provided', () => {
      const event = createMockEvent()
      const result = buildContextPrompt(event, 'professional')

      expect(result).toContain('formal, clear, and informative')
    })

    it('should work without tone', () => {
      const event = createMockEvent()
      const result = buildContextPrompt(event)

      expect(result).toBeDefined()
    })

    it('should handle different tones', () => {
      const event = createMockEvent()

      const genz = buildContextPrompt(event, 'genz')
      const professional = buildContextPrompt(event, 'professional')

      expect(genz).toContain('casual, trendy Gen Z')
      expect(professional).toContain('formal, clear, and informative')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty hashtags array', () => {
      const event = createMockEvent({ hashtags: [] })
      const result = buildContextPrompt(event)

      expect(result).toBeDefined()
    })

    it('should handle empty categories array', () => {
      const event = createMockEvent({ categories: [] })
      const result = buildContextPrompt(event)

      expect(result).toBeDefined()
    })

    it('should handle empty actorImages array', () => {
      const event = createMockEvent({ actorImages: [] })
      const result = buildContextPrompt(event)

      expect(result).toBeDefined()
    })

    it('should handle empty sessions array', () => {
      const event = createMockEvent({ sessions: [] })
      const result = buildContextPrompt(event)

      expect(result).toBeDefined()
    })

    it('should handle missing description', () => {
      const event = createMockEvent({ description: '' })
      const result = buildContextPrompt(event)

      expect(result).toBeDefined()
    })

    it('should handle missing location', () => {
      const event = createMockEvent({ location: '' })
      const result = buildContextPrompt(event)

      expect(result).toBeDefined()
    })
  })
})
