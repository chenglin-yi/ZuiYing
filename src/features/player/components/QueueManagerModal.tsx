import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native'
import { QueueItem } from '../../../shared/types/movie'
import { colors, spacing } from '../../../shared/theme'

interface QueueManagerModalProps {
  visible: boolean
  queue: QueueItem[]
  currentIndex: number
  onClose: () => void
  onSelect: (index: number) => void
  onRemove: (index: number) => void
  onClear: () => void
}

export function QueueManagerModal({
  visible,
  queue,
  currentIndex,
  onClose,
  onSelect,
  onRemove,
  onClear,
}: QueueManagerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>播放队列 ({queue.length})</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {queue.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>当前队列为空</Text>
            </View>
          ) : (
            <ScrollView style={styles.list}>
              {queue.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.item, index === currentIndex && styles.itemActive]}
                  onPress={() => onSelect(index)}
                >
                  <View style={styles.itemInfo}>
                    <Text
                      style={[styles.itemTitle, index === currentIndex && styles.itemTitleActive]}
                      numberOfLines={1}
                    >
                      {index === currentIndex ? '▶ ' : ''}
                      {item.episodeName}
                    </Text>
                    <Text style={styles.itemSubtitle} numberOfLines={1}>
                      {item.movie.title}
                    </Text>
                  </View>
                  {index !== currentIndex && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => onRemove(index)}
                    >
                      <Text style={styles.removeText}>删除</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {queue.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={onClear}>
              <Text style={styles.clearText}>清空队列</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    maxHeight: '70%',
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
  list: {
    maxHeight: 360,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.xs,
    backgroundColor: colors.background,
  },
  itemActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  itemTitleActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  removeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  removeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  empty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  clearButton: {
    marginTop: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  clearText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
})
