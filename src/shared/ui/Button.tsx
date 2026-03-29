import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  type ViewStyle,
} from 'react-native';
import { Colors } from '@shared/lib/theme';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const bg: Record<ButtonVariant, string> = {
    primary: theme.accent,
    secondary: theme.backgroundElement,
    destructive: '#FF3B30',
    ghost: 'transparent',
  };

  const fg: Record<ButtonVariant, string> = {
    primary: '#fff',
    secondary: theme.text,
    destructive: '#fff',
    ghost: theme.accent,
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg[variant] },
        variant === 'ghost' && styles.ghost,
        (pressed || disabled || loading) && styles.dimmed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={fg[variant]} />
      ) : (
        <Text style={[styles.text, { color: fg[variant] }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  ghost: { height: 44 },
  dimmed: { opacity: 0.6 },
  text: { fontSize: 17, fontWeight: '600' },
});
