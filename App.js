import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { supabase } from './src/config/supabase';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import HomeScreen from './src/screens/home/HomeScreen';
import AnimalScreen from './src/screens/animals/AnimalScreen';
import AnimalDetailScreen from './src/screens/animals/AnimalDetailScreen';
import ShelterScreen from './src/screens/shelters/ShelterScreen';
import ShelterDetailScreen from './src/screens/shelters/ShelterDetailScreen';

import { FavoritesProvider } from './src/context/FavoritesContext';

import FavoritesScreen from './src/screens/favorites/FavoritesScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import AboutScreen from './src/screens/profile/AboutScreen';
import HelpSupportScreen from './src/screens/profile/HelpSupportScreen';
import AdoptionFormScreen from './src/screens/animals/AdoptionFormScreen';
import AdoptionRequestsScreen from './src/screens/animals/AdoptionRequestsScreen';
import UploadPetScreen from './src/screens/animals/UploadPetScreen';
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import AdminSheltersScreen from './src/screens/admin/AdminSheltersScreen';
import AdminAdoptionsScreen from './src/screens/admin/AdminAdoptionsScreen';
import AdminUsersScreen from './src/screens/admin/AdminUsersScreen';

// ===============================
// CONFIGURATION
// ===============================

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const COLORS = {
  primary: '#111111',
  accent: '#FF6268',
  background: '#FFFFFF',
  secondary: '#F5F5F5',
  text: '#222222',
  gray: '#999999',
  border: '#EEEEEE',
};

const DOG_IMAGE =
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=900';

// ===============================
// REUSABLE COMPONENTS
// ===============================

function Logo() {
  return (
    <View style={styles.logoContainer}>
      <Ionicons
        name="paw"
        size={27}
        color={COLORS.accent}
      />
      <Text style={styles.logoText}>PetPal</Text>
    </View>
  );
}

function PrimaryButton({ title, onPress, loading = false }) {
  return (
    <TouchableOpacity
      style={[
        styles.primaryButton,
        loading && { opacity: 0.7 },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.primaryButtonText}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  rightIcon,
  onRightPress,
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#AAAAAA"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType || 'default'}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {rightIcon && (
          <TouchableOpacity onPress={onRightPress}>
            <Ionicons
              name={rightIcon}
              size={21}
              color={COLORS.gray}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ===============================
// 1. ONBOARDING SCREEN
// ===============================

function OnboardingScreen({ navigation }) {
  return (
    <View style={styles.onboardingContainer}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.onboardingHeader}>
        <Logo />

        <View style={styles.pawCircle}>
          <Ionicons
            name="paw"
            size={24}
            color={COLORS.accent}
          />
        </View>
      </View>

      <View style={styles.dogImageContainer}>
        <Image
          source={{ uri: DOG_IMAGE }}
          style={styles.dogImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.onboardingContent}>
        <Text style={styles.onboardingTitle}>
          Don't say adoption.{"\n"}
          Make new friend.
        </Text>

        <Text style={styles.onboardingDescription}>
          Find your perfect companion and give
          a lovely pet a forever home.
        </Text>

        <PrimaryButton
          title="Get Started"
          onPress={() => navigation.navigate('Login')}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.registerLink}
        >
          <Text style={styles.linkText}>
            New to PetPal?{' '}
            <Text style={styles.accentText}>
              Create Account
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ===============================
// 2. LOGIN SCREEN
// ===============================

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  if (!email.trim() || !password) {
    setError('Email dan password wajib diisi.');
    return;
  }

  try {
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      console.error('Login Error:', error.message);
      setError(error.message);
      return;
    }
  } catch (error) {
    console.error('Login Error:', error);
    setError('Terjadi kesalahan saat login.');
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.authContainer}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={COLORS.primary}
          />
        </TouchableOpacity>

        <Logo />

        <View style={styles.authHeading}>
          <Text style={styles.authTitle}>
            Welcome Back!
          </Text>

          <Text style={styles.authDescription}>
            Login to find your new best friend.
          </Text>
        </View>

        <FormInput
          label="Email Address"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <FormInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
          onRightPress={() => setShowPassword(!showPassword)}
        />

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.accentText}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <PrimaryButton
          title="Login"
          onPress={handleLogin}
          loading={loading}
        />

        <View style={styles.bottomLink}>
          <Text style={styles.normalText}>
            Don't have an account?{' '}
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={styles.accentText}>
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ===============================
// 3. REGISTER SCREEN
// ===============================

function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
  if (!name.trim() || !email.trim() || !password || !confirmPassword) {
    setError('Semua kolom wajib diisi.');
    return;
  }

  if (password.length < 6) {
    setError('Password minimal 6 karakter.');
    return;
  }

  if (password !== confirmPassword) {
    setError('Konfirmasi password tidak cocok.');
    return;
  }

  try {
    setError('');

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: name.trim(),
        },
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    // Pastikan sesi hasil registrasi tidak membuat user masuk otomatis
    if (data.session) {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }
    }

    Alert.alert(
      'Registrasi Berhasil!',
      'Akun kamu berhasil dibuat. Silakan login menggunakan email dan password yang sudah didaftarkan.',
      [
        {
          text: 'Login Sekarang',
          onPress: () => navigation.replace('Login'),
        },
      ]
    );

  } catch (error) {
    console.error('Register Error:', error);
    setError(error.message || 'Registrasi gagal. Silakan coba lagi.');
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.authContainer}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={COLORS.primary}
          />
        </TouchableOpacity>

        <Logo />

        <View style={styles.authHeading}>
          <Text style={styles.authTitle}>
            Create Account
          </Text>

          <Text style={styles.authDescription}>
            Join PetPal and find your new friend.
          </Text>
        </View>

        <FormInput
          label="Full Name"
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
        />

        <FormInput
          label="Email Address"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <FormInput
          label="Password"
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
          onRightPress={() => setShowPassword(!showPassword)}
        />

        <FormInput
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
        />

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <PrimaryButton
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
        />

        <View style={styles.bottomLink}>
          <Text style={styles.normalText}>
            Already have an account?{' '}
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.accentText}>
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ===============================
// 4. BOTTOM NAVIGATION
// ===============================

