import { StyleSheet, Text, TextInput, View, useColorScheme, type TextInputProps } from 'react-native';
import { forwardRef } from 'react';
import { Colors } from '@shared/lib/theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<TextInput, Props>(
  ({ label, error, style, ...rest }, ref) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    return (
      <View style={styles.wrapper}>
        {label && <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.backgroundElement,
              borderColor: error ? '#FF3B30' : theme.backgroundElement,
            },
            style,
          ]}
          placeholderTextColor={theme.textSecondary}
          {...rest}
        />
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  },
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', textTransform: 'uppercase', marginBottom: 6, marginLeft: 4 },
  input: { height: 52, borderRadius: 12, paddingHorizontal: 16, fontSize: 17, borderWidth: 1 },
  error: { color: '#FF3B30', fontSize: 13, marginTop: 4, marginLeft: 4 },
});
