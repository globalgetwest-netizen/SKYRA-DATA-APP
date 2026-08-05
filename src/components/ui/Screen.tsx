import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  footer?: ReactNode;
  edges?: Edge[];
  background?: string;
  contentStyle?: ViewStyle;
  keyboardAware?: boolean;
}

/**
 * Standard screen container: safe-area aware, optional scroll, and a sticky
 * footer slot (used for primary CTAs so they stay pinned above the home bar).
 */
export function Screen({
  children,
  scroll = false,
  padded = true,
  footer,
  edges = ['top', 'left', 'right'],
  background = colors.background,
  contentStyle,
  keyboardAware = true,
}: ScreenProps) {
  const inner = padded ? styles.padded : undefined;

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, inner, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, inner, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: background }]} edges={edges}>
      {keyboardAware ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {body}
          {footer ? <View style={[styles.footer, padded && styles.footerPadded]}>{footer}</View> : null}
        </KeyboardAvoidingView>
      ) : (
        <>
          {body}
          {footer ? <View style={[styles.footer, padded && styles.footerPadded]}>{footer}</View> : null}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { paddingHorizontal: spacing.xl },
  scrollContent: { paddingBottom: spacing['3xl'], flexGrow: 1 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  footerPadded: { paddingHorizontal: spacing.xl },
});
