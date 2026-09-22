import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface BackstageLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'dark' | 'light';
  showSubtitle?: boolean;
}

export const BackstageLogo: React.FC<BackstageLogoProps> = ({
  size = 'medium',
  variant = 'dark',
  showSubtitle = true,
}) => {
  const isDark = variant === 'dark';
  const textColor = isDark ? '#111827' : '#FFFFFF';
  const starRed = isDark ? '#DC2626' : '#FFFFFF'; // Brand red on light bg, crisp white on dark/red bg

  // Sizing configurations
  const config = {
    small: {
      starSize: 10,
      fontSize: 20,
      subtitleFontSize: 8,
      subtitleLetterSpacing: 5,
      starOffsetLeft: 0,
      starOffsetTop: -6,
      containerGap: -2,
    },
    medium: {
      starSize: 16,
      fontSize: 32,
      subtitleFontSize: 11,
      subtitleLetterSpacing: 7,
      starOffsetLeft: 1,
      starOffsetTop: -10,
      containerGap: -2,
    },
    large: {
      starSize: 22,
      fontSize: 44,
      subtitleFontSize: 14,
      subtitleLetterSpacing: 9,
      starOffsetLeft: 2,
      starOffsetTop: -14,
      containerGap: -3,
    },
  }[size];

  return (
    <View style={styles.container}>
      {/* Main Brand Title with Star */}
      <View style={styles.titleWrapper}>
        {/* Red Star placed above the 'b' */}
        <View
          style={[
            styles.starWrapper,
            {
              left: config.starOffsetLeft,
              top: config.starOffsetTop,
            },
          ]}
        >
          <Svg
            width={config.starSize}
            height={config.starSize}
            viewBox="0 0 24 24"
            fill={starRed}
          >
            <Path d="M12 1.5L15.09 8.26L22.5 9.27L17.14 14.39L18.47 21.73L12 18.17L5.53 21.73L6.86 14.39L1.5 9.27L8.91 8.26L12 1.5Z" />
          </Svg>
        </View>

        {/* 'backstage' text in bold modern lowercase */}
        <Text
          style={[
            styles.mainText,
            {
              fontSize: config.fontSize,
              color: textColor,
            },
          ]}
        >
          backstage
        </Text>
      </View>

      {/* 'Rentals' subtitle in wide red text */}
      {showSubtitle && (
        <Text
          style={[
            styles.subtitleText,
            {
              fontSize: config.subtitleFontSize,
              letterSpacing: config.subtitleLetterSpacing,
              color: starRed,
            },
          ]}
        >
          Rentals
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    position: 'relative',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  starWrapper: {
    position: 'absolute',
    zIndex: 2,
  },
  mainText: {
    fontWeight: '800',
    fontFamily: 'System',
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
  subtitleText: {
    fontWeight: '500',
    fontFamily: 'System',
    marginTop: 2,
    textTransform: 'none',
    includeFontPadding: false,
  },
});
