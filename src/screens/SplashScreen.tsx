import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { FlourishLoopIcon } from '../components/common/Icons';
import { Colors, Typography, Spacing } from '../constants';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 2400);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Animated.View
        style={[
          styles.contentWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* App Icon Artwork Preview */}
        <View style={styles.iconCircleWrapper}>
          <Image
            source={require('../assets/images/app_icon.png')}
            style={styles.iconImage}
            resizeMode="cover"
          />
        </View>

        {/* Brand Name */}
        <Text style={styles.brandTitle}>Decoris</Text>

        {/* Gold Flourish */}
        <View style={styles.flourishWrapper}>
          <FlourishLoopIcon width={90} height={18} color={Colors.accentGold} />
        </View>

        {/* Tagline */}
        <Text style={styles.taglineText}>
          Events <Text style={styles.taglineDivider}>|</Text> Catering{' '}
          <Text style={styles.taglineDivider}>|</Text> Excellence
        </Text>
      </Animated.View>

      {/* Loading Indicator */}
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={Colors.accentGold} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5B141C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    alignItems: 'center',
  },
  iconCircleWrapper: {
    width: 100,
    height: 100,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.accentGold,
    shadowColor: Colors.accentGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    fontSize: Typography.fontSize.xxxl + 12,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accentGold,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: 1,
  },
  flourishWrapper: {
    marginVertical: Spacing.xs,
  },
  taglineText: {
    fontSize: Typography.fontSize.xs + 2,
    fontWeight: Typography.fontWeight.medium,
    color: '#E8D5C4',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  taglineDivider: {
    color: Colors.accentGold,
    fontWeight: Typography.fontWeight.bold,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 60,
  },
});
