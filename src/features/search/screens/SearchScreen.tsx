import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Keyboard, SafeAreaView, ScrollView } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useSearchStore } from '../../../shared/stores'
import { useDebounce } from '../../../shared/hooks'
import { Movie } from '../../../shared/types/movie'
import { RootStackParamList } from '../../../app/navigation/types'
import { SearchBar, SearchResult } from '../components'
import { Loading, Empty } from '../../../shared/components'
import { colors, spacing } from '../../../shared/theme'
import { useResponsivePadding, useAdaptiveValue } from '../../../shared/utils/responsive'

type CategoryType = 'all' | 'movie' | 'tv' | 'animation'

const CATEGORIES: { key: CategoryType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'movie', label: '电影' },
  { key: 'tv', label: '电视剧' },
  { key: 'animation', label: '动漫' }
]

interface SearchScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>
}

export function SearchScreen({ navigation }: SearchScreenProps) {
  const [inputValue, setInputValue] = useState('')
  const [category, setCategory] = useState<CategoryType>('all')
  const debouncedValue = useDebounce(inputValue, 500)
  const { horizontalPadding } = useResponsivePadding()
  const isTablet = useAdaptiveValue(false, true)

  const {
    results,
    resultsQuery,
    history,
    loading,
    search,
    setKeyword,
    removeHistory,
    clearHistory,
    clearResults,
    loadSearchHistory
  } = useSearchStore()

  useEffect(() => {
    loadSearchHistory()
  }, [loadSearchHistory])

  useEffect(() => {
    const q = debouncedValue.trim()
    if (!q) {
      clearResults()
      return
    }
    void search(q, false)
  }, [debouncedValue, search, clearResults])

  const handleSearch = useCallback(
    async (keyword: string, recordHistory: boolean) => {
      if (keyword.trim()) {
        Keyboard.dismiss()
        await search(keyword.trim(), recordHistory)
      }
    },
    [search]
  )

  const handleInputChange = (text: string) => {
    setInputValue(text)
    setKeyword(text)
  }

  const handleSubmit = () => {
    handleSearch(inputValue, true)
  }

  const handleClear = () => {
    setInputValue('')
    setKeyword('')
    clearResults()
  }

  const handleHistoryPress = (keyword: string) => {
    setInputValue(keyword)
    handleSearch(keyword, true)
  }

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('Detail', {
      movieId: movie.id,
      movie: movie,
    })
  }

  const trimmedDebounced = debouncedValue.trim()
  const resultsMatchInput = trimmedDebounced.length > 0 && resultsQuery === trimmedDebounced

  const filteredResults = useMemo(() => {
    if (category === 'all') return results
    return results.filter(item => {
      if (category === 'movie') return item.media_type === 'movie' || (!item.type?.includes('电视剧') && !item.class?.includes('剧'))
      if (category === 'tv') return item.media_type === 'tv' || item.type?.includes('电视剧') || item.class?.includes('剧')
      if (category === 'animation') return item.type?.includes('动漫') || item.class?.includes('动漫')
      return true
    })
  }, [results, category])

  const showResults = !loading && resultsMatchInput && filteredResults.length > 0
  const showNoResults = !loading && resultsMatchInput && filteredResults.length === 0
  const showHistory = !loading && trimmedDebounced.length === 0 && history.length > 0

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar
        value={inputValue}
        onChangeText={handleInputChange}
        onSubmit={handleSubmit}
        onClear={handleClear}
      />

      {trimmedDebounced.length > 0 && (
        <View style={[styles.categoryContainer, { paddingHorizontal: horizontalPadding }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryTab,
                  isTablet && styles.categoryTabTablet,
                  category === cat.key && styles.categoryTabActive,
                ]}
                onPress={() => setCategory(cat.key)}
              >
                <Text style={[styles.categoryText, category === cat.key && styles.categoryTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading && <Loading />}

      {!loading && showResults && (
        <SearchResult results={filteredResults} onMoviePress={handleMoviePress} />
      )}

      {!loading && showHistory && (
        <View style={[styles.historyContainer, { padding: horizontalPadding }]}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>搜索历史</Text>
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.clearText}>清空</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={history}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.historyItem}
                onPress={() => handleHistoryPress(item)}
              >
                <Text style={styles.historyText}>{item}</Text>
                <TouchableOpacity onPress={() => removeHistory(item)}>
                  <Text style={styles.removeText}>×</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {!loading && showNoResults && <Empty message="未找到相关影视" />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  categoryContainer: {
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  categoryTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  categoryTabTablet: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  categoryTabActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  historyContainer: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  clearText: {
    fontSize: 14,
    color: colors.primary,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  removeText: {
    fontSize: 18,
    color: colors.textTertiary,
    padding: spacing.xs,
  },
})
