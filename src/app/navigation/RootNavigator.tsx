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
      <Stack.Screen name="Main" component={MainNavigator} />
      <Stack.Screen 
        name="Detail" 
        component={DetailScreen}
        options={{
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="Player" 
        component={PlayerScreen}
        options={{
          animation: 'fade'
        }}
      />
    </Stack.Navigator>
  )
}
