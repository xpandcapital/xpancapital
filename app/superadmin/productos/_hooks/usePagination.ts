"use client"

import { useState, useMemo, useCallback } from 'react'

interface UsePaginationReturn {
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  itemsPerPage: number
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>
  totalPages: number
  paginatedItems: <T>(items: T[]) => T[]
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  isFirstPage: boolean
  isLastPage: boolean
}

export function usePagination(totalItems: number, defaultItemsPerPage = 10): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage)

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage)
  }, [totalItems, itemsPerPage])

  const paginatedItems = useCallback(<T,>(items: T[]): T[] => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return items.slice(start, end)
  }, [currentPage, itemsPerPage])

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])

  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }, [totalPages])

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }, [])

  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages || totalPages === 0

  return {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    isFirstPage,
    isLastPage
  }
}