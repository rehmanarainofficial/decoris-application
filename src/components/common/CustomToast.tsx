import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View, Platform, StatusBar } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants';

interface CustomToastProps {
  visible: boolean;
  message: string;
  type?: 'error' | 'success' | 'info';
  onHide?: () => void;
}

export const CustomToast: React.FC<CustomToastProps> = ({
  visible,
  message,
  type = 'error',
  onHide,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(-100);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 12 : 50,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onHide) {
            onHide();
          }
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, slideAnim, opacityAnim, onHide]);

  if (!visible) {
    return null;
  }

  const isError = type === 'error';

  return (
    <View style={styles.toastContainer} pointerEvents="none">
      <Animated.View
        style={[
          styles.toastCard,
          isError ? styles.errorToast : styles.successToast,
          {
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Text style={styles.toastText}>{message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    alignItems: 'center',
  },
  toastCard: {
    width: '90%',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorToast: {
    backgroundColor: '#C92A2A',
  },
  successToast: {
    backgroundColor: Colors.primary,
  },
  toastText: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
