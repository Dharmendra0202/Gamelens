import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
        <View style={styles.topLeftCorner} />
        
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.cricketBall}>
              <Text style={styles.cricketIcon}>🏏</Text>
            </View>
          </View>
          <Text style={styles.appName}>
            CRICK<Text style={styles.appNamePurple}>BUZ</Text>
          </Text>
          
          <TouchableOpacity 
            style={styles.continueButtonWrapper} 
            onPress={() => setCurrentScreen('login')}
          >
            <LinearGradient
              colors={['#FEE2E2', '#FCA5A5', '#DC2626', '#991B1B']}
              start={{ x: 0.48, y: 0.07 }}
              end={{ x: 0.21, y: 0.85 }}
              style={styles.continueButton}
            >
              <Text style={styles.continueText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#333333" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <View style={styles.bottomRightCorner} />
      </View>
    );
  }

  // Login Screen
  if (currentScreen === 'login') {
    return (
      <View style={styles.container}>
        <View style={styles.authContent}>
          <View style={styles.logoContainer}>
            <View style={styles.cricketBall}>
              <Text style={styles.cricketIcon}>🏏</Text>
            </View>
          </View>
          
          <Text style={styles.appName}>
            CRICK<Text style={styles.appNamePurple}>BUZ</Text>
          </Text>
          
          <Text style={styles.loginTitle}>Login to your Account</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
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
              <Ionicons name="logo-twitter" size={24} color="#B91C1C" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>{"Don't have an account? "}</Text>
            <TouchableOpacity onPress={() => setCurrentScreen('signup')}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
            <View style={styles.illustrationCard}>
              <View style={styles.pitch}>
                <View style={styles.wicketRow}>
                  <View style={styles.stump} />
                  <View style={styles.stump} />
                  <View style={styles.stump} />
                </View>
                <View style={styles.pitchLine} />
                <View style={styles.wicketRow}>
                  <View style={styles.stump} />
                  <View style={styles.stump} />
                  <View style={styles.stump} />
                </View>
              </View>
              <View style={styles.ball} />
            </View>

            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>NEW MATCHDAY ACCOUNT</Text>
              <Text style={styles.heroText}>Create your cricket profile and get started.</Text>
            </View>
          </View>

          <Text style={styles.appName}>
            CRICK<Text style={styles.appNamePurple}>BUZ</Text>
          </Text>

          <Text style={styles.signupTitle}>Sign up</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={signupPassword}
            onChangeText={setSignupPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
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
            <Ionicons name="arrow-back" size={16} color="#B91C1C" />
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
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topLeftCorner: {
    position: 'absolute',
    top: -SCREEN_HEIGHT * 0.04,
    left: -SCREEN_WIDTH * 0.15,
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.4,
    backgroundColor: '#DC2626',
    borderRadius: SCREEN_WIDTH * 0.2,
    opacity: 0.8,
  },
  bottomRightCorner: {
    position: 'absolute',
    bottom: -SCREEN_HEIGHT * 0.06,
    right: -SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    backgroundColor: '#B91C1C',
    borderRadius: SCREEN_WIDTH * 0.25,
    opacity: 0.7,
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  authContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingTop: SCREEN_HEIGHT * 0.05,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: SCREEN_HEIGHT * 0.03,
    paddingBottom: SCREEN_HEIGHT * 0.02,
  },
  logoContainer: {
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  cricketBall: {
    width: SCREEN_WIDTH * 0.28,
    height: SCREEN_WIDTH * 0.28,
    borderRadius: SCREEN_WIDTH * 0.14,
    backgroundColor: '#B91C1C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FEF2F2',
    shadowColor: '#B91C1C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  cricketIcon: {
    fontSize: SCREEN_WIDTH * 0.14,
  },
  appName: {
    fontSize: SCREEN_WIDTH * 0.11,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 2,
    marginBottom: SCREEN_HEIGHT * 0.03,
    textShadowColor: 'rgba(185, 28, 28, 0.24)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  appNamePurple: {
    color: '#DC2626',
  },
  continueButtonWrapper: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#991B1B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.018,
    paddingHorizontal: SCREEN_WIDTH * 0.1,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FEF2F2',
    gap: 8,
  },
  continueText: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '600',
    color: '#333333',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loginTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.03,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: SCREEN_HEIGHT * 0.018,
    paddingHorizontal: SCREEN_WIDTH * 0.06,
    fontSize: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_HEIGHT * 0.018,
    borderWidth: 2,
    borderColor: '#FCA5A5',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#B91C1C',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#B91C1C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  orText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  socialButton: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FCA5A5',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B91C1C',
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  heroBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
  },
  illustrationCard: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#B91C1C',
  },
  heroText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: '#333333',
  },
  signupTitle: {
    width: '100%',
    fontSize: 18,
    color: '#333',
    marginBottom: 14,
    fontWeight: '600',
  },
  signupButton: {
    width: '100%',
    backgroundColor: '#B91C1C',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#B91C1C',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginTop: 6,
    marginBottom: 22,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: '600',
  },
});
