import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme'

interface EmptyProps {
  message?: string
}

export function Empty({ message = '暂无数据' }: EmptyProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📭</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20
  },
  icon: {
    fontSize: 48,
    marginBottom: 16
  },
  message: {
    fontSize: 16,
    color: colors.textTertiary,
    textAlign: 'center'
  }
})
