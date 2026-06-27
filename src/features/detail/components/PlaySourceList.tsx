import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { PlaySource } from '../../../shared/types/movie'
import { colors, spacing, borderRadius } from '../../../shared/theme'

interface PlaySourceListProps {
  sources: PlaySource[]
  selectedSource: string
  onSourceSelect: (source: PlaySource) => void
}

export function PlaySourceList({ sources, selectedSource, onSourceSelect }: PlaySourceListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>播放源</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.sourcesRow}>
          {sources.map((source) => (
            <TouchableOpacity
              key={source.id}
              style={[
                styles.sourceItem,
                selectedSource === source.id && styles.selectedSource
              ]}
              onPress={() => onSourceSelect(source)}
            >
              <Text
                style={[
                  styles.sourceText,
                  selectedSource === source.id && styles.selectedSourceText
                ]}
              >
                {source.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm
  },
  sourcesRow: {
    flexDirection: 'row'
  },
  sourceItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  selectedSource: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  sourceText: {
    fontSize: 14,
    color: colors.textSecondary
  },
  selectedSourceText: {
    color: '#FFFFFF'
  }
})
