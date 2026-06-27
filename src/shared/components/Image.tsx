import React, { useState } from 'react'
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native'
import { colors } from '../theme'

interface ImageProps {
  uri?: string
  style?: any
  placeholder?: string
}

export function ImageComponent({ uri, style, placeholder }: ImageProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  if (!uri) {
    return <View style={[styles.placeholder, style]} />
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri }}
        style={styles.image}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setError(true)
          setLoading(false)
        }}
      />
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface
  },
  placeholder: {
    backgroundColor: colors.surface
  }
})
