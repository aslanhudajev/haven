import { useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { verifyOtp, requestOtp } from '@entities/auth';
import { Colors } from '@shared/lib/theme';

const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleCodeChange = async (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setCode(cleaned);

    if (cleaned.length === OTP_LENGTH) {
      setVerifying(true);
      try {
        await verifyOtp(email!, cleaned);
      } catch (err: any) {
        Alert.alert('Invalid code', err.message ?? 'Please try again');
        setCode('');
        inputRef.current?.focus();
      } finally {
        setVerifying(false);
      }
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await requestOtp(email!);
      Alert.alert('Code sent', 'Check your email for a new code');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.content, { paddingTop: insets.top + 64 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: theme.accent }]}>← Back</Text>
        </Pressable>

        <Text style={[styles.title, { color: theme.text }]}>Check your email</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={{ color: theme.text, fontWeight: '600' }}>{email}</Text>
        </Text>

        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.backgroundElement,
              borderColor: theme.backgroundElement,
            },
          ]}
          placeholder="000000"
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          value={code}
          onChangeText={handleCodeChange}
          editable={!verifying}
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
        />

        {verifying && (
          <ActivityIndicator style={styles.spinner} color={theme.accent} />
        )}

        <Pressable
          style={({ pressed }) => [styles.resendButton, pressed && styles.resendPressed]}
          onPress={handleResend}
          disabled={resending}
        >
          <Text style={[styles.resendText, { color: theme.textSecondary }]}>
            {resending ? 'Sending…' : 'Resend code'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24 },
  backButton: { marginBottom: 24 },
  backText: { fontSize: 17, fontWeight: '500' },
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 17, lineHeight: 26, marginBottom: 32 },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 12,
    textAlign: 'center',
    borderWidth: 1,
  },
  spinner: { marginTop: 16 },
  resendButton: { marginTop: 24, alignItems: 'center', paddingVertical: 12 },
  resendPressed: { opacity: 0.5 },
  resendText: { fontSize: 15 },
});
