import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePagination } from '../../app/superadmin/productos/_hooks/usePagination'

describe('usePagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePagination(100, 10))

    expect(result.current.currentPage).toBe(1)
    expect(result.current.totalPages).toBe(10)
    expect(result.current.itemsPerPage).toBe(10)
    expect(result.current.isFirstPage).toBe(true)
    expect(result.current.isLastPage).toBe(false)
  })

  it('should go to next page', () => {
    const { result } = renderHook(() => usePagination(100, 10))

    act(() => {
      result.current.nextPage()
    })

    expect(result.current.currentPage).toBe(2)
    expect(result.current.isFirstPage).toBe(false)
  })

  it('should go to previous page', () => {
    const { result } = renderHook(() => usePagination(100, 10))

    act(() => {
      result.current.nextPage()
      result.current.nextPage()
    })

    expect(result.current.currentPage).toBe(3)

    act(() => {
      result.current.prevPage()
    })

    expect(result.current.currentPage).toBe(2)
  })

  it('should not go below page 1', () => {
    const { result } = renderHook(() => usePagination(100, 10))

    act(() => {
      result.current.prevPage()
    })

    expect(result.current.currentPage).toBe(1)
  })

  it('should not exceed total pages', () => {
    const { result } = renderHook(() => usePagination(25, 10))

    act(() => {
      result.current.goToPage(5)
    })

    expect(result.current.currentPage).toBe(3)
    expect(result.current.isLastPage).toBe(true)

    act(() => {
      result.current.nextPage()
    })

    expect(result.current.currentPage).toBe(3)
  })

  it('should go to specific page', () => {
    const { result } = renderHook(() => usePagination(100, 10))

    act(() => {
      result.current.goToPage(5)
    })

    expect(result.current.currentPage).toBe(5)
    expect(result.current.isFirstPage).toBe(false)
    expect(result.current.isLastPage).toBe(false)
  })

  it('should handle zero items', () => {
    const { result } = renderHook(() => usePagination(0, 10))

    expect(result.current.currentPage).toBe(1)
    expect(result.current.totalPages).toBe(0)
  })

  it('should paginate items correctly', () => {
    const { result } = renderHook(() => usePagination(100, 10))
    const items = Array.from({ length: 100 }, (_, i) => i + 1)

    act(() => {
      result.current.goToPage(3)
    })

    const pageItems = result.current.paginatedItems(items)
    expect(pageItems).toEqual([21, 22, 23, 24, 25, 26, 27, 28, 29, 30])
  })
})