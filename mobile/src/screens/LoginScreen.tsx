import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  useColorScheme
} from 'react-native';
import { PhoneCall, Mail, Lock, ArrowRight } from 'lucide-react-native';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const isDark = useColorScheme() === 'dark';

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      await login(res.data.user, res.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  const themeColors = isDark ? colors.slate[950] : colors.slate[50];
  const textColor = isDark ? '#fff' : colors.slate[900];
  const inputBg = isDark ? colors.slate[900] : '#fff';

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: themeColors }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <PhoneCall color="#fff" size={40} />
          </View>
          <Text style={[styles.title, { color: textColor }]}>CallCRM</Text>
          <Text style={styles.subtitle}>Sign in to manage your clients</Text>
        </View>

        <View style={[styles.form, isDark && styles.formDark]}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? colors.slate[300] : colors.slate[700] }]}>
              <Mail size={14} color={isDark ? colors.slate[400] : colors.slate[500]} /> Email Address
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: isDark ? colors.slate[800] : colors.slate[200] }]}
              placeholder="admin21@gmail.com"
              placeholderTextColor={colors.slate[400]}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: isDark ? colors.slate[300] : colors.slate[700] }]}>
              <Lock size={14} color={isDark ? colors.slate[400] : colors.slate[500]} /> Password
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: isDark ? colors.slate[800] : colors.slate[200] }]}
              placeholder="••••••••"
              placeholderTextColor={colors.slate[400]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Sign In</Text>
                <ArrowRight size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.demoText}>
          Demo: <Text style={{ fontWeight: 'bold' }}>admin21@gmail.com / admin123</Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.slate[500],
    marginTop: 4,
  },
  form: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  formDark: {
    backgroundColor: colors.slate[900],
    elevation: 0,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  demoText: {
    textAlign: 'center',
    marginTop: 32,
    color: colors.slate[400],
    fontSize: 14,
  }
});

export default LoginScreen;
