import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { Episode } from '../../../shared/types/movie'
import { colors, spacing, borderRadius } from '../../../shared/theme'

interface EpisodeListProps {
  episodes: Episode[]
  selectedEpisode: number
  onEpisodeSelect: (episode: Episode) => void
}

export function EpisodeList({ episodes, selectedEpisode, onEpisodeSelect }: EpisodeListProps) {
  if (!episodes || episodes.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>选集</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.episodesRow}>
          {episodes.map((episode) => (
            <TouchableOpacity
              key={episode.id}
              style={[
                styles.episodeItem,
                selectedEpisode === episode.number && styles.selectedEpisode
              ]}
              onPress={() => onEpisodeSelect(episode)}
            >
              <Text
                style={[
                  styles.episodeText,
                  selectedEpisode === episode.number && styles.selectedEpisodeText
                ]}
              >
                {episode.number}
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
  episodesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  episodeItem: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  selectedEpisode: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  episodeText: {
    fontSize: 14,
    color: colors.textSecondary
  },
  selectedEpisodeText: {
    color: '#FFFFFF',
    fontWeight: '600'
  }
})
