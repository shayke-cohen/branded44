import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useTheme } from '../../context';

// Direct imports for React Native - will be handled by platform detection later
import { WebView } from 'react-native-webview';
import CookieManager from '@react-native-cookies/cookies';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMember } from '../../context';
import { wixApiClient } from '../../utils/wixApiClient';

interface CheckoutWebViewProps {
  checkoutUrl: string;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const CheckoutWebView: React.FC<CheckoutWebViewProps> = ({
  checkoutUrl,
  onClose,
  onSuccess,
  onError,
}) => {
  // Return early on web platform - web uses iframe interface in CartScreen
  if (Platform.OS === 'web') {
    console.log('⚠️ [CHECKOUT WEBVIEW] Not supported on web platform');
    return null;
  }

  const { theme, isDark } = useTheme();
  const { isLoggedIn, member } = useMember();
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(checkoutUrl);
  const [authReady, setAuthReady] = useState(false);
  const webViewRef = useRef<any>(null);

  console.log('🛒 [CHECKOUT WEBVIEW] Initializing with URL:', checkoutUrl);
  console.log('🛒 [CHECKOUT WEBVIEW] Member authenticated:', { isLoggedIn, memberEmail: member?.email?.address });

  // Setup authentication cookies before loading the WebView
  useEffect(() => {
    const setupAuthentication = async () => {
      try {
        console.log('🍪 [CHECKOUT WEBVIEW] Setting up authentication cookies...');
        
        // Extract domain from checkout URL for cookie setting
        const url = new URL(checkoutUrl);
        const domain = url.hostname;
        
        console.log('🍪 [CHECKOUT WEBVIEW] Setting cookies for domain:', domain);

        // Verify all modules are properly imported
        console.log('🔍 [CHECKOUT WEBVIEW] Module availability check:', {
          CookieManager: typeof CookieManager,
          AsyncStorage: typeof AsyncStorage,
          wixApiClient: typeof wixApiClient,
          platform: Platform.OS
        });

        // Clear existing cookies to ensure clean state
        await CookieManager.clearAll();
        console.log('🍪 [CHECKOUT WEBVIEW] Cleared existing cookies');

        // Get authentication data from the app
        const currentMember = wixApiClient.getCurrentMember();
        const isUserLoggedIn = wixApiClient.isMemberLoggedIn();
        
        console.log('🍪 [CHECKOUT WEBVIEW] Authentication status:', {
          isUserLoggedIn,
          memberId: currentMember?.id,
          memberEmail: currentMember?.email?.address,
        });

        if (isUserLoggedIn && currentMember) {
          // Try to get stored tokens from AsyncStorage
          const [sessionToken, memberTokens, visitorTokens] = await Promise.all([
            AsyncStorage.getItem('wix_session_token'),
            AsyncStorage.getItem('wix_member_tokens'),
            AsyncStorage.getItem('wix_visitor_tokens'),
          ]);

          console.log('🍪 [CHECKOUT WEBVIEW] Available tokens:', {
            hasSessionToken: !!sessionToken,
            hasMemberTokens: !!memberTokens,
            hasVisitorTokens: !!visitorTokens,
          });

          // Set session cookie if we have a session token
          if (sessionToken) {
            const sessionCookie = `wix-session-token=${sessionToken}; Domain=${domain}; Path=/; Secure; HttpOnly`;
            await CookieManager.setFromResponse(checkoutUrl, sessionCookie);
            console.log('✅ [CHECKOUT WEBVIEW] Set session token cookie');
          }

          // Set member authentication cookies
          if (memberTokens) {
            try {
              const tokens = JSON.parse(memberTokens);
              if (tokens.accessToken?.value) {
                const memberCookie = `wix-member-token=${tokens.accessToken.value}; Domain=${domain}; Path=/; Secure`;
                await CookieManager.setFromResponse(checkoutUrl, memberCookie);
                console.log('✅ [CHECKOUT WEBVIEW] Set member token cookie');
              }
            } catch (error) {
              console.warn('⚠️ [CHECKOUT WEBVIEW] Failed to parse member tokens:', error);
            }
          }

          // Set visitor authentication cookies as fallback
          if (visitorTokens) {
            try {
              const tokens = JSON.parse(visitorTokens);
              if (tokens.accessToken) {
                const visitorCookie = `wix-visitor-token=${tokens.accessToken}; Domain=${domain}; Path=/; Secure`;
                await CookieManager.setFromResponse(checkoutUrl, visitorCookie);
                console.log('✅ [CHECKOUT WEBVIEW] Set visitor token cookie');
              }
            } catch (error) {
              console.warn('⚠️ [CHECKOUT WEBVIEW] Failed to parse visitor tokens:', error);
            }
          }

          // Set member identity cookie for additional context
          const memberIdCookie = `wix-member-id=${currentMember.id}; Domain=${domain}; Path=/; Secure`;
          await CookieManager.setFromResponse(checkoutUrl, memberIdCookie);
          console.log('✅ [CHECKOUT WEBVIEW] Set member ID cookie');

          // If we have member email, set that too
          if (currentMember.email?.address) {
            const emailCookie = `wix-member-email=${encodeURIComponent(currentMember.email.address)}; Domain=${domain}; Path=/; Secure`;
            await CookieManager.setFromResponse(checkoutUrl, emailCookie);
            console.log('✅ [CHECKOUT WEBVIEW] Set member email cookie');
          }
        } else {
          console.log('ℹ️ [CHECKOUT WEBVIEW] User not logged in, proceeding with guest checkout');
        }

        // Mark authentication as ready
        setAuthReady(true);
        console.log('✅ [CHECKOUT WEBVIEW] Authentication setup complete');

      } catch (error) {
        console.error('❌ [CHECKOUT WEBVIEW] Failed to setup authentication:', error);
        onError?.('Failed to setup authentication for checkout');
        setAuthReady(true); // Proceed anyway for guest checkout
      }
    };

    setupAuthentication();
  }, [checkoutUrl, isLoggedIn, member, onError]);

  const handleNavigationStateChange = (navState: any) => {
    console.log('🌐 [CHECKOUT WEBVIEW] Navigation changed:', {
      url: navState.url,
      canGoBack: navState.canGoBack,
      loading: navState.loading,
    });

    setCanGoBack(navState.canGoBack);
    setCurrentUrl(navState.url);

    // Check for checkout completion based on URL patterns
    if (navState.url) {
      // Success patterns - customize these based on your Wix checkout flow
      const successPatterns = [
        '/thank-you',
        '/order-confirmation',
        '/checkout-success',
        'checkout_success=true',
        'payment_status=success',
      ];

      // Error patterns
      const errorPatterns = [
        '/checkout-error',
        '/payment-failed',
        'checkout_error=true',
        'payment_status=failed',
      ];

      // Check for success
      if (successPatterns.some(pattern => navState.url.includes(pattern))) {
        console.log('✅ [CHECKOUT WEBVIEW] Checkout completed successfully');
        Alert.alert(
          '🎉 Order Complete!',
          'Your order has been placed successfully. Thank you for your purchase!',
          [
            {
              text: 'Continue Shopping',
              onPress: () => {
                onSuccess?.();
                onClose();
              },
            },
          ]
        );
        return;
      }

      // Check for errors
      if (errorPatterns.some(pattern => navState.url.includes(pattern))) {
        console.log('❌ [CHECKOUT WEBVIEW] Checkout failed');
        Alert.alert(
          '⚠️ Checkout Issue',
          'There was an issue processing your order. Please try again.',
          [
            {
              text: 'Try Again',
              onPress: () => webViewRef.current?.reload(),
            },
            {
              text: 'Close',
              style: 'cancel',
              onPress: onClose,
            },
          ]
        );
        return;
      }
    }
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('❌ [CHECKOUT WEBVIEW] WebView error:', nativeEvent);
    
    Alert.alert(
      '🚨 Connection Error',
      'Unable to load checkout page. Please check your internet connection and try again.',
      [
        {
          text: 'Retry',
          onPress: () => webViewRef.current?.reload(),
        },
        {
          text: 'Close',
          style: 'cancel',
          onPress: onClose,
        },
      ]
    );

    onError?.(nativeEvent.description || 'WebView error');
  };

  const handleLoadStart = () => {
    console.log('🌐 [CHECKOUT WEBVIEW] Load started');
    setLoading(true);
  };

  const handleLoadEnd = () => {
    console.log('🌐 [CHECKOUT WEBVIEW] Load completed');
    setLoading(false);
  };

  const handleBackPress = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    } else {
      Alert.alert(
        '🛒 Close Checkout?',
        'Are you sure you want to close the checkout? Your cart will be saved.',
        [
          {
            text: 'Continue Shopping',
            style: 'cancel',
          },
          {
            text: 'Close Checkout',
            style: 'destructive',
            onPress: onClose,
          },
        ]
      );
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
      textAlign: 'center',
    },
    headerButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    backButton: {
      backgroundColor: theme.colors.primary + '20',
    },
    closeButton: {
      backgroundColor: theme.colors.error + '20',
    },
    headerButtonText: {
      fontSize: 16,
      fontWeight: '500',
    },
    backButtonText: {
      color: theme.colors.primary,
    },
    closeButtonText: {
      color: theme.colors.error,
    },
    webViewContainer: {
      flex: 1,
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background + 'CC',
      zIndex: 1000,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: '500',
    },
    urlBar: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    urlText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: 'monospace',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.headerButton, styles.backButton]}
          onPress={handleBackPress}
        >
          <Text style={[styles.headerButtonText, styles.backButtonText]}>
            {canGoBack ? '← Back' : '← Close'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Secure Checkout</Text>

        <TouchableOpacity
          style={[styles.headerButton, styles.closeButton]}
          onPress={onClose}
        >
          <Text style={[styles.headerButtonText, styles.closeButtonText]}>
            ✕ Close
          </Text>
        </TouchableOpacity>
      </View>

      {/* URL Bar (helpful for debugging) */}
      {__DEV__ && (
        <View style={styles.urlBar}>
          <Text style={styles.urlText} numberOfLines={1}>
            {currentUrl}
          </Text>
        </View>
      )}

      {/* WebView */}
      <View style={styles.webViewContainer}>
        {authReady ? (
          <WebView
            ref={webViewRef}
            source={{ uri: checkoutUrl }}
            onNavigationStateChange={handleNavigationStateChange}
            onError={handleError}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            allowsBackForwardNavigationGestures={true}
            pullToRefreshEnabled={true}
            bounces={true}
            scrollEnabled={true}
            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 BrandedApp/1.0"
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading Secure Checkout...</Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Preparing Checkout...</Text>
            {isLoggedIn && (
              <Text style={[styles.loadingText, { fontSize: 14, marginTop: 8, opacity: 0.7 }]}>
                Setting up your member session...
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading Secure Checkout...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CheckoutWebView; 