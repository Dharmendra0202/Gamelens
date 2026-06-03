import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CRICKET_HERO_IMAGE = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=900&h=900&fit=crop';
const CRICKET_GEAR_IMAGE = 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&h=500&fit=crop';

type ScreenType = 'splash' | 'login' | 'signup';

// ─── Splash Screen ─────────────────────────────────────────────────────────────
// Timeline (total ~1.25s):
//  0ms   – bg instant, pitch lines sweep in (200ms)
//  150ms – logo burst: scale 0→1.08→1, opacity 0→1 (350ms spring)
//  150ms – ring ripple expands & fades (450ms)
//  420ms – wordmark slides up & fades in (220ms)
//  580ms – tagline fades in (180ms)
//  900ms – whole screen fades out (300ms) → onFinish
function SplashScreen({ onFinish }: { onFinish: () => void }) {
  // Pitch line sweep
  const pitchScaleX  = useRef(new Animated.Value(0)).current;
  const pitchOpacity = useRef(new Animated.Value(0)).current;

  // Stadium spotlight
  const spotScale    = useRef(new Animated.Value(0.3)).current;
  const spotOpacity  = useRef(new Animated.Value(0)).current;

  // Logo
  const logoScale    = useRef(new Animated.Value(0.4)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;

  // Ring ripple
  const ringScale    = useRef(new Animated.Value(0.6)).current;
  const ringOpacity  = useRef(new Animated.Value(0.7)).current;

  // Wordmark
  const wordY        = useRef(new Animated.Value(18)).current;
  const wordOpacity  = useRef(new Animated.Value(0)).current;

  // Tagline
  const tagOpacity   = useRef(new Animated.Value(0)).current;

  // Screen exit
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Pitch lines sweep + spotlight bloom — 200ms
      Animated.parallel([
        Animated.timing(pitchOpacity,  { toValue: 1,   duration: 120, useNativeDriver: true }),
        Animated.timing(pitchScaleX,   { toValue: 1,   duration: 200, easing: Easing.out(Easing.exp), useNativeDriver: true }),
        Animated.timing(spotOpacity,   { toValue: 0.18, duration: 200, useNativeDriver: true }),
        Animated.timing(spotScale,     { toValue: 1,   duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      // 2. Logo burst + ring ripple — parallel, 350ms
      Animated.parallel([
        Animated.spring(logoScale,  { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity,{ toValue: 1, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(ringScale,  { toValue: 2.2, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(ringOpacity,{ toValue: 0,   duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // 3. Wordmark reveal — 220ms
      Animated.parallel([
        Animated.timing(wordOpacity, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(wordY,       { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // 4. Tagline — 180ms
      Animated.timing(tagOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      // 5. Hold — 2120ms (extended +2s)
      Animated.delay(2120),
      // 6. Screen exit — 300ms
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[splashStyles.root, { opacity: screenOpacity }]}>
      {/* Deep navy → pitch-black gradient */}
      <LinearGradient
        colors={['#060D1A', '#0A1628', '#071220']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Stadium spotlight bloom */}
      <Animated.View
        style={[
          splashStyles.spotlight,
          { opacity: spotOpacity, transform: [{ scale: spotScale }] },
        ]}
      />

      {/* Pitch lines — horizontal sweep from center */}
      <Animated.View
        style={[
          splashStyles.pitchWrap,
          { opacity: pitchOpacity, transform: [{ scaleX: pitchScaleX }] },
        ]}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              splashStyles.pitchLine,
              {
                opacity: 0.06 + i * 0.018,
                width: 1 + (i % 2) * 0.5,
                left: `${10 + i * 20}%` as any,
              },
            ]}
          />
        ))}
        {/* Center crease */}
        <View style={splashStyles.creaseH} />
      </Animated.View>

      {/* Ring ripple behind logo */}
      <Animated.View
        style={[
          splashStyles.ring,
          { opacity: ringOpacity, transform: [{ scale: ringScale }] },
        ]}
      />

      {/* Logo icon */}
      <Animated.View
        style={[
          splashStyles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        {/* Green glow halo */}
        <LinearGradient
          colors={['rgba(0,196,122,0.32)', 'rgba(14,165,233,0.2)', 'transparent']}
          style={splashStyles.logoHalo}
        />
        {/* Icon container */}
        <LinearGradient
          colors={['#0F2D1F', '#0A1E14']}
          style={splashStyles.logoBg}
        >
          <Text style={splashStyles.logoEmoji}>🏏</Text>
          {/* Inner rim */}
          <View style={splashStyles.logoRim} />
        </LinearGradient>
      </Animated.View>

      {/* Wordmark */}
      <Animated.View
        style={[
          splashStyles.wordWrap,
          { opacity: wordOpacity, transform: [{ translateY: wordY }] },
        ]}
      >
        <Text style={splashStyles.appName}>
          GAME<Text style={splashStyles.appNameGreen}>LENS</Text>
        </Text>
        {/* Green underline accent */}
        <Animated.View style={[splashStyles.wordUnderline, { opacity: wordOpacity }]} />
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[splashStyles.tagline, { opacity: tagOpacity }]}>
        Your Cricket. Your Stats. Your Game.
      </Animated.Text>
    </Animated.View>
  );
}

const splashStyles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#060D1A',
  },

  // Stadium spotlight
  spotlight: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(0,196,122,0.13)',
    top: '-10%',
    alignSelf: 'center',
  },

  // Pitch lines
  pitchWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  pitchLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  creaseH: {
    position: 'absolute',
    left: '20%',
    right: '20%',
    top: '50%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  // Ring ripple
  ring: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(0,196,122,0.55)',
    backgroundColor: 'transparent',
  },

  // Logo
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    zIndex: 10,
  },
  logoHalo: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  logoBg: {
    width: 112,
    height: 112,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00C47A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.55,
    shadowRadius: 36,
    elevation: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(0,196,122,0.3)',
  },
  logoEmoji: {
    fontSize: 52,
  },
  logoRim: {
    position: 'absolute',
    inset: 0,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  // Wordmark
  wordWrap: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 5,
    textShadowColor: 'rgba(0,196,122,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  appNameGreen: {
    color: '#00C47A',
  },
  wordUnderline: {
    marginTop: 6,
    width: 48,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#00C47A',
    shadowColor: '#00C47A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },

  // Tagline
  tagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 1.6,
    marginTop: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

// ─── Auth Screens ───────────────────────────────────────────────────────────────
export default function AuthScreen() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');

  // Login state
  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');
  const [userFocus, setUserFocus]     = useState(false);
  const [passFocus, setPassFocus]     = useState(false);
  const [loginPressed, setLoginPressed] = useState(false);

  // Signup state
  const [fullName, setFullName]             = useState('');
  const [email, setEmail]                   = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Screen transition
  const screenOpacity = useRef(new Animated.Value(0)).current;
  const screenY       = useRef(new Animated.Value(30)).current;

  const fadeIn = () => {
    screenOpacity.setValue(0);
    screenY.setValue(24);
    Animated.parallel([
      Animated.timing(screenOpacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(screenY,       { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  };

  const switchScreen = (next: ScreenType) => {
    Animated.timing(screenOpacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      setCurrentScreen(next);
      fadeIn();
    });
  };

  const handleSplashFinish = () => {
    setCurrentScreen('login');
    fadeIn();
  };

  const handleLogin  = () => router.replace('/(tabs)/home');
  const handleSignup = () => router.replace('/(tabs)/home');

  if (currentScreen === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // ── Login ──
  if (currentScreen === 'login') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.authScrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View style={[styles.authContent, { opacity: screenOpacity, transform: [{ translateY: screenY }] }]}>

            {/* Logo + brand */}
            <View style={styles.logoContainer}>
              <LinearGradient colors={['rgba(0,166,106,0.15)', 'rgba(14,165,233,0.12)']} style={styles.logoBgLight}>
                <ImageBackground
                  source={{ uri: CRICKET_HERO_IMAGE }}
                  style={styles.cricketBall}
                  imageStyle={styles.cricketBallImage}
                >
                  <View style={styles.cricketBallOverlay}>
                    <Text style={styles.cricketIcon}>🏏</Text>
                  </View>
                </ImageBackground>
              </LinearGradient>
            </View>

            <Text style={styles.appName}>
              GAME<Text style={styles.appNameGreen}>LENS</Text>
            </Text>

            {/* Card */}
            <View style={styles.card}>
              <Text style={styles.loginTitle}>Welcome back 👋</Text>
              <Text style={styles.loginSubtitle}>Sign in to continue</Text>

              <View style={[styles.inputWrap, userFocus && styles.inputWrapFocused]}>
                <Ionicons name="person-outline" size={18} color={userFocus ? '#00A66A' : '#94A3B8'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#94A3B8"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  onFocus={() => setUserFocus(true)}
                  onBlur={() => setUserFocus(false)}
                />
              </View>

              <View style={[styles.inputWrap, passFocus && styles.inputWrapFocused]}>
                <Ionicons name="lock-closed-outline" size={18} color={passFocus ? '#00A66A' : '#94A3B8'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPassFocus(true)}
                  onBlur={() => setPassFocus(false)}
                />
              </View>

              <TouchableOpacity style={styles.forgotPassword} onPress={() => console.log('Forgot password clicked')}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginButton, loginPressed && styles.loginButtonPressed]}
                onPress={handleLogin}
                onPressIn={() => setLoginPressed(true)}
                onPressOut={() => setLoginPressed(false)}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={['#00C47A', '#00A66A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.loginButtonGrad}
                >
                  <Text style={styles.loginButtonText}>Log In</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>or sign in with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialContainer}>
                {(['G', 'f'] as const).map((label, i) => (
                  <TouchableOpacity key={i} style={styles.socialButton} activeOpacity={0.75}
                    onPress={() => console.log(`${label} login clicked`)}>
                    <Text style={styles.socialIcon}>{label}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.socialButton} activeOpacity={0.75}
                  onPress={() => console.log('Twitter login clicked')}>
                  <Ionicons name="logo-twitter" size={22} color="#0EA5E9" />
                </TouchableOpacity>
              </View>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>{"Don't have an account? "}</Text>
                <TouchableOpacity onPress={() => switchScreen('signup')}>
                  <Text style={styles.signupLink}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Signup ──
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.authContent, { opacity: screenOpacity, transform: [{ translateY: screenY }] }]}>

          <View style={styles.heroBanner}>
            <ImageBackground
              source={{ uri: CRICKET_GEAR_IMAGE }}
              style={styles.illustrationCard}
              imageStyle={styles.illustrationImage}
            >
              <View style={styles.illustrationOverlay}>
                <Ionicons name="person-add" size={28} color="#FFF" />
              </View>
            </ImageBackground>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>NEW MATCHDAY ACCOUNT</Text>
              <Text style={styles.heroText}>Create your cricket profile and get started.</Text>
            </View>
          </View>

          <Text style={styles.appName}>
            GAME<Text style={styles.appNameGreen}>LENS</Text>
          </Text>

          <View style={styles.card}>
            <Text style={styles.signupTitle}>Create Account</Text>
            <Text style={styles.loginSubtitle}>Join the cricket community</Text>

            {[
              { placeholder: 'Full Name', value: fullName, setter: setFullName, icon: 'person-outline', secure: false, type: 'default' },
              { placeholder: 'Email', value: email, setter: setEmail, icon: 'mail-outline', secure: false, type: 'email-address' },
              { placeholder: 'Password', value: signupPassword, setter: setSignupPassword, icon: 'lock-closed-outline', secure: true, type: 'default' },
              { placeholder: 'Confirm Password', value: confirmPassword, setter: setConfirmPassword, icon: 'shield-checkmark-outline', secure: true, type: 'default' },
            ].map((field, i) => (
              <View key={i} style={styles.inputWrap}>
                <Ionicons name={field.icon as any} size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor="#94A3B8"
                  value={field.value}
                  onChangeText={field.setter}
                  secureTextEntry={field.secure}
                  autoCapitalize={field.secure || field.type === 'email-address' ? 'none' : 'words'}
                  keyboardType={field.type as any}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.loginButton} onPress={handleSignup} activeOpacity={0.88}>
              <LinearGradient
                colors={['#00C47A', '#00A66A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginButtonGrad}
              >
                <Text style={styles.loginButtonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => switchScreen('login')}>
                <Text style={styles.signupLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F0F7F4',
  },
  authScrollView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F0F7F4',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: SCREEN_WIDTH,
    backgroundColor: '#F0F7F4',
    paddingVertical: 32,
  },
  authContent: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 2,
  },
  logoBgLight: {
    borderRadius: 30,
    padding: 3,
    shadowColor: '#00A66A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 12,
  },
  cricketBall: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cricketBallImage: {
    borderRadius: 28,
  },
  cricketBallOverlay: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 118, 110, 0.22)',
  },
  cricketIcon: {
    fontSize: 44,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 3,
    marginBottom: 8,
    textShadowColor: 'rgba(0,166,106,0.12)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  appNameGreen: {
    color: '#00A66A',
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,166,106,0.1)',
  },
  loginTitle: {
    fontSize: 24,
    color: '#0F172A',
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 24,
  },

  // Inputs
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2EAE6',
    marginBottom: 14,
    paddingHorizontal: 14,
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWrapFocused: {
    borderColor: '#00A66A',
    backgroundColor: '#F0FFF8',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    paddingVertical: 2,
  },
  forgotPasswordText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },

  // Login Button
  loginButton: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#00A66A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 24,
  },
  loginButtonPressed: {
    shadowOpacity: 0.15,
    transform: [{ scale: 0.98 }],
  },
  loginButtonGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    gap: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2EAE6',
  },
  orText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },

  // Social
  socialContainer: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
    justifyContent: 'center',
  },
  socialButton: {
    width: 54,
    height: 54,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2EAE6',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  socialIcon: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2563EB',
  },

  // Signup row
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  signupLink: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '800',
  },

  // Signup
  heroBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D8E7E2',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 4,
  },
  illustrationCard: {
    width: 80,
    height: 80,
    borderRadius: 18,
    backgroundColor: '#E0F7EF',
    overflow: 'hidden',
  },
  illustrationImage: {
    borderRadius: 18,
  },
  illustrationOverlay: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.28)',
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#2563EB',
  },
  heroText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  signupTitle: {
    fontSize: 24,
    color: '#0F172A',
    fontWeight: '800',
    marginBottom: 4,
  },
});
