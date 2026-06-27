import React from 'react'
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native'
import { colors } from '../theme'

interface LoadingProps {
  size?: 'small' | 'large'
  color?: string
  text?: string
}

export function Loading({ size = 'large', color = colors.primary, text }: LoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary
  }
})
