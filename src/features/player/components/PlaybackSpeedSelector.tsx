import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { colors, spacing } from '../../../shared/theme'

const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]

interface PlaybackSpeedSelectorProps {
  visible: boolean
  currentSpeed: number
  onSelect: (speed: number) => void
  onClose: () => void
}

export function PlaybackSpeedSelector({ visible, currentSpeed, onSelect, onClose }: PlaybackSpeedSelectorProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>播放速度</Text>
          {SPEEDS.map((speed) => (
            <TouchableOpacity
              key={speed}
              style={[styles.item, currentSpeed === speed && styles.itemActive]}
              onPress={() => {
                onSelect(speed)
                onClose()
              }}
            >
              <Text style={[styles.itemText, currentSpeed === speed && styles.itemTextActive]}>
                {speed.toFixed(speed % 1 === 0 ? 0 : 2)}x
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>关闭</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    minWidth: 200,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  item: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xs,
    alignItems: 'center',
  },
  itemActive: {
    backgroundColor: colors.primary,
  },
  itemText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  itemTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  closeButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  closeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
})
