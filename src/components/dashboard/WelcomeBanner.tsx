import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Colors, Typography, Spacing } from '../../constants';

interface WelcomeBannerProps {
  userName?: string;
  subtitle?: string;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  userName = 'Ahsan',
  subtitle = "Let's manage your orders and business today.",
}) => {
  return (
    <View style={styles.cardContainer}>
      <ImageBackground
        source={require('../../assets/images/banquet_wide.jpg')}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <LinearGradient id="bannerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#FAF6F0" stopOpacity="0.98" />
              <Stop offset="42%" stopColor="#FAF6F0" stopOpacity="0.92" />
              <Stop offset="68%" stopColor="#FAF6F0" stopOpacity="0.45" />
              <Stop offset="100%" stopColor="#FAF6F0" stopOpacity="0.05" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#bannerGradient)" />
        </Svg>

        <View style={styles.textContainer}>
          <Text style={styles.greetingLabel}>Welcome back,</Text>
          <Text style={styles.userNameText}>{userName}</Text>
          <Text style={styles.subtitleText}>{subtitle}</Text>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    borderRadius: Spacing.borderRadius.xl,
    overflow: 'hidden',
    height: 160,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  textContainer: {
    width: '65%',
    height: '100%',
    justifyContent: 'center',
    paddingLeft: Spacing.xl,
    paddingRight: Spacing.md,
    zIndex: 2,
  },
  greetingLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  userNameText: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitleText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
