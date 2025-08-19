import React, { useState } from 'react';
import { useAgilityAuth } from './hooks/useAgilityAuth';

export interface TokenInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TokenInfoModal: React.FC<TokenInfoModalProps> = ({ isOpen, onClose }) => {
  const [showTokens, setShowTokens] = useState(false);
  const auth = useAgilityAuth() as any;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🔑 Authentication Token Information
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-700 dark:text-gray-300">
              Access authentication tokens and API client for debugging and advanced use cases.
            </p>
            <button
              onClick={() => setShowTokens(!showTokens)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              {showTokens ? 'Hide Tokens' : 'Show Tokens'}
            </button>
          </div>
          
          {showTokens && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Token Information:</h3>
              <div className="grid gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-gray-900 dark:text-white">Access Token:</strong>
                    <button
                      onClick={() => navigator.clipboard.writeText(auth.tokenInfo?.accessToken || '')}
                      className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="text-sm font-mono text-gray-600 dark:text-gray-400 break-all bg-gray-100 dark:bg-gray-900 p-2 rounded">
                    {auth.tokenInfo?.accessToken || 'Not available'}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-gray-900 dark:text-white">Refresh Token:</strong>
                    <button
                      onClick={() => navigator.clipboard.writeText(auth.tokenInfo?.refreshToken || '')}
                      className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="text-sm font-mono text-gray-600 dark:text-gray-400 break-all bg-gray-100 dark:bg-gray-900 p-2 rounded">
                    {auth.tokenInfo?.refreshToken || 'Not available'}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <strong className="text-gray-900 dark:text-white block mb-2">Expires At:</strong>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {auth.tokenInfo?.expiresAt ? new Date(auth.tokenInfo.expiresAt).toLocaleString() : 'Not available'}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <strong className="text-gray-900 dark:text-white block mb-2">Token Type:</strong>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {auth.tokenInfo?.tokenType || 'Not available'}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <strong className="text-gray-900 dark:text-white block mb-2">Scope:</strong>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {auth.tokenInfo?.scope || 'Not available'}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <strong className="text-gray-900 dark:text-white block mb-2">Authentication Status:</strong>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {auth.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <strong className="text-gray-900 dark:text-white block mb-2">User Info:</strong>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {auth.user ? `${auth.user.firstName || ''} ${auth.user.lastName || ''} (${auth.user.emailAddress})` : 'Not available'}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <strong className="text-gray-900 dark:text-white block mb-2">Debug Info:</strong>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    API Client: {auth.getApiClient ? '✅ Available' : '❌ Not available'}
                    <br />
                    Selected Website: {auth.selectedWebsite || 'None'}
                    <br />
                    Selected Locale: {auth.selectedLocale || 'None'}
                    <br />
                    Website Access Count: {auth.websiteAccess?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
