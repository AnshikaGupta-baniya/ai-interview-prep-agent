import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { Colors } from '../../constants/theme';

interface ErrorBoundaryState {
  hasError: boolean;
  error: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: '',
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): ErrorBoundaryState {
    return {
      hasError: true,
      error: error.message,
    };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: '',
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>

          <Text style={styles.title}>
            Something went wrong
          </Text>

          <Text style={styles.message}>
            {this.state.error}
          </Text>

          <TouchableOpacity
            style={styles.btn}
            onPress={this.handleRetry}
          >
            <Text style={styles.btnText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },

  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 8,
  },

  message: {
    fontSize: 13,
    color: Colors.dark.text2,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  btn: {
    backgroundColor: Colors.indigo.DEFAULT,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },

  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});