import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { MainNavigator } from './MainNavigator'
import { DetailScreen } from '../../features/detail'
import { PlayerScreen } from '../../features/player'
import { RootStackParamList } from './types'
import { colors } from '../../shared/theme'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen
        name="Main"
        component={MainNavigator}
        options={{
          orientation: 'portrait'
        }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{
          animation: 'slide_from_right',
          orientation: 'portrait'
        }}
      />
      <Stack.Screen
        name="Player"
        component={PlayerScreen}
        options={{
          animation: 'fade',
          orientation: 'portrait',
          // 注意：不再在这里强制 screenOrientation，改由播放页通过
          // expo-screen-orientation 动态控制，避免与 react-native-screens
          // 冲突导致旋转时闪退（expo issue #45479 类似场景）。
        }}
      />
    </Stack.Navigator>
  )
}
