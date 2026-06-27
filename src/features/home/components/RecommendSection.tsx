import React from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, useWindowDimensions } from 'react-native'
import { Movie } from '../../../shared/types/movie'
import { colors, spacing } from '../../../shared/theme'
import { useAdaptiveValue } from '../../../shared/utils/responsive'

interface RecommendSectionProps {
  title: string
  movies: Movie[]
  onMoviePress: (movie: Movie) => void
}

export function RecommendSection({ title, movies, onMoviePress }: RecommendSectionProps) {
  const { width: screenWidth } = useWindowDimensions()
  const cardWidth = useAdaptiveValue((screenWidth - 48) / 2, (screenWidth - 64) / 3)
  const posterHeight = useAdaptiveValue(160, 200)
  const titleFontSize = useAdaptiveValue(18, 22)

  if (!movies || movies.length === 0) {
    return null
  }

  const renderItem = ({ item }: { item: Movie }) => {
    const imageUri = item.poster_path || item.backdrop_path

    return (
      <TouchableOpacity
        style={[styles.card, { width: cardWidth }]}
        onPress={() => onMoviePress(item)}
        activeOpacity={0.8}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.poster, { height: posterHeight }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.poster, { height: posterHeight }, styles.placeholder]}>
            <Text style={styles.placeholderText}>暂无</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.meta}>
            {item.vote_average > 0 && (
              <Text style={styles.rating}>⭐ {item.vote_average.toFixed(1)}</Text>
            )}
            {item.remarks ? (
              <Text style={styles.remarks} numberOfLines={1}>{item.remarks}</Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { fontSize: titleFontSize }]}>{title}</Text>
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
  },
  card: {
    marginRight: spacing.sm,
  },
  poster: {
    width: '100%',
    borderRadius: 8,
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
    paddingVertical: spacing.xs,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 11,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  remarks: {
    fontSize: 11,
    color: colors.primary,
  },
  separator: {
    width: spacing.sm,
  },
})
