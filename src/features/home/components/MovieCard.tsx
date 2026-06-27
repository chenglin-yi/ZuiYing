import React from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet, useWindowDimensions } from 'react-native'
import { Movie } from '../../../shared/types/movie'
import { colors } from '../../../shared/theme'
import { useResponsivePadding } from '../../../shared/utils/responsive'

interface MovieCardProps {
  movie: Movie
  onPress: (movie: Movie) => void
  numColumns?: number
}

export function MovieCard({ movie, onPress, numColumns = 3 }: MovieCardProps) {
  const { width: screenWidth } = useWindowDimensions()
  const { horizontalPadding } = useResponsivePadding()
  const gap = 8
  const cardWidth = (screenWidth - horizontalPadding * 2 - gap * (numColumns - 1)) / numColumns

  const imageUri = movie.poster_path || movie.backdrop_path

  return (
    <TouchableOpacity style={[styles.container, { width: cardWidth, marginRight: gap }]} onPress={() => onPress(movie)} activeOpacity={0.8}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[styles.poster, { height: cardWidth * 1.4 }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.poster, { height: cardWidth * 1.4 }, styles.placeholder]}>
          <Text style={styles.placeholderText}>暂无封面</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {movie.title}
        </Text>
        {movie.remarks && (
          <Text style={styles.remarks} numberOfLines={1}>{movie.remarks}</Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  poster: {
    width: '100%',
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
    padding: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  remarks: {
    fontSize: 10,
    color: colors.textSecondary,
  },
})
