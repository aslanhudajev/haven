import { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
  type TextInputProps,
} from 'react-native';
import { Colors, Radii, fontFamily } from '@shared/lib/theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<TextInput, Props>(({ label, error, style, ...rest }, ref) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text
          style={[styles.label, { color: theme.textSecondary, fontFamily: fontFamily.bodyMedium }]}
        >
          {label}
        </Text>
      )}
      <TextInput
        ref={ref}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.surface1,
            borderColor: error ? theme.danger : theme.borderSubtle,
            fontFamily: fontFamily.body,
          },
          style,
        ]}
        placeholderTextColor={theme.textMuted}
        {...rest}
      />
      {error && (
        <Text style={[styles.error, { color: theme.danger, fontFamily: fontFamily.body }]}>
          {error}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    height: 52,
    borderRadius: Radii.md,
    paddingHorizontal: 16,
    fontSize: 17,
    borderWidth: 1,
  },
  error: { fontSize: 13, marginTop: 4, marginLeft: 4 },
});
