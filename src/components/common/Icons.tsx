import React from 'react';
import Svg, { Path, Rect, Circle, Line, Polyline, Ellipse } from 'react-native-svg';
import { Colors } from '../../constants';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const LocationIcon: React.FC<IconProps> = ({
  size = 18,
  color = Colors.primary,
  strokeWidth = 1.8,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10A9 9 0 1 1 21 10Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const PhoneIcon: React.FC<IconProps> = ({
  size = 18,
  color = Colors.primary,
  strokeWidth = 1.8,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.92V19.92A2 2 0 0 1 19.97 22A19.79 19.79 0 0 1 2.08 4.12A2 2 0 0 1 4.11 2H7.11A2 2 0 0 1 9.11 3.72C9.24 4.67 9.47 5.6 9.8 6.49A2 2 0 0 1 9.32 8.68L8.06 9.94A16 16 0 0 0 14.06 15.94L15.32 14.68A2 2 0 0 1 17.51 14.2C18.4 14.53 19.33 14.76 20.28 14.89A2 2 0 0 1 22 16.92Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const FileTextIcon: React.FC<IconProps> = ({
  size = 18,
  color = Colors.primary,
  strokeWidth = 1.8,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline points="14 2 14 8 20 8" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="16" y1="13" x2="8" y2="13" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="16" y1="17" x2="8" y2="17" stroke={color} strokeWidth={strokeWidth} />
    <Polyline points="10 9 9 9 8 9" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const RefreshIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#FFFFFF',
  strokeWidth = 1.8,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 4V10H17"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20.49 15A9 9 0 1 1 21.21 8L23 10"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({
  size = 22,
  color = Colors.primary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M5 12L12 19M5 12L12 5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HomeIcon: React.FC<IconProps> = ({
  size = 22,
  color = Colors.primary,
  strokeWidth = 1.8,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9L12 2L21 9V20A1 1 0 0 1 20 21H4A1 1 0 0 1 3 20V9Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M9 21V12H15V21" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const SaveIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#FFFFFF',
  strokeWidth = 1.8,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H16L21 8V19A2 2 0 0 1 19 21Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline points="17 21 17 13 7 13 7 21" stroke={color} strokeWidth={strokeWidth} />
    <Polyline points="7 3 7 8 15 8" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const PrinterIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#FFFFFF',
  strokeWidth = 1.8,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="6 9 6 2 18 2 18 9" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M6 18H4A2 2 0 0 1 2 16V11A2 2 0 0 1 4 9H20A2 2 0 0 1 22 11V16A2 2 0 0 1 20 18H18"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Rect x="6" y="14" width="12" height="8" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const TrashIcon: React.FC<IconProps> = ({
  size = 18,
  color = Colors.accentRed,
  strokeWidth = 1.8,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="3 6 5 6 21 6" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M19 6V19A2 2 0 0 1 17 21H7A2 2 0 0 1 5 19V6M8 6V4A2 2 0 0 1 10 2H14A2 2 0 0 1 16 4V6"
      stroke={color}
      strokeWidth={strokeWidth}
    />
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({
  size = 18,
  color = Colors.textMuted,
  strokeWidth = 1.8,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const EditIcon: React.FC<IconProps> = ({
  size = 18,
  color = Colors.primary,
  strokeWidth = 1.8,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4A2 2 0 0 0 2 6V20A2 2 0 0 0 4 22H18A2 2 0 0 0 20 20V13"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 2.5A2.121 2.121 0 0 1 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const UserOutlineIcon: React.FC<IconProps> = ({
  size = 20,
  color = Colors.primary,
  strokeWidth = 1.8,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 19V21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const LockOutlineIcon: React.FC<IconProps> = ({
  size = 20,
  color = Colors.primary,
  strokeWidth = 1.8,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M8 11V7A4 4 0 0 1 16 7V11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const EyeOutlineIcon: React.FC<IconProps> = ({
  size = 20,
  color = Colors.textMuted,
  strokeWidth = 1.8,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const EyeOffOutlineIcon: React.FC<IconProps> = ({
  size = 20,
  color = Colors.textMuted,
  strokeWidth = 1.8,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.89 1 12A10.3 10.3 0 0 1 5.06 6.06M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.11 23 12A10.45 10.45 0 0 1 19.54 16.86M1 1L23 23"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SquareIcon: React.FC<IconProps> = ({
  size = 18,
  color = Colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="4" stroke={color} strokeWidth="1.8" />
  </Svg>
);

export const CheckSquareIcon: React.FC<IconProps> = ({
  size = 18,
  color = Colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="4" fill={color} stroke={color} strokeWidth="1.8" />
    <Polyline points="9 12 11 14 15 10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const LogOutIcon: React.FC<IconProps> = ({
  size = 22,
  color = Colors.primary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H9"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline
      points="16 17 21 12 16 7"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line
      x1="21"
      y1="12"
      x2="9"
      y2="12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const MenuIcon: React.FC<IconProps> = ({
  size = 24,
  color = Colors.primary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 6H20M4 12H20M4 18H20"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BellIcon: React.FC<IconProps> = ({
  size = 24,
  color = Colors.primary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21S18 15 18 8Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.73 21A2 2 0 0 1 10.27 21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CrownIcon: React.FC<IconProps> = ({
  size = 22,
  color = Colors.accentGold,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 18L5 8L9.5 12L12 4L14.5 12L19 8L21 18H3Z"
      fill={color}
      stroke={color}
      strokeWidth={1}
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="3" r="1.5" fill={color} />
    <Circle cx="4" cy="7" r="1.2" fill={color} />
    <Circle cx="20" cy="7" r="1.2" fill={color} />
  </Svg>
);

export const FlourishLoopIcon: React.FC<{ width?: number; height?: number; color?: string }> = ({
  width = 65,
  height = 14,
  color = Colors.accentGold,
}) => (
  <Svg width={width} height={height} viewBox="0 0 80 16" fill="none">
    <Path
      d="M 2 8 C 15 2, 25 14, 40 8 C 55 2, 65 14, 78 8"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Ellipse cx="40" cy="8" rx="8" ry="4" stroke={color} strokeWidth="1.2" />
    <Circle cx="40" cy="8" r="1.5" fill={color} />
  </Svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({
  size = 14,
  color = Colors.primary,
  strokeWidth = 2.2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18L15 12L9 6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({
  size = 14,
  color = Colors.textPrimary,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9L12 15L18 9"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const TentativeOrdersIcon: React.FC<IconProps> = ({
  size = 24,
  color = Colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="4" width="14" height="17" rx="2" stroke={color} strokeWidth="1.8" />
    <Path d="M9 9H15M9 13H15M9 17H12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Rect x="8" y="2" width="8" height="4" rx="1" fill="#FFF" stroke={color} strokeWidth="1.6" />
    <Circle cx="10" cy="9" r="0.8" fill={color} />
    <Circle cx="10" cy="13" r="0.8" fill={color} />
    <Circle cx="10" cy="17" r="0.8" fill={color} />
  </Svg>
);

export const ConfirmedOrdersIcon: React.FC<IconProps> = ({
  size = 24,
  color = Colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="4" width="14" height="17" rx="2" stroke={color} strokeWidth="1.8" />
    <Polyline points="9 12 11 14 15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Rect x="8" y="2" width="8" height="4" rx="1" fill="#FFF" stroke={color} strokeWidth="1.6" />
  </Svg>
);

export const PlusBookingIcon: React.FC<IconProps> = ({
  size = 24,
  color = Colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="4" width="16" height="16" rx="3" stroke={color} strokeWidth="1.8" />
    <Path d="M12 8V16M8 12H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const CalendarIcon: React.FC<IconProps> = ({
  size = 24,
  color = Colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth="1.8" />
    <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="1.8" />
    <Line x1="8" y1="3" x2="8" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="16" y1="3" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="8" cy="14" r="1" fill={color} />
    <Circle cx="12" cy="14" r="1" fill={color} />
    <Circle cx="16" cy="14" r="1" fill={color} />
  </Svg>
);

export const WalletIcon: React.FC<IconProps> = ({
  size = 24,
  color = Colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="14" rx="3" stroke={color} strokeWidth="1.8" />
    <Path d="M3 10H21" stroke={color} strokeWidth="1.5" />
    <Circle cx="16.5" cy="14.5" r="1.2" fill={color} />
  </Svg>
);

export const ShortingIcon: React.FC<IconProps> = ({
  size = 24,
  color = Colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="4" y1="7" x2="14" y2="7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="4" y1="12" x2="11" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="4" y1="17" x2="8" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M17 19V5M17 19L14 16M17 19L20 16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CalculatorIcon: React.FC<IconProps> = ({
  size = 24,
  color = Colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="1.8" />
    <Rect x="7" y="6" width="10" height="4" rx="1" stroke={color} strokeWidth="1.4" />
    <Circle cx="8" cy="13" r="1" fill={color} />
    <Circle cx="12" cy="13" r="1" fill={color} />
    <Circle cx="16" cy="13" r="1" fill={color} />
    <Circle cx="8" cy="17" r="1" fill={color} />
    <Circle cx="12" cy="17" r="1" fill={color} />
    <Circle cx="16" cy="17" r="1" fill={color} />
  </Svg>
);

export const PieChartIcon: React.FC<IconProps> = ({
  size = 24,
  color = Colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12A9 9 0 1 1 12 3V12H21Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HomeTabIcon: React.FC<IconProps> = ({
  size = 20,
  color = Colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9.5L12 3L21 9.5V20A1 1 0 0 1 20 21H4A1 1 0 0 1 3 20V9.5Z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </Svg>
);

export const OrdersTabIcon: React.FC<IconProps> = ({
  size = 20,
  color = Colors.textMuted,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="4" width="14" height="17" rx="2" stroke={color} strokeWidth="1.8" />
    <Path d="M9 9H15M9 13H15M9 17H13" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const CalendarTabIcon: React.FC<IconProps> = ({
  size = 20,
  color = Colors.textMuted,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth="1.8" />
    <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="1.8" />
  </Svg>
);

export const ReportsTabIcon: React.FC<IconProps> = ({
  size = 20,
  color = Colors.textMuted,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="6" y1="20" x2="6" y2="12" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <Line x1="12" y1="20" x2="12" y2="8" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <Line x1="18" y1="20" x2="18" y2="4" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);

export const MoreTabIcon: React.FC<IconProps> = ({
  size = 20,
  color = Colors.textMuted,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="5" cy="12" r="1.8" fill={color} />
    <Circle cx="12" cy="12" r="1.8" fill={color} />
    <Circle cx="19" cy="12" r="1.8" fill={color} />
  </Svg>
);
