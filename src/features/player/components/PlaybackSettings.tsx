import React from 'react'
import { View, Text, TouchableOpacity, Switch, StyleSheet, Modal } from 'react-native'
import { Settings } from '../../../shared/types/storage'
import { colors, spacing } from '../../../shared/theme'

interface PlaybackSettingsProps {
  visible: boolean
  settings: Pick<Settings, 'autoPlayNext' | 'autoPlayCountdownSeconds' | 'skipIntroOutro' | 'skipIntroEnd' | 'skipOutroSeconds'>
  onUpdate: (settings: Partial<Settings>) => void
  onClose: () => void
}

export function PlaybackSettings({ visible, settings, onUpdate, onClose }: PlaybackSettingsProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>播放设置</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>自动连播下一集</Text>
            <Switch
              value={settings.autoPlayNext}
              onValueChange={(v) => onUpdate({ autoPlayNext: v })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>跳过片头片尾</Text>
            <Switch
              value={settings.skipIntroOutro}
              onValueChange={(v) => onUpdate({ skipIntroOutro: v })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={styles.tip}>
            <Text style={styles.tipText}>
              片头：前 {settings.skipIntroEnd} 秒自动跳过；片尾：剩余 {settings.skipOutroSeconds} 秒自动切集。
              可在全局设置中调整具体秒数。
            </Text>
          </View>
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
    minWidth: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  closeIcon: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  tip: {
    marginTop: spacing.md,
  },
  tipText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
})
