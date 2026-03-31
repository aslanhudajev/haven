import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors, Motion, Radii, fontFamily } from '@shared/lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bg: Record<ButtonVariant, string> = {
    primary: theme.accent,
    secondary: theme.surface2,
    destructive: theme.danger,
    ghost: 'transparent',
  };

  const fg: Record<ButtonVariant, string> = {
    primary: '#fff',
    secondary: theme.text,
    destructive: '#fff',
    ghost: theme.accent,
  };

  const borderForGhost =
    variant === 'ghost'
      ? { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.borderSubtle }
      : {};

  return (
    <AnimatedPressable
      style={[animatedStyle]}
      onPressIn={() => {
        if (!disabled && !loading)
          scale.value = withSpring(Motion.pressScale, Motion.springDefault);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, Motion.springDefault);
      }}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          styles.base,
          { backgroundColor: bg[variant] },
          borderForGhost,
          variant === 'ghost' && styles.ghost,
          (disabled || loading) && styles.dimmed,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={fg[variant]} />
        ) : (
          <Text style={[styles.text, { color: fg[variant], fontFamily: fontFamily.bodySemiBold }]}>
            {title}
          </Text>
        )}
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  ghost: { height: 44 },
  dimmed: { opacity: 0.55 },
  text: { fontSize: 17 },
});
