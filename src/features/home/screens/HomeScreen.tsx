import React, { useCallback, useState } from 'react'
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useMovieStore } from '../../../shared/stores'
import { Movie } from '../../../shared/types/movie'
import { MovieCard } from '../components'
import { Loading, Empty, Error } from '../../../shared/components'
import { colors, spacing } from '../../../shared/theme'
import { useHeaderPadding, useGridColumns, useResponsivePadding } from '../../../shared/utils/responsive'

type RootStackParamList = {
  Main: undefined
  Detail: { movieId: string; movie?: Movie }
  Player: { movieId: string; movie?: Movie; episode?: number; url?: string }
}

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const {
    popularMovies,
    loading,
    error,
    loadHome
  } = useMovieStore()

  const [refreshing, setRefreshing] = useState(false)
  const { paddingTop, isTablet } = useHeaderPadding()
  const numColumns = useGridColumns()
  const { horizontalPadding } = useResponsivePadding()

  const loadData = useCallback(async () => {
    await loadHome()
  }, [loadHome])

  useFocusEffect(
    useCallback(() => {
      const { popularMovies, loading } = useMovieStore.getState()
      if (loading) return
      if (popularMovies.length === 0) {
        void loadData()
      }
    }, [loadData])
  )

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadHome()
    setRefreshing(false)
  }

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('Detail', {
      movieId: movie.id,
      movie: movie,
    })
  }

  const handleSearchPress = () => {
    navigation.navigate('Main', { screen: 'Search' } as any)
  }

  if (loading && popularMovies.length === 0) {
    return <Loading />
  }

  if (error && popularMovies.length === 0) {
    return <Error message={error} onRetry={loadData} />
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop, paddingHorizontal: horizontalPadding }]}>
        <Text style={[styles.logo, isTablet && styles.logoTablet]}>追影</Text>
        <TouchableOpacity
          style={[styles.searchButton, isTablet && styles.searchButtonTablet]}
          onPress={handleSearchPress}
        >
          <Text style={[styles.searchText, isTablet && styles.searchTextTablet]}>🔍 搜索</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={popularMovies}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={[styles.row, { paddingHorizontal: horizontalPadding }]}
        renderItem={({ item }) => (
          <MovieCard movie={item} onPress={handleMoviePress} numColumns={numColumns} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={<Empty message="暂无数据" />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  logoTablet: {
    fontSize: 36,
  },
  searchButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  searchButtonTablet: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 24,
  },
  searchText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  searchTextTablet: {
    fontSize: 18,
  },
  row: {
    justifyContent: 'flex-start',
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
})
