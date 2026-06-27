import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { HistoryRecord } from '../../../shared/types/movie'
import { colors, spacing } from '../../../shared/theme'
import { formatTime } from '../../../shared/utils/format'
import { useAdaptiveValue } from '../../../shared/utils/responsive'

interface HistoryItemProps {
  record: HistoryRecord
  onPress: (record: HistoryRecord) => void
  onRemove: (id: string) => void
}

export function HistoryItem({ record, onPress, onRemove }: HistoryItemProps) {
  const progress = record.duration > 0 ? (record.progress / record.duration) * 100 : 0
  const imageUri = record.movie.poster_path || record.movie.backdrop_path
  const posterWidth = useAdaptiveValue(70, 100)
  const posterHeight = useAdaptiveValue(100, 140)

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(record)}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[styles.poster, { width: posterWidth, height: posterHeight }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.poster, { width: posterWidth, height: posterHeight }, styles.placeholder]} />
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {record.movie.title}
        </Text>
        <Text style={styles.meta}>
          {record.movie.media_type === 'tv' ? `第${record.episode}集` : ''}
        </Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {formatTime(record.progress)} / {formatTime(record.duration)}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(record.id)}>
        <Text style={styles.removeText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  poster: {
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  meta: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progress: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  removeButton: {
    padding: spacing.sm,
  },
  removeText: {
    fontSize: 20,
    color: colors.textTertiary,
  },
})