function MainTabs() {
  const icons = {
    Home: 'home',
    Animals: 'paw',
    Shelters: 'storefront',
    Favorites: 'heart',
    Profile: 'person',
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: '#AAAAAA',
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: 3,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Profile') {
            return (
              <MaterialCommunityIcons
                name="account-outline"
                color={color}
                size={size}
              />
            );
          }

          return (
            <Ionicons
              name={icons[route.name]}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />

      <Tab.Screen
        name="Animals"
        component={AnimalScreen}
        options={{ tabBarLabel: 'Animals' }}
      />

      <Tab.Screen name="Shelters" component={ShelterScreen} />

      <Tab.Screen name="Favorites" component={FavoritesScreen} />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// ===============================
// 5. AUTHENTICATED NAVIGATION
// ===============================

function AuthenticatedStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="Main"
        component={MainTabs}
      />

      <Stack.Screen
        name="AnimalDetail"
        component={AnimalDetailScreen}
      />

      <Stack.Screen
        name="ShelterDetail"
        component={ShelterDetailScreen}
      />

      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerShown: true,
          title: 'About PetPal',
          headerTitleAlign: 'center',
          headerTintColor: '#FF6268',
        }}
      />

      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{
          headerShown: true,
          title: 'Help & Support',
          headerTitleAlign: 'center',
          headerTintColor: '#FF6268',
        }}
      />

      <Stack.Screen
        name="AdoptionForm"
        component={AdoptionFormScreen}
      />

      <Stack.Screen
        name="AdoptionRequests"
        component={AdoptionRequestsScreen}
      />

      <Stack.Screen
        name="UploadPet"
        component={UploadPetScreen}
      />
    </Stack.Navigator>
  );
}

  function AdminStack() {
    return (
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
        />

        <Stack.Screen
          name="AdminShelters"
          component={AdminSheltersScreen}
        />
        <Stack.Screen
          name="AdminAdoptions"
          component={AdminAdoptionsScreen}
        />
        <Stack.Screen
          name="AdminUsers"
          component={AdminUsersScreen}
        />
      </Stack.Navigator>
    );
  }

// ===============================
// 6. PUBLIC NAVIGATION
// ===============================

function PublicStack() {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />
    </Stack.Navigator>
  );
}

// ===============================
// 7. ROOT NAVIGATION
// ===============================

function AppNavigatorContent() {
  const { user, role, loading } = useAuth();

  console.log('========== PETPAL NAVIGATION ==========');
  console.log('USER EMAIL:', user?.email);
  console.log('USER ID:', user?.id);
  console.log('USER ROLE:', role);
  console.log('LOADING:', loading);
  console.log('=======================================');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />

        <Ionicons
          name="paw"
          size={45}
          color={COLORS.accent}
        />

        <Text style={styles.loadingTitle}>
          PetPal
        </Text>

        <ActivityIndicator
          size="large"
          color={COLORS.accent}
          style={{ marginTop: 18 }}
        />

        <Text style={styles.loadingDescription}>
          Checking your account...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <PublicStack key="public" />
      ) : role === 'admin' ? (
        <AdminStack key="admin" />
      ) : (
        <AuthenticatedStack key="authenticated" />
      )}
    </NavigationContainer>
  );
}

// ===============================
// APP ENTRY
// ===============================

export default function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <AppNavigatorContent />
      </FavoritesProvider>
    </AuthProvider>
  );
}

// ===============================
// STYLES
// ===============================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  onboardingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 55,
  },

  onboardingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 15,
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  logoText: {
    fontSize: 23,
    fontWeight: '800',
    color: COLORS.primary,
  },

  pawCircle: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.secondary,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dogImageContainer: {
    height: '43%',
    marginHorizontal: 20,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: COLORS.secondary,
  },

  dogImage: {
    width: '100%',
    height: '100%',
  },

  onboardingContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    alignItems: 'center',
  },

  onboardingTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 12,
  },

  onboardingDescription: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
    paddingHorizontal: 10,
  },

  primaryButton: {
    width: '100%',
    height: 55,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryButtonText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '700',
  },

  registerLink: {
    marginTop: 18,
  },

  linkText: {
    color: COLORS.gray,
    fontSize: 13,
  },

  authContainer: {
    flexGrow: 1,
    paddingHorizontal: 27,
    paddingTop: 55,
    paddingBottom: 35,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },

  authHeading: {
    marginTop: 40,
    marginBottom: 30,
  },

  authTitle: {
    fontSize: 29,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 9,
  },

  authDescription: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 20,
  },

  inputGroup: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 9,
  },

  inputWrapper: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    height: '100%',
  },

  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -5,
    marginBottom: 22,
  },

  accentText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '700',
  },

  errorText: {
    color: '#D9363E',
    fontSize: 12,
    marginBottom: 12,
  },

  bottomLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 27,
  },

  normalText: {
    color: COLORS.gray,
    fontSize: 13,
  },

  tabBar: {
    backgroundColor: COLORS.primary,
    borderTopWidth: 0,
    height: 65,
    paddingTop: 7,
    paddingBottom: 7,
    elevation: 10,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 10,
  },

  loadingDescription: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 10,
  },
});
