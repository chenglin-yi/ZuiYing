import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { Movie } from '../../../shared/types/movie'
import { colors, spacing } from '../../../shared/theme'
import { formatRating, formatDate } from '../../../shared/utils/format'
import { useAdaptiveValue } from '../../../shared/utils/responsive'

interface FavoriteItemProps {
  movie: Movie
  onPress: (movie: Movie) => void
  onRemove: (id: string) => void
}

export function FavoriteItem({ movie, onPress, onRemove }: FavoriteItemProps) {
  const imageUri = movie.poster_path || movie.backdrop_path
  const posterWidth = useAdaptiveValue(70, 100)
  const posterHeight = useAdaptiveValue(100, 140)

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(movie)}>
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
          {movie.title}
        </Text>
        <Text style={styles.meta}>
          {movie.media_type === 'movie' ? '电影' : '电视剧'} • {formatDate(movie.release_date)}
        </Text>
        <Text style={styles.rating}>⭐ {formatRating(movie.vote_average)}</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(movie.id)}>
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
  rating: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  removeButton: {
    padding: spacing.sm,
  },
  removeText: {
    fontSize: 20,
    color: colors.textTertiary,
  },
})
