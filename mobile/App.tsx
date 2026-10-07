import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WebView, WebViewNavigation } from 'react-native-webview';

const RUMR_LIVE_URL = 'https://rumr-sigma.vercel.app';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Intercept Android hardware back button
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true; // Prevent exiting the app
      }
      return false; // Exit app
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => subscription.remove();
  }, [canGoBack]);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="light" backgroundColor="#070707" />

        {/* Offline / Error Fallback Screen */}
        {hasError ? (
          <View style={styles.errorContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>RUMR</Text>
            </View>
            <Text style={styles.errorTitle}>CONNECTION INTERRUPTED</Text>
            <Text style={styles.errorDescription}>
              Unable to reach the Rumr mesh network. Check your device connectivity and retry.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              activeOpacity={0.8}
              onPress={handleRetry}
            >
              <Text style={styles.retryButtonText}>RECONNECT MESH</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.webviewContainer}>
            <WebView
              ref={webViewRef}
              source={{ uri: RUMR_LIVE_URL }}
              style={styles.webview}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              geolocationEnabled={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              allowFileAccess={true}
              cacheEnabled={true}
              pullToRefreshEnabled={true}
              onNavigationStateChange={handleNavigationStateChange}
              onLoadStart={() => setHasError(false)}
              onLoadEnd={() => setIsLoading(false)}
              onError={() => {
                setHasError(true);
                setIsLoading(false);
              }}
              onHttpError={(syntheticEvent) => {
                const { statusCode } = syntheticEvent.nativeEvent;
                if (statusCode >= 500) {
                  setHasError(true);
                }
              }}
              // Custom UserAgent flag for client detection if needed
              applicationNameForUserAgent="RumrExpoClient/1.0"
            />

            {/* Initial Loading Overlay */}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <View style={styles.logoBadge}>
                  <Text style={styles.logoText}>RUMR</Text>
                </View>
                <ActivityIndicator size="large" color="#ccff00" style={styles.spinner} />
                <Text style={styles.loadingText}>CONNECTING TO MESH...</Text>
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070707',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#070707',
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#070707',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#070707',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  logoBadge: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#262626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  logoText: {
    color: '#ccff00',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
  },
  spinner: {
    marginVertical: 14,
  },
  loadingText: {
    color: '#a3a3a3',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#070707',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 8,
    marginBottom: 8,
  },
  errorDescription: {
    color: '#737373',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  retryButton: {
    backgroundColor: '#ccff00',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#070707',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1.5,
  },
});
