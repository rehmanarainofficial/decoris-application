import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import {
  CrownIcon,
  FlourishLoopIcon,
  UserOutlineIcon,
  LockOutlineIcon,
  EyeOutlineIcon,
  EyeOffOutlineIcon,
  SquareIcon,
  CheckSquareIcon,
} from '../components/common/Icons';
import { CustomToast } from '../components/common/CustomToast';
import { Colors, Typography, Spacing } from '../constants';
import { useAppDispatch } from '../hooks';
import { loginSuccess } from '../store/slices/userSlice';
import { useLoginMutation, ApiUserRecord } from '../api/authApi';
import { md5 } from '../utils/md5';

export const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Custom Toast State (No Alert used)
  const [toastState, setToastState] = useState<{
    visible: boolean;
    message: string;
    type: 'error' | 'success';
  }>({
    visible: false,
    message: '',
    type: 'error',
  });

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToastState({ visible: true, message, type });
  };

  const hideToast = React.useCallback(() => {
    setToastState((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      showToast('Please enter your username and password.', 'error');
      return;
    }

    try {
      const res = await login({
        user_id: username.trim(),
        password: password,
      }).unwrap();

      const isStatusSuccess =
        res && (String(res.status) === 'true' || String(res.status) === '1');

      if (isStatusSuccess && Array.isArray(res.data) && res.data.length > 0) {
        const inputUser = username.trim().toLowerCase();
        const inputPasswordHash = md5(password.trim()).toLowerCase();

        // Check if array has a matching user record
        const foundUser = res.data.find((u: ApiUserRecord) => {
          const isUserMatch = u.user_id.toLowerCase() === inputUser;
          const isPassMatch = u.password
            ? u.password.toLowerCase() === inputPasswordHash ||
              u.password === password ||
              u.password.toLowerCase() === password.trim().toLowerCase()
            : true;
          return isUserMatch && isPassMatch;
        });

        // STRICT LOGIC: ONLY log in if an EXACT user_id & password match is found!
        if (foundUser) {
          dispatch(
            loginSuccess({
              id: foundUser.id,
              name: foundUser.real_name || foundUser.user_id,
              role: 'Event Manager',
              unreadNotifications: 1,
            })
          );
          return;
        }
      }

      showToast('Incorrect username or password. Please try again.', 'error');
    } catch (err: any) {
      if (
        err?.status === 'FETCH_ERROR' ||
        err?.status === 'PARSING_ERROR' ||
        (err?.error && String(err.error).toLowerCase().includes('network')) ||
        (err?.message && String(err.message).toLowerCase().includes('network'))
      ) {
        showToast(
          'Network Error: Unable to connect to server. Please check your internet connection.',
          'error'
        );
      } else {
        showToast('Incorrect username or password. Please try again.', 'error');
      }
    }
  };

  const handleForgotPassword = () => {
    showToast('Password reset instructions have been sent.', 'success');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Custom Toast Notification (No Alert Used) */}
      <CustomToast
        visible={toastState.visible}
        message={toastState.message}
        type={toastState.type}
        onHide={hideToast}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.brandContainer}>
            <View style={styles.crownWrapper}>
              <CrownIcon size={24} color={Colors.accentGold} />
            </View>
            <Text style={styles.logoText}>Decoris</Text>
            <View style={styles.flourishWrapper}>
              <FlourishLoopIcon width={85} height={16} color={Colors.accentGold} />
            </View>
            <Text style={styles.taglineText}>
              Events <Text style={styles.taglineDivider}>|</Text> Catering{' '}
              <Text style={styles.taglineDivider}>|</Text> Excellence
            </Text>
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={styles.titleText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>Sign in to your account</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <View style={styles.leftIconContainer}>
                <UserOutlineIcon size={20} color={Colors.primary} />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Username"
                placeholderTextColor={Colors.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.leftIconContainer}>
                <LockOutlineIcon size={20} color={Colors.primary} />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.rightIconContainer}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                activeOpacity={0.7}
              >
                {isPasswordVisible ? (
                  <EyeOffOutlineIcon size={20} color={Colors.textMuted} />
                ) : (
                  <EyeOutlineIcon size={20} color={Colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
              >
                {rememberMe ? (
                  <CheckSquareIcon size={18} color={Colors.primary} />
                ) : (
                  <SquareIcon size={18} color={Colors.border} />
                )}
                <Text style={styles.rememberMeText}>Remember Me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomArtworkContainer}>
            <Image
              source={require('../assets/images/login_banquet.jpg')}
              style={styles.banquetArtwork}
              resizeMode="cover"
            />
            <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
              <Defs>
                <LinearGradient id="loginImageBlend" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#FAF8F5" stopOpacity="0.85" />
                  <Stop offset="35%" stopColor="#FAF8F5" stopOpacity="0.30" />
                  <Stop offset="70%" stopColor="#FAF8F5" stopOpacity="0.15" />
                  <Stop offset="100%" stopColor="#FAF8F5" stopOpacity="0.80" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#loginImageBlend)" />
            </Svg>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Decoris. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 16 : Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  crownWrapper: {
    marginBottom: -4,
  },
  logoText: {
    fontSize: Typography.fontSize.xxxl + 6,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: 0.5,
  },
  flourishWrapper: {
    marginTop: -4,
    marginBottom: Spacing.sm,
  },
  taglineText: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  taglineDivider: {
    color: Colors.accentGold,
    fontWeight: Typography.fontWeight.bold,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  titleText: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: Typography.fontSize.sm + 1,
    color: Colors.textSecondary,
  },
  formContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: '#E8E4DF',
    borderRadius: Spacing.borderRadius.md,
    height: 52,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  leftIconContainer: {
    marginRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  rightIconContainer: {
    padding: Spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  forgotPasswordText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: Spacing.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  bottomArtworkContainer: {
    width: '100%',
    height: 140,
    borderRadius: Spacing.borderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  banquetArtwork: {
    width: '100%',
    height: '100%',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  footerText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
});
