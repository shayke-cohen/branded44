import React, { useState, useRef, useEffect } from 'react';

interface CheckoutWebInterfaceProps {
  checkoutUrl: string;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

type CheckoutMode = 'iframe' | 'popup' | 'newTab';

const CheckoutWebInterface: React.FC<CheckoutWebInterfaceProps> = ({
  checkoutUrl,
  onClose,
  onSuccess,
  onError,
}) => {
  const [mode, setMode] = useState<CheckoutMode>('iframe');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const popupRef = useRef<Window | null>(null);

  console.log('🌐 [WEB CHECKOUT] Initializing with URL:', checkoutUrl);

  // Setup authentication for web checkout
  useEffect(() => {
    const setupWebAuthentication = async () => {
      try {
        console.log('🍪 [WEB CHECKOUT] Setting up web authentication...');
        
        // For web, we can use localStorage to pass authentication data
        const authData = {
          // Get authentication data that's available in web context
          timestamp: Date.now(),
          sessionIdentifier: Math.random().toString(36).substring(7),
        };

        // Store auth data that the checkout can potentially access
        localStorage.setItem('checkout_auth_data', JSON.stringify(authData));
        
        // Add authentication parameters to the checkout URL if possible
        const url = new URL(checkoutUrl);
        url.searchParams.set('web_checkout', 'true');
        url.searchParams.set('auth_timestamp', authData.timestamp.toString());
        
        console.log('✅ [WEB CHECKOUT] Authentication setup complete');
        
      } catch (error) {
        console.error('❌ [WEB CHECKOUT] Authentication setup failed:', error);
        onError?.('Failed to setup authentication for web checkout');
      }
    };

    setupWebAuthentication();
  }, [checkoutUrl, onError]);

  // Monitor iframe for completion
  useEffect(() => {
    if (mode === 'iframe' && iframeRef.current) {
      const iframe = iframeRef.current;
      
      const handleIframeLoad = () => {
        console.log('🌐 [WEB CHECKOUT] Iframe loaded');
        setLoading(false);
        
        try {
          // Try to detect completion by URL changes (if same-origin)
          const currentUrl = iframe.contentWindow?.location?.href;
          if (currentUrl && (
            currentUrl.includes('thank-you') || 
            currentUrl.includes('order-confirmation') ||
            currentUrl.includes('success')
          )) {
            console.log('✅ [WEB CHECKOUT] Checkout completed successfully');
            onSuccess?.();
          }
        } catch (error) {
          // Cross-origin restrictions prevent URL access - this is normal
          console.log('ℹ️ [WEB CHECKOUT] Cross-origin iframe - cannot monitor URL changes');
        }
      };

      const handleIframeError = () => {
        console.error('❌ [WEB CHECKOUT] Iframe failed to load');
        setError('Failed to load checkout');
        setLoading(false);
      };

      iframe.addEventListener('load', handleIframeLoad);
      iframe.addEventListener('error', handleIframeError);

      return () => {
        iframe.removeEventListener('load', handleIframeLoad);
        iframe.removeEventListener('error', handleIframeError);
      };
    }
  }, [mode, onSuccess]);

  // Monitor popup window
  useEffect(() => {
    if (mode === 'popup' && popupRef.current) {
      const checkPopupStatus = () => {
        const popup = popupRef.current;
        if (!popup || popup.closed) {
          console.log('🌐 [WEB CHECKOUT] Popup window closed');
          onClose();
          return;
        }

        try {
          // Try to detect completion by URL changes (if same-origin)
          const currentUrl = popup.location.href;
          if (currentUrl && (
            currentUrl.includes('thank-you') || 
            currentUrl.includes('order-confirmation') ||
            currentUrl.includes('success')
          )) {
            console.log('✅ [WEB CHECKOUT] Checkout completed successfully');
            popup.close();
            onSuccess?.();
            return;
          }
        } catch (error) {
          // Cross-origin restrictions - normal for external checkout
        }

        // Continue monitoring
        setTimeout(checkPopupStatus, 1000);
      };

      // Start monitoring after a short delay
      setTimeout(checkPopupStatus, 1000);
    }
  }, [mode, onClose, onSuccess]);

  const openInPopup = () => {
    console.log('🪟 [WEB CHECKOUT] Opening in popup window');
    const popup = window.open(
      checkoutUrl,
      'checkout',
      'width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes'
    );
    
    if (popup) {
      popupRef.current = popup;
      setMode('popup');
      // Focus the popup
      popup.focus();
    } else {
      console.error('❌ [WEB CHECKOUT] Popup blocked');
      setError('Popup was blocked. Please allow popups and try again.');
    }
  };

  const openInNewTab = () => {
    console.log('🔗 [WEB CHECKOUT] Opening in new tab');
    window.open(checkoutUrl, '_blank');
    // For new tab, we can't monitor completion, so just close the modal
    onClose();
  };

  const handleModeChange = (newMode: CheckoutMode) => {
    if (newMode === 'popup') {
      openInPopup();
    } else if (newMode === 'newTab') {
      openInNewTab();
    } else {
      setMode(newMode);
      setError(null);
      setLoading(true);
    }
  };

  if (mode === 'popup' || mode === 'newTab') {
    return null; // These modes don't render UI in the parent
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px 20px',
        borderBottom: '1px solid #e1e5e9',
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1a1a1a',
          margin: 0,
        }}>
          🛒 Secure Checkout
        </h2>
        
