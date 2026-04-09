/// <reference types="jest" />

import { downloadFileExcel } from '../../../utils/downloadFileExcel'

describe('downloadFileExcel', () => {
  let mockAnchor: HTMLAnchorElement
  let mockCreateObjectURL: jest.Mock
  let mockRevokeObjectURL: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock anchor element
    mockAnchor = {
      href: '',
      download: '',
      click: jest.fn(),
    } as unknown as HTMLAnchorElement

    const createElementSpy = jest.spyOn(document, 'createElement')
    createElementSpy.mockReturnValue(mockAnchor)

    // Mock URL APIs
    mockCreateObjectURL = jest.fn(() => 'blob:mock-url')
    mockRevokeObjectURL = jest.fn()

    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      },
      writable: true,
    })

    // Mock appendChild and removeChild
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor)
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Basic functionality', () => {
    it('should create anchor element with blob URL', () => {
      const mockBlob = new Blob(['test data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      downloadFileExcel(mockBlob, 'test.xlsx')

      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob)
      expect(mockAnchor.download).toBe('test.xlsx')
    })

    it('should call click on anchor element', () => {
      const mockBlob = new Blob(['test data'])

      downloadFileExcel(mockBlob, 'report.xlsx')

      expect(mockAnchor.click).toHaveBeenCalled()
    })

    it('should revoke object URL after download', () => {
      const mockBlob = new Blob(['test data'])

      downloadFileExcel(mockBlob, 'test.xlsx')

      expect(mockRevokeObjectURL).toHaveBeenCalled()
    })

    it('should append and remove anchor from body', () => {
      const mockBlob = new Blob(['test data'])
      const appendSpy = jest.spyOn(document.body, 'appendChild')
      const removeSpy = jest.spyOn(document.body, 'removeChild')

      downloadFileExcel(mockBlob, 'test.xlsx')

      expect(appendSpy).toHaveBeenCalledWith(mockAnchor)
      expect(removeSpy).toHaveBeenCalledWith(mockAnchor)
    })
  })

  describe('Different file types', () => {
    it('should handle .xlsx files', () => {
      const mockBlob = new Blob(['data'])

      downloadFileExcel(mockBlob, 'report.xlsx')

      expect(mockAnchor.download).toBe('report.xlsx')
    })

    it('should handle .csv files', () => {
      const mockBlob = new Blob(['data'])

      downloadFileExcel(mockBlob, 'export.csv')

      expect(mockAnchor.download).toBe('export.csv')
    })

    it('should handle filenames with spaces', () => {
      const mockBlob = new Blob(['data'])

      downloadFileExcel(mockBlob, 'my report 2024.xlsx')

      expect(mockAnchor.download).toBe('my report 2024.xlsx')
    })

    it('should handle filenames with special characters', () => {
      const mockBlob = new Blob(['data'])

      downloadFileExcel(mockBlob, 'report_2024-12-01.xlsx')

      expect(mockAnchor.download).toBe('report_2024-12-01.xlsx')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty blob', () => {
      const emptyBlob = new Blob([])

      downloadFileExcel(emptyBlob, 'empty.xlsx')

      expect(mockCreateObjectURL).toHaveBeenCalledWith(emptyBlob)
      expect(mockAnchor.click).toHaveBeenCalled()
    })

    it('should handle very long filenames', () => {
      const mockBlob = new Blob(['data'])
      const longName = 'a'.repeat(200) + '.xlsx'

      downloadFileExcel(mockBlob, longName)

      expect(mockAnchor.download).toBe(longName)
    })

    it('should handle unicode characters in filename', () => {
      const mockBlob = new Blob(['data'])

      downloadFileExcel(mockBlob, 'báo_cáo_2024.xlsx')

      expect(mockAnchor.download).toBe('báo_cáo_2024.xlsx')
    })
  })
})
