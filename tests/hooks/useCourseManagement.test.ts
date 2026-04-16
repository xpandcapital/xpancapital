import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCourseManagement, useModuleActions, useLessonActions } from '../../app/superadmin/cursos/_hooks/useCourseManagement'
import type { Course, Module, Lesson } from '../../app/superadmin/cursos/_types'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          }))
        })),
        single: vi.fn(() => ({
          data: null,
          error: null
        }))
      })),
      insert: vi.fn(() => ({
        data: null,
        error: null
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      }))
    }))
  }
}))

describe('useCourseManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with loading state', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: [] })
    } as Response)

    const { result } = renderHook(() => useCourseManagement())

    expect(result.current.loading).toBe(true)
  })

  it('should create a new course', () => {
    const { result } = renderHook(() => useCourseManagement())

    act(() => {
      const newCourse = result.current.createNewCourse()
      expect(newCourse.title).toBe('')
      expect(newCourse.status).toBe('Borrador')
      expect(newCourse.modules.length).toBe(1)
    })
  })
})

describe('useModuleActions', () => {
  const mockCourse: Course = {
    id: 'test-course',
    title: 'Test Course',
    category: 'Test',
    price: 100,
    status: 'Publicado',
    modules: [],
    hasCertificate: false,
    allowComments: true,
    bliscoins: 0,
    image: null,
    certificateTemplateId: null
  }

  it('should add a module', () => {
    const mockSetCurrentCourse = vi.fn()
    const { result } = renderHook(() => useModuleActions(mockCourse, mockSetCurrentCourse))

    act(() => {
      result.current.addModule()
    })

    expect(mockSetCurrentCourse).toHaveBeenCalled()
  })

  it('should update a module', () => {
    const mockSetCurrentCourse = vi.fn()
    const courseWithModule: Course = {
      ...mockCourse,
      modules: [{ id: 'mod-1', title: 'Module 1', lessons: [], questions: [], isOpen: true }]
    }

    const { result } = renderHook(() => useModuleActions(courseWithModule, mockSetCurrentCourse))

    act(() => {
      result.current.updateModule('mod-1', { title: 'Updated Module' })
    })

    expect(mockSetCurrentCourse).toHaveBeenCalled()
  })

  it('should delete a module', () => {
    const mockSetCurrentCourse = vi.fn()
    const courseWithModule: Course = {
      ...mockCourse,
      modules: [{ id: 'mod-1', title: 'Module 1', lessons: [], questions: [], isOpen: true }]
    }

    const { result } = renderHook(() => useModuleActions(courseWithModule, mockSetCurrentCourse))

    act(() => {
      result.current.deleteModule('mod-1')
    })

    expect(mockSetCurrentCourse).toHaveBeenCalled()
  })
})

describe('useLessonActions', () => {
  const mockModule: Module = {
    id: 'mod-1',
    title: 'Module 1',
    lessons: [],
    questions: [],
    isOpen: true
  }

  const mockCourse: Course = {
    id: 'test-course',
    title: 'Test Course',
    category: 'Test',
    price: 100,
    status: 'Publicado',
    modules: [mockModule],
    hasCertificate: false,
    allowComments: true,
    bliscoins: 0,
    image: null,
    certificateTemplateId: null
  }

  it('should add a lesson', () => {
    const mockSetCurrentCourse = vi.fn()
    const { result } = renderHook(() => useLessonActions(mockCourse, mockSetCurrentCourse))

    act(() => {
      result.current.addLesson('mod-1')
    })

    expect(mockSetCurrentCourse).toHaveBeenCalled()
  })

  it('should update a lesson', () => {
    const mockSetCurrentCourse = vi.fn()
    const lesson: Lesson = { id: 'les-1', title: 'Lesson 1', type: 'video', content: '', attachments: [], questions: [] }
    const courseWithLesson: Course = {
      ...mockCourse,
      modules: [{ ...mockModule, lessons: [lesson] }]
    }

    const { result } = renderHook(() => useLessonActions(courseWithLesson, mockSetCurrentCourse))

    act(() => {
      result.current.updateLesson('mod-1', 'les-1', { title: 'Updated Lesson' })
    })

    expect(mockSetCurrentCourse).toHaveBeenCalled()
  })

  it('should delete a lesson', () => {
    const mockSetCurrentCourse = vi.fn()
    const lesson: Lesson = { id: 'les-1', title: 'Lesson 1', type: 'video', content: '', attachments: [], questions: [] }
    const courseWithLesson: Course = {
      ...mockCourse,
      modules: [{ ...mockModule, lessons: [lesson] }]
    }

    const { result } = renderHook(() => useLessonActions(courseWithLesson, mockSetCurrentCourse))

    act(() => {
      result.current.deleteLesson('mod-1', 'les-1')
    })

    expect(mockSetCurrentCourse).toHaveBeenCalled()
  })
})