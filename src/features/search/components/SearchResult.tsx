import React from 'react'
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { Movie } from '../../../shared/types/movie'
import { colors, spacing } from '../../../shared/theme'
import { useAdaptiveValue, useResponsivePadding } from '../../../shared/utils/responsive'

interface SearchResultProps {
  results: Movie[]
  onMoviePress: (movie: Movie) => void
}

export function SearchResult({ results, onMoviePress }: SearchResultProps) {
  const posterWidth = useAdaptiveValue(100, 140)
  const posterHeight = useAdaptiveValue(140, 200)
  const { horizontalPadding } = useResponsivePadding()

  const renderItem = ({ item }: { item: Movie }) => {
    const imageUri = item.poster_path || item.backdrop_path

    return (
      <TouchableOpacity style={styles.item} onPress={() => onMoviePress(item)}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.poster, { width: posterWidth, height: posterHeight }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.poster, { width: posterWidth, height: posterHeight }, styles.placeholder]}>
            <Text style={styles.placeholderText}>暂无</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.meta}>
            {item.type || (item.media_type === 'movie' ? '电影' : '电视剧')}
            {item.area ? ` • ${item.area}` : ''}
          </Text>
          {item.remarks ? (
            <Text style={styles.remarks}>{item.remarks}</Text>
          ) : null}
          {item.overview ? (
            <Text style={styles.overview} numberOfLines={2}>
              {item.overview}
            </Text>
          ) : null}
          <View style={styles.rating}>
            {item.vote_average > 0 && (
              <Text style={styles.ratingText}>⭐ {item.vote_average.toFixed(1)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: horizontalPadding }}
    />
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  poster: {
    backgroundColor: colors.border,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  info: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  remarks: {
    fontSize: 12,
    color: colors.primary,
    marginBottom: 4,
  },
  overview: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
})
