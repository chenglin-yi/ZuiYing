import React, { useEffect, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, spacing } from '../../../shared/theme'

interface CountdownOverlayProps {
  visible: boolean
  seconds: number
  nextTitle?: string
  onPlayNow: () => void
  onCancel: () => void
}

export function CountdownOverlay({ visible, seconds, nextTitle, onPlayNow, onCancel }: CountdownOverlayProps) {
  const [remaining, setRemaining] = useState(seconds)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!visible) {
      setRemaining(seconds)
      return
    }

    setRemaining(seconds)
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [visible, seconds])

  // 倒计时归零后由父组件通过 onPlayNow 处理，避免组件内部直接调用导致竞态
  useEffect(() => {
    if (visible && remaining === 0) {
      onPlayNow()
    }
  }, [visible, remaining, onPlayNow])

  if (!visible) return null

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{remaining} 秒后播放下一集</Text>
        {nextTitle && <Text style={styles.subtitle}>{nextTitle}</Text>}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.playButton]} onPress={onPlayNow}>
            <Text style={styles.playText}>立即播放</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  card: {
    backgroundColor: 'rgba(30,30,30,0.95)',
    borderRadius: 16,
    padding: spacing.lg,
    minWidth: 260,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginHorizontal: spacing.sm,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
  },
  playButton: {
    backgroundColor: colors.primary,
  },
  cancelText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  playText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
})