        <div style={{
          display: 'flex',
          gap: '10px',
        }}>
          <button
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #dee2e6',
              backgroundColor: '#f8f9fa',
              color: '#495057',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            onClick={() => handleModeChange('popup')}
          >
            🪟 Popup
          </button>
          
          <button
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #dee2e6',
              backgroundColor: '#f8f9fa',
              color: '#495057',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            onClick={() => handleModeChange('newTab')}
          >
            🔗 New Tab
          </button>
          
          <button
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #dc3545',
              backgroundColor: '#dc3545',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderBottom: '1px solid #dee2e6',
      }}>
        <p style={{
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '10px',
          color: '#495057',
          margin: 0,
        }}>
          Checkout Method:
        </p>
        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '10px',
        }}>
          <button
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
              backgroundColor: mode === 'iframe' ? '#007bff' : '#fff',
              color: mode === 'iframe' ? '#fff' : '#495057',
              fontSize: '12px',
              cursor: 'pointer',
            }}
            onClick={() => setMode('iframe')}
          >
            📱 Embedded
          </button>
          
          <button
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
              backgroundColor: '#fff',
              color: '#495057',
              fontSize: '12px',
              cursor: 'pointer',
            }}
            onClick={() => handleModeChange('popup')}
          >
            🪟 Popup Window
          </button>
          
          <button
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
              backgroundColor: '#fff',
              color: '#495057',
              fontSize: '12px',
              cursor: 'pointer',
            }}
            onClick={() => handleModeChange('newTab')}
          >
            🔗 New Tab
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        backgroundColor: '#fff',
      }}>
        {error ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            backgroundColor: '#f8f9fa',
            padding: '40px',
          }}>
            <p style={{
              fontSize: '16px',
              color: '#dc3545',
              textAlign: 'center',
              marginBottom: '20px',
            }}>
              {error}
            </p>
            <button
              style={{
                backgroundColor: '#007bff',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
              onClick={() => {
                setError(null);
                setLoading(true);
              }}
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            backgroundColor: '#f8f9fa',
          }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <p style={{
              fontSize: '16px',
              color: '#6c757d',
              marginTop: '16px',
            }}>
              Loading Secure Checkout...
            </p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={checkoutUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="Secure Checkout"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
            allow="payment; encrypted-media"
          />
        )}
      </div>

      {/* Add CSS animation for loading spinner */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CheckoutWebInterface; 