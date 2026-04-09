// Add TextEncoder/TextDecoder polyfill for jsdom
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Suppress React 19 act() warnings (these are development warnings, not errors)

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => { },
    removeListener: () => { },
    addEventListener: () => { },
    removeEventListener: () => { },
    dispatchEvent: () => { },
  }),
})

// Mock IntersectionObserver  
if (typeof (global as any).IntersectionObserver === 'undefined') {
  (global as any).IntersectionObserver = class {
    constructor() { }
    disconnect() { }
    observe() { }
    takeRecords() { return [] }
    unobserve() { }
  }
}

// Mock ResizeObserver
if (typeof (global as any).ResizeObserver === 'undefined') {
  (global as any).ResizeObserver = class {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
  }
}
