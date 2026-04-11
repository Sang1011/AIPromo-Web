// Add TextEncoder/TextDecoder polyfill for jsdom
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Mock import.meta.env for Vite
if (typeof (global as any).import === 'undefined') {
  (global as any).import = { meta: { env: { VITE_API_BASE_URL: 'http://localhost:5000', VITE_FIREBASE_API_KEY: 'test' } } }
}

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

// Mock import.meta.env at the module level for any file that imports api.ts
jest.mock('../services/api', () => {
  const axios = require('axios')
  const api = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 30000,
  })
  const memberApi = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 30000,
  })
  return { default: api, memberApi }
})
