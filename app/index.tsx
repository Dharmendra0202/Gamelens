import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  ImageBackground,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CRICKET_HERO_IMAGE = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=900&h=900&fit=crop';
const CRICKET_GEAR_IMAGE = 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&h=500&fit=crop';

type ScreenType = 'splash' | 'login' | 'signup';
type SignupMethod = 'email' | 'mobile' | 'whatsapp';

export default function AuthScreen() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  const [signupMethod, setSignupMethod] = useState<SignupMethod>('email');
  
  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Signup state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    router.replace('/(tabs)/home');
  };

  const handleSignup = () => {
    // WhatsApp Direct Authentication - No validation needed, just redirect
    if (signupMethod === 'whatsapp') {
      // Generate unique session ID for this signup attempt
      const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      
      // In production, this would be your backend verification endpoint
      // For now, we'll use a WhatsApp Business API link or direct chat
      const verificationNumber = '919876543210'; // Replace with your WhatsApp Business number
      const message = `SIGNUP:${sessionId}`;
      
      // Direct WhatsApp link - opens WhatsApp immediately
      const whatsappUrl = `whatsapp://send?phone=${verificationNumber}&text=${encodeURIComponent(message)}`;
      
      // Immediately open WhatsApp
      Linking.openURL(whatsappUrl)
        .then(() => {
          console.log('Redirected to WhatsApp for authentication');
          // In production, your backend would listen for the WhatsApp message
          // and create the account, then redirect back to the app
          
          // For demo: Auto-login after 3 seconds (simulating backend processing)
          setTimeout(() => {
            router.replace('/(tabs)/home');
          }, 3000);
        })
        .catch(err => {
          console.error('WhatsApp not available:', err);
          Alert.alert(
            'WhatsApp Required',
            'Please install WhatsApp to use this signup method.',
            [
              { text: 'Use Email', onPress: () => setSignupMethod('email') },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        });
      
      return;
    }

    // Validation for Email/Mobile methods
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (signupMethod === 'email' && !email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (signupMethod === 'mobile' && !mobileNumber.trim()) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    if (mobileNumber && mobileNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!signupPassword.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (signupPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (signupPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Regular signup for email/mobile
    Alert.alert(
      'Success!',
      `Welcome to CrickBuz, ${fullName}!\n\nYour account has been created successfully.`,
      [
        {
          text: 'Get Started',
          onPress: () => {
            console.log('Signup completed:', {
              fullName,
              email: signupMethod === 'email' ? email : null,
              mobile: signupMethod === 'mobile' ? countryCode + mobileNumber : null,
              method: signupMethod
            });
            router.replace('/(tabs)/home');
          }
        }
      ]
    );
  };

  // Splash Screen
  if (currentScreen === 'splash') {
    return (
      <View style={styles.container}>
        <View style={styles.topLeftCorner} />
        
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
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>
          
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
          
          <View style={styles.signupPromptContainer}>
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
    <View style={styles.container}>
      <View style={styles.signupContainer}>
        {/* Header */}
        <View style={styles.signupHeader}>
          <Text style={styles.appNameSignup}>
            CRICK<Text style={styles.appNamePurple}>BUZ</Text>
          </Text>
          <Text style={styles.signupSubtitle}>Create Account</Text>
        </View>

        {/* Method Tabs */}
        <View style={styles.methodTabs}>
          <TouchableOpacity
            style={[styles.methodTab, signupMethod === 'email' && styles.methodTabActive]}
            onPress={() => setSignupMethod('email')}
          >
            <Ionicons name="mail" size={18} color={signupMethod === 'email' ? '#FFF' : '#B91C1C'} />
            <Text style={[styles.methodTabText, signupMethod === 'email' && styles.methodTabTextActive]}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.methodTab, signupMethod === 'mobile' && styles.methodTabActive]}
            onPress={() => setSignupMethod('mobile')}
          >
            <Ionicons name="call" size={18} color={signupMethod === 'mobile' ? '#FFF' : '#B91C1C'} />
            <Text style={[styles.methodTabText, signupMethod === 'mobile' && styles.methodTabTextActive]}>Mobile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.methodTab, signupMethod === 'whatsapp' && styles.methodTabActive]}
            onPress={() => setSignupMethod('whatsapp')}
          >
            <Ionicons name="logo-whatsapp" size={18} color={signupMethod === 'whatsapp' ? '#FFF' : '#B91C1C'} />
            <Text style={[styles.methodTabText, signupMethod === 'whatsapp' && styles.methodTabTextActive]}>WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* Form Content */}
        <View style={styles.formContent}>
          {signupMethod === 'whatsapp' ? (
            <View style={styles.whatsappCard}>
              <Ionicons name="logo-whatsapp" size={56} color="#25D366" />
              <Text style={styles.whatsappTitle}>Sign up with WhatsApp</Text>
              <Text style={styles.whatsappDesc}>Tap below to authenticate directly through WhatsApp</Text>
            </View>
          ) : (
            <>
              {/* Full Name */}
              <View style={styles.inputField}>
                <Ionicons name="person" size={20} color="#B91C1C" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              {/* Email or Mobile */}
              {signupMethod === 'email' ? (
                <View style={styles.inputField}>
                  <Ionicons name="mail" size={20} color="#B91C1C" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              ) : (
                <View style={styles.mobileRow}>
                  <TouchableOpacity 
                    style={styles.countryCodeBtn}
                    onPress={() => setShowCountryPicker(!showCountryPicker)}
                  >
                    <Text style={styles.countryCodeText}>{countryCode}</Text>
                    <Ionicons name="chevron-down" size={14} color="#666" />
                  </TouchableOpacity>
                  <View style={[styles.inputField, { flex: 1 }]}>
                    <Ionicons name="call" size={20} color="#B91C1C" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Mobile Number"
                      placeholderTextColor="#999"
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={mobileNumber}
                      onChangeText={setMobileNumber}
                    />
                  </View>
                </View>
              )}

              {/* Password */}
              <View style={styles.inputField}>
                <Ionicons name="lock-closed" size={20} color="#B91C1C" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showSignupPassword}
                  value={signupPassword}
                  onChangeText={setSignupPassword}
                />
                <TouchableOpacity onPress={() => setShowSignupPassword(!showSignupPassword)}>
                  <Ionicons name={showSignupPassword ? "eye-off" : "eye"} size={20} color="#999" />
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputField}>
                <Ionicons name="lock-closed" size={20} color="#B91C1C" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#999" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Country Picker */}
        {showCountryPicker && signupMethod === 'mobile' && (
          <View style={styles.countryPickerOverlay}>
            <View style={styles.countryPickerModal}>
              <View style={styles.countryPickerHeader}>
                <Text style={styles.countryPickerTitle}>Select Country</Text>
                <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.countryList}>
                {[
                  { code: '+91', country: 'India', flag: '🇮🇳' },
                  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
                  { code: '+44', country: 'UK', flag: '🇬🇧' },
                  { code: '+61', country: 'Australia', flag: '🇦🇺' },
                  { code: '+971', country: 'UAE', flag: '🇦🇪' },
                  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
                  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
                  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
                  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.code}
                    style={styles.countryOption}
                    onPress={() => {
                      setCountryCode(item.code);
                      setShowCountryPicker(false);
                    }}
                  >
                    <Text style={styles.countryFlag}>{item.flag}</Text>
                    <Text style={styles.countryName}>{item.country}</Text>
                    <Text style={styles.countryCode}>{item.code}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.signupFooter}>
          <TouchableOpacity style={styles.createButton} onPress={handleSignup} activeOpacity={0.8}>
            <LinearGradient
              colors={['#B91C1C', '#991B1B', '#7F1D1D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.createButtonGradient}
            >
              <Text style={styles.createButtonText}>Create Account</Text>
              {signupMethod === 'whatsapp' && <Ionicons name="logo-whatsapp" size={18} color="#FFF" />}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => setCurrentScreen('login')}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
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
    paddingTop: SCREEN_HEIGHT * 0.02,
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
    overflow: 'hidden',
  },
  cricketBallImage: {
    borderRadius: SCREEN_WIDTH * 0.14,
  },
  cricketBallOverlay: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(127, 29, 29, 0.35)',
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
  passwordContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: SCREEN_HEIGHT * 0.018,
  },
  passwordInput: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: SCREEN_HEIGHT * 0.018,
    paddingHorizontal: SCREEN_WIDTH * 0.06,
    paddingRight: SCREEN_WIDTH * 0.15,
    fontSize: SCREEN_WIDTH * 0.04,
    borderWidth: 2,
    borderColor: '#FCA5A5',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: 5,
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
  signupPromptContainer: {
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

  // ===== NEW FULL-SCREEN SIGNUP STYLES =====
  signupContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 90,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  signupHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appNameSignup: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 2,
  },
  signupSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  methodTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FCA5A5',
    gap: 4,
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  methodTabActive: {
    backgroundColor: '#B91C1C',
  },
  methodTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B91C1C',
  },
  methodTabTextActive: {
    color: '#FFF',
  },
  formContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#FCA5A5',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  mobileRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countryCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 4,
    borderWidth: 2,
    borderColor: '#FCA5A5',
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  whatsappCard: {
    backgroundColor: '#DCFCE7',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#86EFAC',
  },
  whatsappTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginTop: 12,
    marginBottom: 8,
  },
  whatsappDesc: {
    fontSize: 13,
    color: '#15803D',
    textAlign: 'center',
    lineHeight: 19,
  },
  countryPickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  countryPickerModal: {
    width: '85%',
    maxHeight: '60%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  countryPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  countryPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  countryList: {
    maxHeight: 300,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
    gap: 10,
  },
  countryFlag: {
    fontSize: 20,
  },
  countryName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  countryCode: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  signupFooter: {
    gap: 12,
  },
  createButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#B91C1C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 13,
  },
  loginLink: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
});
