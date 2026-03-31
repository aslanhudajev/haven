import { StyleSheet, View, useColorScheme, type ViewProps, type ViewStyle } from 'react-native';
import { Colors, Radii, cardElevation } from '@shared/lib/theme';

export type CardVariant = 'elevated' | 'inset' | 'outline';

type Props = ViewProps & {
  style?: ViewStyle;
  variant?: CardVariant;
};

export function Card({ children, style, variant = 'elevated', ...rest }: Props) {
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const theme = Colors[scheme];

  const base: ViewStyle[] = [styles.base, { borderRadius: Radii.lg }];

  if (variant === 'elevated') {
    base.push({ backgroundColor: theme.surface1 }, cardElevation(scheme));
  } else if (variant === 'inset') {
    base.push({
      backgroundColor: theme.surface2,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.borderSubtle,
    });
  } else {
    base.push({
      backgroundColor: 'transparent',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.borderSubtle,
    });
  }

  return (
    <View style={[...base, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { padding: 16 },
});
