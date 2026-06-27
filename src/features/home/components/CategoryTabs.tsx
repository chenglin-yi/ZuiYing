import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { colors, spacing } from '../../../shared/theme'

interface CategoryTabsProps {
  categories: { id: string; name: string }[]
  currentCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryTabs({ categories, currentCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.tab,
              currentCategory === category.id && styles.activeTab
            ]}
            onPress={() => onCategoryChange(category.id)}
          >
            <Text
              style={[
                styles.tabText,
                currentCategory === category.id && styles.activeTabText
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm
  },
  scrollContent: {
    paddingHorizontal: spacing.md
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface
  },
  activeTab: {
    backgroundColor: colors.primary
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  activeTabText: {
    color: '#FFFFFF'
  }
})
