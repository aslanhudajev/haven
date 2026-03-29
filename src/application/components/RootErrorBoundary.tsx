import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Colors, Spacing } from '@shared/lib/theme';
import { Button } from '@shared/ui';

type Props = { children: ReactNode };

type State = { hasError: boolean; message: string };

export class RootErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('RootErrorBoundary', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback message={this.state.message} onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ message, onReset }: { message: string; onReset: () => void }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Something went wrong</Text>
      <Text style={[styles.body, { color: theme.textSecondary }]}>{message}</Text>
      <Button title="Try again" onPress={onReset} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
  },
});
