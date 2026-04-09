/// <reference types="jest" />

import { getCurrentDateTime } from '../../../utils/getCurrentDateTime'

describe('getCurrentDateTime', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return an object with iso and formatted properties', () => {
    const result = getCurrentDateTime()
    expect(result).toHaveProperty('iso')
    expect(result).toHaveProperty('formatted')
  })

  it('should return ISO string in correct format', () => {
    jest.setSystemTime(new Date('2024-12-01T10:30:45.123Z'))
    const result = getCurrentDateTime()

    expect(result.iso).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/)
  })

  it('should return formatted string in DD-MM-YYYY_HH-mm format', () => {
    jest.setSystemTime(new Date('2024-12-01T10:30:45.123Z'))
    const result = getCurrentDateTime()

    expect(result.formatted).toMatch(/\d{2}-\d{2}-\d{4}_\d{2}-\d{2}/)
  })

  it('should use local time for formatted string', () => {
    // Set to a specific time
    const testDate = new Date('2024-12-15T14:25:30.000Z')
    jest.setSystemTime(testDate)

    const result = getCurrentDateTime()

    // Should contain the local time components
    expect(result.formatted).toContain('2024')
    expect(result.formatted).toContain('12')
  })

  it('should not contain colons in formatted string (filesystem-safe)', () => {
    const result = getCurrentDateTime()
    expect(result.formatted).not.toContain(':')
  })

  it('should use underscores as separators', () => {
    const result = getCurrentDateTime()
    expect(result.formatted).toContain('_')
  })

  it('should return consistent values when called multiple times at same moment', () => {
    jest.setSystemTime(new Date('2024-06-15T08:30:00.000Z'))

    const result1 = getCurrentDateTime()
    const result2 = getCurrentDateTime()

    expect(result1.iso).toBe(result2.iso)
    expect(result1.formatted).toBe(result2.formatted)
  })
})
