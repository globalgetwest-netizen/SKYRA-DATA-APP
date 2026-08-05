import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { colors } from '@/theme';

/**
 * Minimal, dependency-free icon set (stroke-based, 24x24 viewBox).
 * No emoji anywhere in the product — these are crisp vector glyphs.
 */
export type IconName =
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'arrow-left'
  | 'check'
  | 'check-circle'
  | 'x'
  | 'x-circle'
  | 'plus'
  | 'home'
  | 'activity'
  | 'users'
  | 'user'
  | 'phone'
  | 'share'
  | 'copy'
  | 'alert-circle'
  | 'alert-triangle'
  | 'clock'
  | 'wifi-off'
  | 'refresh'
  | 'help-circle'
  | 'lock'
  | 'bell'
  | 'search'
  | 'trash'
  | 'credit-card'
  | 'shield'
  | 'star'
  | 'log-out'
  | 'file-text';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 22, color = colors.textPrimary, strokeWidth = 2 }: IconProps) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'chevron-right' && <Polyline points="9 18 15 12 9 6" {...common} />}
      {name === 'chevron-left' && <Polyline points="15 18 9 12 15 6" {...common} />}
      {name === 'chevron-down' && <Polyline points="6 9 12 15 18 9" {...common} />}
      {name === 'arrow-left' && (
        <>
          <Line x1="19" y1="12" x2="5" y2="12" {...common} />
          <Polyline points="12 19 5 12 12 5" {...common} />
        </>
      )}
      {name === 'check' && <Polyline points="20 6 9 17 4 12" {...common} />}
      {name === 'check-circle' && (
        <>
          <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" {...common} />
          <Polyline points="22 4 12 14.01 9 11.01" {...common} />
        </>
      )}
      {name === 'x' && (
        <>
          <Line x1="18" y1="6" x2="6" y2="18" {...common} />
          <Line x1="6" y1="6" x2="18" y2="18" {...common} />
        </>
      )}
      {name === 'x-circle' && (
        <>
          <Circle cx="12" cy="12" r="10" {...common} />
          <Line x1="15" y1="9" x2="9" y2="15" {...common} />
          <Line x1="9" y1="9" x2="15" y2="15" {...common} />
        </>
      )}
      {name === 'plus' && (
        <>
          <Line x1="12" y1="5" x2="12" y2="19" {...common} />
          <Line x1="5" y1="12" x2="19" y2="12" {...common} />
        </>
      )}
      {name === 'home' && (
        <>
          <Path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" {...common} />
        </>
      )}
      {name === 'activity' && <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" {...common} />}
      {name === 'users' && (
        <>
          <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...common} />
          <Circle cx="9" cy="7" r="4" {...common} />
          <Path d="M23 21v-2a4 4 0 0 0-3-3.87" {...common} />
          <Path d="M16 3.13a4 4 0 0 1 0 7.75" {...common} />
        </>
      )}
      {name === 'user' && (
        <>
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" {...common} />
          <Circle cx="12" cy="7" r="4" {...common} />
        </>
      )}
      {name === 'phone' && (
        <Path
          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"
          {...common}
        />
      )}
      {name === 'share' && (
        <>
          <Circle cx="18" cy="5" r="3" {...common} />
          <Circle cx="6" cy="12" r="3" {...common} />
          <Circle cx="18" cy="19" r="3" {...common} />
          <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" {...common} />
          <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" {...common} />
        </>
      )}
      {name === 'copy' && (
        <>
          <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" {...common} />
          <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" {...common} />
        </>
      )}
      {name === 'alert-circle' && (
        <>
          <Circle cx="12" cy="12" r="10" {...common} />
          <Line x1="12" y1="8" x2="12" y2="12" {...common} />
          <Line x1="12" y1="16" x2="12.01" y2="16" {...common} />
        </>
      )}
      {name === 'alert-triangle' && (
        <>
          <Path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" {...common} />
          <Line x1="12" y1="9" x2="12" y2="13" {...common} />
          <Line x1="12" y1="17" x2="12.01" y2="17" {...common} />
        </>
      )}
      {name === 'clock' && (
        <>
          <Circle cx="12" cy="12" r="10" {...common} />
          <Polyline points="12 6 12 12 16 14" {...common} />
        </>
      )}
      {name === 'wifi-off' && (
        <>
          <Line x1="1" y1="1" x2="23" y2="23" {...common} />
          <Path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" {...common} />
          <Path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" {...common} />
          <Path d="M10.71 5.05A16 16 0 0 1 22.58 9" {...common} />
          <Path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" {...common} />
          <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" {...common} />
          <Line x1="12" y1="20" x2="12.01" y2="20" {...common} />
        </>
      )}
      {name === 'refresh' && (
        <>
          <Polyline points="23 4 23 10 17 10" {...common} />
          <Polyline points="1 20 1 14 7 14" {...common} />
          <Path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" {...common} />
        </>
      )}
      {name === 'help-circle' && (
        <>
          <Circle cx="12" cy="12" r="10" {...common} />
          <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" {...common} />
          <Line x1="12" y1="17" x2="12.01" y2="17" {...common} />
        </>
      )}
      {name === 'lock' && (
        <>
          <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" {...common} />
          <Path d="M7 11V7a5 5 0 0 1 10 0v4" {...common} />
        </>
      )}
      {name === 'bell' && (
        <>
          <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" {...common} />
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" {...common} />
        </>
      )}
      {name === 'search' && (
        <>
          <Circle cx="11" cy="11" r="8" {...common} />
          <Line x1="21" y1="21" x2="16.65" y2="16.65" {...common} />
        </>
      )}
      {name === 'trash' && (
        <>
          <Polyline points="3 6 5 6 21 6" {...common} />
          <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" {...common} />
        </>
      )}
      {name === 'credit-card' && (
        <>
          <Rect x="1" y="4" width="22" height="16" rx="2" ry="2" {...common} />
          <Line x1="1" y1="10" x2="23" y2="10" {...common} />
        </>
      )}
      {name === 'shield' && <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" {...common} />}
      {name === 'star' && (
        <Path
          d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"
          {...common}
        />
      )}
      {name === 'log-out' && (
        <>
          <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" {...common} />
          <Polyline points="16 17 21 12 16 7" {...common} />
          <Line x1="21" y1="12" x2="9" y2="12" {...common} />
        </>
      )}
      {name === 'file-text' && (
        <>
          <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" {...common} />
          <Polyline points="14 2 14 8 20 8" {...common} />
          <Line x1="16" y1="13" x2="8" y2="13" {...common} />
          <Line x1="16" y1="17" x2="8" y2="17" {...common} />
          <Polyline points="10 9 9 9 8 9" {...common} />
        </>
      )}
    </Svg>
  );
}
