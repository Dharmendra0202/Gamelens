import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CRICKET_HERO_IMAGE = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=900&h=900&fit=crop';
const CRICKET_GEAR_IMAGE = 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&h=500&fit=crop';

type ScreenType = 'splash' | 'login' | 'signup';

export default function AuthScreen() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  
  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = () => {
    router.replace('/(tabs)/home');
  };

  const handleSignup = () => {
    router.replace('/(tabs)/home');
  };

  // Splash Screen
  if (currentScreen === 'splash') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <ImageBackground
              source={{ uri: CRICKET_HERO_IMAGE }}
              style={styles.cricketBall}
              imageStyle={styles.cricketBallImage}
            >
              <View style={styles.cricketBallOverlay}>
                <Text style={styles.cricketIcon}>🏏</Text>
              </View>
            </ImageBackground>
          </View>
          <Text style={styles.appName}>
            GAME<Text style={styles.appNamePurple}>LENS</Text>
          </Text>
          
          <TouchableOpacity 
            style={styles.continueButtonWrapper} 
            onPress={() => setCurrentScreen('login')}
          >
            <LinearGradient
              colors={['#00B894', '#0EA5E9', '#2563EB']}
              start={{ x: 0.48, y: 0.07 }}
              end={{ x: 0.21, y: 0.85 }}
              style={styles.continueButton}
            >
              <Text style={styles.continueText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Login Screen
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
          <View style={styles.authContent}>
            <View style={styles.logoContainer}>
              <ImageBackground
                source={{ uri: CRICKET_HERO_IMAGE }}
                style={styles.cricketBall}
                imageStyle={styles.cricketBallImage}
              >
                <View style={styles.cricketBallOverlay}>
                  <Text style={styles.cricketIcon}>🏏</Text>
                </View>
              </ImageBackground>
            </View>
            
            <Text style={styles.appName}>
              GAME<Text style={styles.appNamePurple}>LENS</Text>
            </Text>
            
            <Text style={styles.loginTitle}>Login to your Account</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#64748B"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            
            <TouchableOpacity style={styles.forgotPassword} onPress={() => console.log('Forgot password clicked')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>
            
            <Text style={styles.orText}>Or sign in with</Text>
            
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton} onPress={() => console.log('Google login clicked')}>
                <Text style={styles.socialIcon}>G</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} onPress={() => console.log('Facebook login clicked')}>
                <Text style={styles.socialIcon}>f</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} onPress={() => console.log('Twitter login clicked')}>
                <Ionicons name="logo-twitter" size={24} color="#0EA5E9" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>{"Don't have an account? "}</Text>
              <TouchableOpacity onPress={() => setCurrentScreen('signup')}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Signup Screen
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.authContent}>
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
            GAME<Text style={styles.appNamePurple}>LENS</Text>
          </Text>

          <Text style={styles.signupTitle}>Sign up</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#64748B"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#64748B"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={signupPassword}
            onChangeText={setSignupPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => setCurrentScreen('login')}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setCurrentScreen('login')}
          >
            <Ionicons name="arrow-back" size={16} color="#2563EB" />
            <Text style={styles.backButtonText}>Back to login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F4FAF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authScrollView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F4FAF8',
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
    width: '100%',
    paddingHorizontal: 26,
  },
  authContent: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: SCREEN_WIDTH,
    backgroundColor: '#F4FAF8',
    paddingTop: 24,
    paddingBottom: 24,
  },
  logoContainer: {
    marginBottom: 16,
  },
  cricketBall: {
    width: Math.min(SCREEN_WIDTH * 0.31, 118),
    height: Math.min(SCREEN_WIDTH * 0.31, 118),
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DDF7EC',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  cricketBallImage: {
    borderRadius: 30,
  },
  cricketBallOverlay: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 118, 110, 0.22)',
  },
  cricketIcon: {
    fontSize: 42,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 2.4,
    marginBottom: 24,
    textShadowColor: 'rgba(14, 165, 233, 0.12)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 14,
  },
  appNamePurple: {
    color: '#00A66A',
  },
  continueButtonWrapper: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 12,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    paddingHorizontal: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
    gap: 10,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  loginTitle: {
    width: '100%',
    fontSize: 26,
    color: '#0F172A',
    marginBottom: 20,
    fontWeight: '800',
    letterSpacing: 0.1,
    textAlign: 'left',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D8E7E2',
    color: '#0F172A',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 22,
    paddingVertical: 2,
  },
  forgotPasswordText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#00A66A',
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: '#00A66A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.26,
    shadowRadius: 22,
    elevation: 10,
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  orText: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 16,
    fontWeight: '700',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 26,
  },
  socialButton: {
    width: 54,
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8E7E2',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  socialIcon: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2563EB',
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: {
    color: '#475569',
    fontSize: 14,
  },
  signupLink: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '800',
  },
  heroBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D8E7E2',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 4,
  },
  illustrationCard: {
    width: 82,
    height: 82,
    borderRadius: 18,
    backgroundColor: '#E0F7EF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
    backgroundColor: 'rgba(14, 165, 233, 0.24)',
  },
  pitch: {
    width: 34,
    height: 62,
    borderRadius: 16,
    backgroundColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  wicketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  stump: {
    width: 3,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#B91C1C',
  },
  pitchLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginVertical: 2,
  },
  ball: {
    position: 'absolute',
    top: 18,
    right: 12,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#B91C1C',
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#2563EB',
  },
  heroText: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '800',
    color: '#0F172A',
  },
  signupTitle: {
    width: '100%',
    fontSize: 25,
    color: '#0F172A',
    marginBottom: 14,
    fontWeight: '800',
  },
  signupButton: {
    width: '100%',
    backgroundColor: '#00A66A',
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: '#00A66A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.26,
    shadowRadius: 22,
    elevation: 10,
    marginTop: 6,
    marginBottom: 22,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  loginText: {
    color: '#475569',
    fontSize: 14,
  },
  loginLink: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '800',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '800',
  },
});
