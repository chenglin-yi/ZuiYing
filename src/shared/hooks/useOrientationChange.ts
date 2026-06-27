import { useState, useEffect } from 'react'
import { Dimensions, ScaledSize } from 'react-native'

export function useOrientationChange() {
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const checkOrientation = ({ window }: { window: ScaledSize }) => {
      setIsLandscape(window.width > window.height)
    }

    // Initial check
    const { width, height } = Dimensions.get('window')
    setIsLandscape(width > height)

    // Listen for changes
    const subscription = Dimensions.addEventListener('change', checkOrientation)

    return () => {
      subscription.remove()
    }
  }, [])

  return isLandscape
}