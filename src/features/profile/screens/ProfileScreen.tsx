import React, { useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useFocusEffect } from '@react-navigation/native'
import { useHistoryStore, useFavoriteStore } from '../../../shared/stores'
import { Movie, HistoryRecord } from '../../../shared/types/movie'
import { HistoryItem, FavoriteItem } from '../components'
import { Empty } from '../../../shared/components'
import { colors, spacing } from '../../../shared/theme'
import { useHeaderPadding, useResponsivePadding } from '../../../shared/utils/responsive'

type RootStackParamList = {
  Main: undefined
  Detail: { movieId: string; movie?: Movie }
  Player: { movieId: string; movie?: Movie; episode?: number; url?: string }
}

interface ProfileScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>
}

type TabType = 'history' | 'favorites'

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('history')
  const { records, loadRecords, removeRecord, clearAll: clearHistory } = useHistoryStore()
  const { favorites, loadFavorites, removeFavorite, clearAll: clearFavorites } = useFavoriteStore()
  const { paddingTop, isTablet } = useHeaderPadding()
  const { horizontalPadding } = useResponsivePadding()

  useFocusEffect(
    useCallback(() => {
      loadRecords()
      loadFavorites()
    }, [loadRecords, loadFavorites])
  )

  const handleHistoryPress = (record: HistoryRecord) => {
    navigation.navigate('Detail', { movieId: record.movie.id, movie: record.movie })
  }

  const handleFavoritePress = (movie: Movie) => {
    navigation.navigate('Detail', { movieId: movie.id, movie })
  }

  const handleRemoveHistory = (id: string) => {
    removeRecord(id)
  }

  const handleRemoveFavorite = (id: string) => {
    removeFavorite(id)
  }

  const handleClearHistory = () => {
    Alert.alert('清空历史', '确定清空所有观看历史吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: clearHistory }
    ])
  }

  const handleClearFavorites = () => {
    Alert.alert('清空收藏', '确定清空所有收藏吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: clearFavorites }
    ])
  }

  const renderHistoryItem = ({ item }: { item: HistoryRecord }) => (
    <HistoryItem 
      record={item} 
      onPress={handleHistoryPress} 
      onRemove={handleRemoveHistory} 
    />
  )

  const renderFavoriteItem = ({ item }: { item: Movie }) => (
    <FavoriteItem 
      movie={item} 
      onPress={handleFavoritePress} 
      onRemove={handleRemoveFavorite} 
    />
  )

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop, paddingHorizontal: horizontalPadding }]}>
        <Text style={[styles.title, isTablet && styles.titleTablet]}>个人中心</Text>
      </View>

      <View style={[styles.tabs, { paddingHorizontal: horizontalPadding }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            追剧记录
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
            我的收藏
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'history' && (
        <>
          {records.length > 0 && (
            <TouchableOpacity style={[styles.clearButton, { paddingHorizontal: horizontalPadding }]} onPress={handleClearHistory}>
              <Text style={styles.clearText}>清空历史</Text>
            </TouchableOpacity>
          )}
          <FlatList
            data={records}
            keyExtractor={(item) => item.id}
            renderItem={renderHistoryItem}
            contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingBottom: spacing.xl }}
            ListEmptyComponent={<Empty message="暂无观看记录" />}
          />
        </>
      )}

      {activeTab === 'favorites' && (
        <>
          {favorites.length > 0 && (
            <TouchableOpacity style={[styles.clearButton, { paddingHorizontal: horizontalPadding }]} onPress={handleClearFavorites}>
              <Text style={styles.clearText}>清空收藏</Text>
            </TouchableOpacity>
          )}
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={renderFavoriteItem}
            contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingBottom: spacing.xl }}
            ListEmptyComponent={<Empty message="暂无收藏" />}
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  titleTablet: {
    fontSize: 36,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  clearButton: {
    paddingVertical: spacing.sm,
    alignItems: 'flex-end',
  },
  clearText: {
    fontSize: 14,
    color: colors.error,
  },
})
