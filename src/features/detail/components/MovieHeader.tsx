import React from 'react'
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native'
import { Movie } from '../../../shared/types/movie'
import { formatRating, formatDate } from '../../../shared/utils/format'
import { colors, spacing } from '../../../shared/theme'
import { useAdaptiveValue, useResponsivePadding } from '../../../shared/utils/responsive'

interface MovieHeaderProps {
  movie: Movie
}

export function MovieHeader({ movie }: MovieHeaderProps) {
  const { width } = useWindowDimensions()
  const { horizontalPadding } = useResponsivePadding()
  const backdropHeight = useAdaptiveValue(220, 300)
  const posterWidth = useAdaptiveValue(120, 160)
  const posterHeight = useAdaptiveValue(180, 240)
  const posterOffset = useAdaptiveValue(-60, -80)

  const backdropUri = movie.backdrop_path || movie.poster_path
  const posterUri = movie.poster_path || movie.backdrop_path

  return (
    <View style={styles.container}>
      {backdropUri ? (
        <Image
          source={{ uri: backdropUri }}
          style={[styles.backdrop, { width, height: backdropHeight }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.backdrop, { width, height: backdropHeight }, styles.placeholderBg]} />
      )}
      <View style={styles.overlay} />
      <View style={[styles.content, { bottom: posterOffset, left: horizontalPadding }]}>
        {posterUri ? (
          <Image
            source={{ uri: posterUri }}
            style={[styles.poster, { width: posterWidth, height: posterHeight }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.poster, { width: posterWidth, height: posterHeight }, styles.placeholderBg]} />
        )}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {movie.title}
          </Text>
          <View style={styles.meta}>
            <Text style={styles.metaText}>
              ⭐ {formatRating(movie.vote_average)}
            </Text>
            <Text style={styles.metaText}> • </Text>
            <Text style={styles.metaText}>{formatDate(movie.release_date)}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  backdrop: {
    backgroundColor: colors.border,
  },
  placeholderBg: {
    backgroundColor: colors.surfaceDark,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    position: 'absolute',
    flexDirection: 'row',
  },
  poster: {
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
})
