import React, { useEffect } from 'react'
import { StatusBar } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { RootNavigator } from './src/app/navigation/RootNavigator'
import { useSettingsStore, useFavoriteStore, useHistoryStore, usePlaylistStore } from './src/shared/stores'

export default function App() {
  const { loadSettings } = useSettingsStore()
  const { loadFavorites } = useFavoriteStore()
  const { loadRecords } = useHistoryStore()
  const { loadQueue } = usePlaylistStore()

  useEffect(() => {
    loadSettings()
    loadFavorites()
    loadRecords()
    loadQueue()
  }, [loadSettings, loadFavorites, loadRecords, loadQueue])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
