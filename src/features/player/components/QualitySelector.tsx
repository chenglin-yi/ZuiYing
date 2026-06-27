import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { colors, spacing } from '../../../shared/theme'

interface QualitySelectorProps {
  visible: boolean
  currentQuality: string
  onSelect: (quality: string) => void
  onClose: () => void
}

const qualities = ['360p', '720p', '1080p', '4K']

export function QualitySelector({ visible, currentQuality, onSelect, onClose }: QualitySelectorProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <Text style={styles.title}>选择清晰度</Text>
          {qualities.map((quality) => (
            <TouchableOpacity
              key={quality}
              style={[
                styles.item,
                currentQuality === quality && styles.selectedItem
              ]}
              onPress={() => {
                onSelect(quality)
                onClose()
              }}
            >
              <Text
                style={[
                  styles.itemText,
                  currentQuality === quality && styles.selectedItemText
                ]}
              >
                {quality}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    width: '70%'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md
  },
  item: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  selectedItem: {
    backgroundColor: colors.primary + '20'
  },
  itemText: {
    fontSize: 16,
    color: colors.textPrimary
  },
  selectedItemText: {
    color: colors.primary,
    fontWeight: '600'
  }
})
