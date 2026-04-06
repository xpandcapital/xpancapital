import { useState, useCallback, useEffect, useRef } from 'react'

export interface ReadingProgress {
  post_id: string
  user_id: string
  tiempo_segundos: number
  completado: boolean
  recompensa_otorgada: boolean
  creado_en: string
  actualizado_en: string
}

export function useReadingTracker(postId: string, userId?: string, rewardSeconds: number = 60, rewardCoins: number = 5) {
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [isTracking, setIsTracking] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isRewardClaimed, setIsRewardClaimed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const savedProgressRef = useRef<number>(0)

  const startTracking = useCallback(() => {
    if (isTracking || isCompleted) return
    
    setIsTracking(true)
    startTimeRef.current = Date.now()
    
    timerRef.current = setInterval(() => {
      setSecondsElapsed(prev => {
        const newSeconds = prev + 1
        
        if (userId && !isRewardClaimed && newSeconds >= rewardSeconds) {
          setIsCompleted(true)
          setIsTracking(false)
        }
        
        return newSeconds
      })
    }, 1000)
  }, [isTracking, isCompleted, userId, rewardSeconds, isRewardClaimed])

  const pauseTracking = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsTracking(false)
  }, [])

  const resumeTracking = useCallback(() => {
    if (!isTracking && !isCompleted) {
      startTracking()
    }
  }, [isTracking, isCompleted, startTracking])

  const stopTracking = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsTracking(false)
  }, [])

  const claimReward = useCallback(async () => {
    if (!userId || isRewardClaimed) {
      return { success: false, error: 'No se puede reclamar la recompensa' }
    }

    try {
      const response = await fetch('/api/blog/lectura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          post_id: postId,
          tiempo_segundos: secondsElapsed,
          completado: secondsElapsed >= rewardSeconds,
          coins_cantidad: rewardCoins
        })
      })

      const data = await response.json()

      if (data.success) {
        setIsRewardClaimed(true)
        
        if (secondsElapsed >= rewardSeconds) {
          setIsCompleted(true)
        }
        
        return { success: true, coins: rewardCoins }
      }

      return { success: false, error: data.error || 'Error al reclamar recompensa' }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [userId, postId, secondsElapsed, rewardSeconds, rewardCoins, isRewardClaimed])

  const saveProgress = useCallback(async () => {
    if (!userId || savedProgressRef.current === secondsElapsed) return

    try {
      await fetch('/api/blog/lectura', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          post_id: postId,
          tiempo_segundos: secondsElapsed
        })
      })
      
      savedProgressRef.current = secondsElapsed
    } catch {
      // Silenciar error de guardado de progreso
    }
  }, [userId, postId, secondsElapsed])

  const loadProgress = useCallback(async () => {
    if (!userId) return

    try {
      const response = await fetch(`/api/blog/lectura?user_id=${userId}&post_id=${postId}`)
      const data = await response.json()

      if (data.success && data.data) {
        setSecondsElapsed(data.data.tiempo_segundos)
        setIsCompleted(data.data.completado)
        setIsRewardClaimed(data.data.recompensa_otorgada)
        
        if (data.data.recompensa_otorgada) {
          setIsRewardClaimed(true)
        }
      }
    } catch {
      // Silenciar error de carga de progreso
    }
  }, [userId, postId])

  useEffect(() => {
    loadProgress()
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseTracking()
        saveProgress()
      } else {
        resumeTracking()
      }
    }

    const handleBeforeUnload = () => {
      if (isTracking) {
        saveProgress()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      stopTracking()
    }
  }, [loadProgress, pauseTracking, resumeTracking, saveProgress, stopTracking, isTracking])

  // Auto-guardar cada 10 segundos
  useEffect(() => {
    if (!isTracking || !userId) return

    const interval = setInterval(() => {
      saveProgress()
    }, 10000)

    return () => clearInterval(interval)
  }, [isTracking, userId, saveProgress])

  const timeLeft = Math.max(0, rewardSeconds - secondsElapsed)
  const progressPercentage = Math.min(100, (secondsElapsed / rewardSeconds) * 100)

  return {
    secondsElapsed,
    timeLeft,
    progressPercentage,
    isTracking,
    isCompleted,
    isRewardClaimed,
    error,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
    claimReward,
    loadProgress,
    saveProgress
  }
}

export default useReadingTracker