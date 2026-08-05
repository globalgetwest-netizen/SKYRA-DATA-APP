import { StyleSheet, View, ViewStyle } from 'react-native';
import { networkColors } from '@/theme';
import { radius } from '@/theme';
import { Text } from './ui/Text';
import type { NetworkCode } from '@/types';

/**
 * A neutral, non-deceptive network lettermark. We deliberately do NOT render
 * imitation carrier logos — a licensed brand asset URL from the backend can be
 * dropped in later. Until then this shows the carrier's short code in its
 * brand colours, which is honest and unambiguous.
 */
const short: Record<NetworkCode, string> = {
  MTN: 'MTN',
  TELECEL: 'TEL',
  AT: 'AT',
};

interface NetworkMarkProps {
  network: NetworkCode;
  size?: number;
  style?: ViewStyle;
}

export function NetworkMark({ network, size = 44, style }: NetworkMarkProps) {
  const c = networkColors[network] ?? networkColors.MTN;
  return (
    <View
      style={[
        styles.mark,
        { width: size, height: size, backgroundColor: c.bg, borderRadius: radius.md },
        style,
      ]}
    >
      <Text
        weight="bold"
        style={{ color: c.fg, fontSize: size * 0.3 }}
        accessibilityLabel={network}
      >
        {short[network] ?? network}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { alignItems: 'center', justifyContent: 'center' },
});
