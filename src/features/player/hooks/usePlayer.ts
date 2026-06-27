import { useState, useCallback, useRef, useEffect } from 'react'

interface UsePlayerReturn {
  url: string
  playing: boolean
  progress: number
  duration: number
  buffering: boolean
  error: string | null
  play: () => void
  pause: () => void
  toggle: () => void
  seek: (time: number) => void
  changeUrl: (newUrl: string) => void
  setProgress: React.Dispatch<React.SetStateAction<number>>
  setDuration: React.Dispatch<React.SetStateAction<number>>
  setBuffering: React.Dispatch<React.SetStateAction<boolean>>
  setError: React.Dispatch<React.SetStateAction<string | null>>
}

export function usePlayer(initialUrl?: string): UsePlayerReturn {
  const [url, setUrl] = useState(initialUrl || '')
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffering, setBuffering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const play = useCallback(() => setPlaying(true), [])
  const pause = useCallback(() => setPlaying(false), [])
  const toggle = useCallback(() => setPlaying(p => !p), [])

  const seek = useCallback((time: number) => {
    setProgress(time)
  }, [])

  const changeUrl = useCallback((newUrl: string) => {
    setUrl(newUrl)
    setProgress(0)
    setError(null)
  }, [])

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl)
    }
  }, [initialUrl])

  return {
    url,
    playing,
    progress,
    duration,
    buffering,
    error,
    play,
    pause,
    toggle,
    seek,
    changeUrl,
    setProgress,
    setDuration,
    setBuffering,
    setError
  }
}
