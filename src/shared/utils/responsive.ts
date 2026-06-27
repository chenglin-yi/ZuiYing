import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// 平板断点（宽度 >= 768 视为平板）
const TABLET_BREAKPOINT = 768

/**
 * 判断当前屏幕是否为平板尺寸
 */
export function useIsTablet(): boolean {
  const { width } = useWindowDimensions()
  return width >= TABLET_BREAKPOINT
}

/**
 * 根据屏幕宽度在手机和平板之间返回不同的值
 */
export function useAdaptiveValue<T>(phoneValue: T, tabletValue: T): T {
  const isTablet = useIsTablet()
  return isTablet ? tabletValue : phoneValue
}

/**
 * 获取响应式的网格列数（用于 FlatList numColumns）
 */
export function useGridColumns(): number {
  const { width } = useWindowDimensions()
  if (width >= 1200) return 6
  if (width >= 900) return 5
  if (width >= TABLET_BREAKPOINT) return 4
  return 3
}

/**
 * 获取响应式的 padding 水平间距
 * 平板上内容区域过大时限制最大宽度，居中显示
 */
export function useResponsivePadding() {
  const { width } = useWindowDimensions()
  const isTablet = width >= TABLET_BREAKPOINT

  // 平板上增大水平内边距，让内容不贴边
  const horizontalPadding = isTablet ? Math.min(width * 0.06, 48) : 16
  return { horizontalPadding, isTablet }
}

/**
 * 获取底部 Tab 栏的响应式样式
 * 平板上增大 touch target，适配横屏
 */
export function useTabBarStyle() {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const isTablet = width >= TABLET_BREAKPOINT

  return {
    height: isTablet ? 72 : 60,
    paddingBottom: Math.max(insets.bottom, isTablet ? 12 : 8),
    paddingTop: isTablet ? 12 : 8,
  }
}

/**
 * 获取响应式的 SafeArea 顶部 padding
 * 用于各页面 header，确保在刘海屏 / 平板上内容不被遮挡
 */
export function useHeaderPadding() {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const isTablet = width >= TABLET_BREAKPOINT

  return {
    paddingTop: Math.max(insets.top, isTablet ? 24 : 16),
    isTablet,
  }
}

/**
 * 响应式字体大小
 */
export function useResponsiveFontSize(phoneSize: number, tabletSize?: number): number {
  const isTablet = useIsTablet()
  if (!isTablet) return phoneSize
  return tabletSize ?? phoneSize * 1.15
}
