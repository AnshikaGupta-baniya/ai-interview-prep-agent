import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { Colors } from '../constants/theme';

type Mode = 'welcome' | 'login' | 'register';

export default function AuthScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { theme } = useThemeStore();

  const isDark = theme === 'dark';
  const c = isDark ? Colors.dark : Colors.light;

  const [mode, setMode] = useState<Mode>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      // Generate a unique user ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await setUser({ id: userId, name: name.trim(), email: email.trim() });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      // For MVP — restore from local storage
      const userId = `user_${email.trim().replace(/[^a-z0-9]/gi, '_')}`;
      await setUser({
        id: userId,
        name: email.split('@')[0],
        email: email.trim(),
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Welcome screen
  if (mode === 'welcome') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
        <View style={styles.welcomeWrap}>

          {/* Logo area */}
          <View style={styles.logoWrap}>
            <View style={[styles.logoCircle, { backgroundColor: Colors.indigo.DEFAULT }]}>
              <Ionicons name="trending-up-outline" size={40} color="#fff" />
            </View>
            <Text style={[styles.appName, { color: c.text }]}>
              YourNext
            </Text>
            <Text style={[styles.appTagline, { color: c.text2 }]}>
              Practice interviews personalised{'\n'}to your actual resume experience.
            </Text>
          </View>

          {/* Features */}
          {[
            { icon: 'document-text-outline', text: 'Questions from your real resume' },
            { icon: 'mic-outline', text: 'Voice answers with Whisper transcription' },
            { icon: 'bar-chart-outline', text: 'STAR framework scoring + coaching' },
          ].map((f) => (
            <View key={f.text} style={[styles.featureRow, { borderColor: c.border }]}>
              <View style={[styles.featureIcon, {
                backgroundColor: isDark ? Colors.indigo.dim : '#EDE9F8'
              }]}>
                <Ionicons
                  name={f.icon as any}
                  size={18}
                  color={isDark ? Colors.lavender : Colors.indigo.DEFAULT}
                />
              </View>
              <Text style={[styles.featureText, { color: c.text }]}>{f.text}</Text>
            </View>
          ))}

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: Colors.indigo.DEFAULT }]}
            onPress={() => setMode('register')}
          >
            <Text style={styles.primaryBtnText}>Get Started →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, {
              backgroundColor: c.surf2, borderColor: c.border
            }]}
            onPress={() => setMode('login')}
          >
            <Text style={[styles.secondaryBtnText, { color: c.text }]}>
              I already have an account
            </Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    );
  }

  // Register / Login form
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.formWrap}>

          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setMode('welcome')}
          >
            <Ionicons name="arrow-back" size={20} color={c.text2} />
            <Text style={[styles.backText, { color: c.text2 }]}>Back</Text>
          </TouchableOpacity>

          <Text style={[styles.formTitle, { color: c.text }]}>
            {mode === 'register' ? 'Create account' : 'Welcome back'}
          </Text>
          <Text style={[styles.formSub, { color: c.text2 }]}>
            {mode === 'register'
              ? 'Set up your profile to get started'
              : 'Sign in to continue your practice'}
          </Text>

          {/* Name field — register only */}
          {mode === 'register' && (
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: c.text2 }]}>Full name</Text>
              <View style={[styles.inputWrap, {
                backgroundColor: c.surf, borderColor: c.border
              }]}>
                <Ionicons name="person-outline" size={18} color={c.text3} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Anshika Gupta"
                  placeholderTextColor={c.text3}
                  style={[styles.input, { color: c.text }]}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          {/* Email */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: c.text2 }]}>Email</Text>
            <View style={[styles.inputWrap, {
              backgroundColor: c.surf, borderColor: c.border
            }]}>
              <Ionicons name="mail-outline" size={18} color={c.text3} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={c.text3}
                style={[styles.input, { color: c.text }]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: c.text2 }]}>Password</Text>
            <View style={[styles.inputWrap, {
              backgroundColor: c.surf, borderColor: c.border
            }]}>
              <Ionicons name="lock-closed-outline" size={18} color={c.text3} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Min 6 characters"
                placeholderTextColor={c.text3}
                style={[styles.input, { color: c.text }]}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={c.text3}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.primaryBtn, {
              backgroundColor: Colors.terra.DEFAULT, marginTop: 8
            }]}
            onPress={mode === 'register' ? handleRegister : handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {mode === 'register' ? 'Create Account →' : 'Sign In →'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Switch mode */}
          <TouchableOpacity
            style={styles.switchMode}
            onPress={() => setMode(mode === 'register' ? 'login' : 'register')}
          >
            <Text style={[styles.switchModeText, { color: c.text3 }]}>
              {mode === 'register'
                ? 'Already have an account? '
                : "Don't have an account? "}
              <Text style={{ color: Colors.indigo.DEFAULT, fontWeight: '600' }}>
                {mode === 'register' ? 'Sign in' : 'Register'}
              </Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  welcomeWrap: { flex: 1, padding: 24, justifyContent: 'center', gap: 12 },
  logoWrap: { alignItems: 'center', marginBottom: 16 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  appName: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  appTagline: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  featureIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { fontSize: 14, flex: 1, lineHeight: 20 },
  primaryBtn: {
    borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '500' },
  formWrap: { padding: 24, paddingTop: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
  backText: { fontSize: 15 },
  formTitle: { fontSize: 28, fontWeight: '700', marginBottom: 6 },
  formSub: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  switchMode: { alignItems: 'center', marginTop: 20 },
  switchModeText: { fontSize: 14 },
});