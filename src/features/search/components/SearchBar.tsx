import React from 'react'
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { colors, spacing, borderRadius } from '../../../shared/theme'
import { useHeaderPadding, useAdaptiveValue } from '../../../shared/utils/responsive'

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  onSubmit: () => void
  onClear: () => void
  placeholder?: string
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder = '搜索电影、电视剧...'
}: SearchBarProps) {
  const { paddingTop, isTablet } = useHeaderPadding()
  const inputHeight = useAdaptiveValue(40, 52)

  return (
    <View style={[styles.container, { paddingTop, paddingHorizontal: isTablet ? spacing.lg : spacing.md }]}>
      <View style={[styles.inputContainer, isTablet && styles.inputContainerTablet]}>
        <TextInput
          style={[styles.input, { height: inputHeight, fontSize: isTablet ? 18 : 16 }]}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          returnKeyType="search"
          autoFocus
        />
        {value.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={onClear}>
            <Text style={[styles.clearIcon, isTablet && styles.clearIconTablet]}>×</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
  },
  inputContainerTablet: {
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearIcon: {
    fontSize: 20,
    color: colors.textTertiary,
  },
  clearIconTablet: {
    fontSize: 28,
  },
})
