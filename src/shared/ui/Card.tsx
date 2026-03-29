import { StyleSheet, View, useColorScheme, type ViewStyle, type ViewProps } from 'react-native';
import { Colors } from '@shared/lib/theme';

type Props = ViewProps & {
  style?: ViewStyle;
};

export function Card({ children, style, ...rest }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16 },
});
