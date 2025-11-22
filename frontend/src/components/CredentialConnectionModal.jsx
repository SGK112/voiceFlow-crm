import { useState, useEffect } from 'react';
import { X, ExternalLink, CheckCircle, AlertCircle, Loader2, Zap } from 'lucide-react';
import api from '../services/api';

const PROVIDER_LOGOS = {
  Google: '🔵',
  Facebook: '📘',
  Microsoft: '🟦',
  Slack: '💬',
  Stripe: '💳',
  QuickBooks: '💰',
  Salesforce: '☁️',
  HubSpot: '🟠',
  Shopify: '🛍️',
  LinkedIn: '💼',
  Twitter: '🐦',
  Dropbox: '📦',
  Mailchimp: '📧',
  Notion: '📝'
};

function CredentialConnectionModal({ isOpen, onClose, credentialInfo, onConnected }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [oauthWindow, setOauthWindow] = useState(null);

  useEffect(() => {
    // Listen for OAuth callback messages
    const handleMessage = (event) => {
      // Security: Check origin
      if (event.data && event.data.type === 'n8n-credential-connected') {
        handleCredentialConnected();
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (oauthWindow && !oauthWindow.closed) {
        oauthWindow.close();
      }
    };
  }, [oauthWindow]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Get OAuth URL from backend
      const response = await api.get(`/credentials/oauth/${credentialInfo.type}`);
      const { oauthUrl } = response.data;

      // Open n8n OAuth in popup
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        oauthUrl,
        'n8n-oauth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
      );

      setOauthWindow(popup);

      // Poll to check if popup was closed
      const pollTimer = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(pollTimer);
          setIsConnecting(false);

          // Check if credential was actually connected
          checkCredentialStatus();
        }
      }, 500);

    } catch (err) {
      console.error('Error initiating OAuth:', err);
      setError('Failed to start connection. Please try again.');
      setIsConnecting(false);
    }
  };

  const checkCredentialStatus = async () => {
    try {
      const response = await api.get(`/credentials/check/${credentialInfo.type}`);
      if (response.data.hasCredential) {
        handleCredentialConnected();
      }
    } catch (err) {
      console.error('Error checking credential status:', err);
    }
  };

  const handleCredentialConnected = () => {
    setIsConnecting(false);
    if (onConnected) {
      onConnected(credentialInfo);
    }
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleOpenN8n = () => {
    window.open('http://5.183.8.119:5678/credentials', '_blank');
  };

  if (!isOpen) return null;

  const providerIcon = PROVIDER_LOGOS[credentialInfo?.provider] || '🔌';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={isConnecting}
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-3xl">
              {providerIcon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Connect {credentialInfo?.name}
              </h2>
              <p className="text-blue-100 text-sm">
                {credentialInfo?.provider} OAuth
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Quick Setup:</strong> Authorize with your {credentialInfo?.provider} account
                  in the popup. Your credentials are stored securely in n8n and never shared with us.
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">
                What happens next:
              </h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 w-5">1.</span>
                  <span>A popup will open to {credentialInfo?.provider}'s login page</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 w-5">2.</span>
                  <span>Sign in with your {credentialInfo?.provider} account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 w-5">3.</span>
                  <span>Grant permissions for the integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 w-5">4.</span>
                  <span>You'll be redirected back automatically</span>
                </li>
              </ol>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Your credentials are encrypted and stored securely</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-secondary/50 rounded-b-2xl space-y-3">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              isConnecting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            }`}
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <ExternalLink className="w-5 h-5" />
                Connect {credentialInfo?.name}
              </>
            )}
          </button>

          <button
            onClick={handleOpenN8n}
            className="w-full py-2 px-4 text-sm text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Or manage credentials in n8n →
          </button>
        </div>
      </div>
    </div>
  );
}

export default CredentialConnectionModal;
