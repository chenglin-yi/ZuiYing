import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HomeScreen } from '../../features/home'
import { SearchScreen } from '../../features/search'
import { RankingScreen } from '../../features/ranking'
import { ProfileScreen } from '../../features/profile'
import { MainTabParamList } from './types'
import { colors } from '../../shared/theme'
import { useAdaptiveValue, useResponsiveFontSize } from '../../shared/utils/responsive'

const Tab = createBottomTabNavigator<MainTabParamList>()

function TabBarIcon({ emoji, color, size }: { emoji: string; color: string; size: number }) {
  return <Text style={{ fontSize: size, color }}>{emoji}</Text>
}

export function MainNavigator() {
  const insets = useSafeAreaInsets()
  const tabBarHeight = useAdaptiveValue(60, 72)
  const iconSize = useAdaptiveValue(24, 30)
  const labelFontSize = useResponsiveFontSize(12, 14)
  const bottomPadding = Math.max(insets.bottom, useAdaptiveValue(8, 12))

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: tabBarHeight + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: useAdaptiveValue(8, 12),
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: { fontSize: labelFontSize },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '首页',
          tabBarIcon: ({ color }) => (
            <TabBarIcon emoji="🏠" color={color} size={iconSize} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: '搜索',
          tabBarIcon: ({ color }) => (
            <TabBarIcon emoji="🔍" color={color} size={iconSize} />
          ),
        }}
      />
      <Tab.Screen
        name="Ranking"
        component={RankingScreen}
        options={{
          tabBarLabel: '排行榜',
          tabBarIcon: ({ color }) => (
            <TabBarIcon emoji="🏆" color={color} size={iconSize} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '我的',
          tabBarIcon: ({ color }) => (
            <TabBarIcon emoji="👤" color={color} size={iconSize} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}
