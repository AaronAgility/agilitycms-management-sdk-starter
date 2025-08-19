// Dynamic keytar import to avoid bundling issues in browser environments
let keytar: any = null;

// Only try to load keytar in Node.js environments
if (typeof window === 'undefined' && typeof process !== 'undefined' && process.versions && process.versions.node) {
    try {
        // Dynamic import to avoid bundling
        const keytarModuleName = 'keytar';
        keytar = eval(`require('${keytarModuleName}')`);
    } catch (error) {
        console.warn('Keytar not available in this environment:', error);
    }
}

export interface StoredTokenData {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: number; // Unix timestamp
    tokenType?: string;
    scope?: string;
}

export interface TokenStorageOptions {
    serviceName?: string;
    accountName?: string;
    fallbackToMemory?: boolean;
}

/**
 * Secure token storage using OS-level keychain/credential store
 * Falls back to localStorage in browsers, then to in-memory storage if neither is available
 */
export class TokenStorage {
    private serviceName: string;
    private accountName: string;
    private fallbackToMemory: boolean;
    private memoryStorage: Map<string, StoredTokenData> = new Map();
    private keytarAvailable: boolean = true;
    private isBrowser: boolean;

    constructor(options: TokenStorageOptions = {}) {
        this.serviceName = options.serviceName || 'agility-cms-management-sdk';
        this.accountName = options.accountName || 'default';
        this.fallbackToMemory = options.fallbackToMemory !== false;
        this.isBrowser = typeof window !== 'undefined';
        
        // Test keytar availability
        this.testKeytarAvailability();
    }

    /**
     * Test if keytar is available on this platform
     */
    private async testKeytarAvailability(): Promise<void> {
        try {
            // Test keytar by trying to access it
            if (keytar && keytar.findCredentials) {
                await keytar.findCredentials(this.serviceName + '-test');
                this.keytarAvailable = true;
            } else {
                this.keytarAvailable = false;
            }
        } catch (error) {
            console.warn('Keytar not available, falling back to localStorage or memory storage:', error);
            this.keytarAvailable = false;
        }
    }

    /**
     * Get localStorage key for token storage
     */
    private getLocalStorageKey(): string {
        return `${this.serviceName}-${this.accountName}`;
    }

    /**
     * Store tokens in localStorage (browser fallback)
     */
    private setTokensInLocalStorage(tokenData: StoredTokenData): void {
        try {
            if (this.isBrowser && window.localStorage) {
                const serializedData = JSON.stringify(tokenData);
                window.localStorage.setItem(this.getLocalStorageKey(), serializedData);
            }
        } catch (error) {
            console.warn('Failed to store tokens in localStorage:', error);
            throw error;
        }
    }

    /**
     * Retrieve tokens from localStorage (browser fallback)
     */
    private getTokensFromLocalStorage(): StoredTokenData | null {
        try {
            if (this.isBrowser && window.localStorage) {
                const serializedData = window.localStorage.getItem(this.getLocalStorageKey());
                if (serializedData) {
                    return JSON.parse(serializedData);
                }
            }
        } catch (error) {
            console.warn('Failed to retrieve tokens from localStorage:', error);
        }
        return null;
    }

    /**
     * Clear tokens from localStorage (browser fallback)
     */
    private clearTokensFromLocalStorage(): void {
        try {
            if (this.isBrowser && window.localStorage) {
                window.localStorage.removeItem(this.getLocalStorageKey());
            }
        } catch (error) {
            console.warn('Failed to clear tokens from localStorage:', error);
        }
    }

    /**
     * Store token data securely
     */
    async setTokens(tokenData: StoredTokenData): Promise<void> {
        const serializedData = JSON.stringify(tokenData);
        
        // Try keytar first (Node.js environments)
        if (this.keytarAvailable && keytar) {
            try {
                await keytar.setPassword(this.serviceName, this.accountName, serializedData);
                return;
            } catch (error) {
                console.warn('Failed to store tokens in keytar:', error);
                if (!this.fallbackToMemory) {
                    throw error;
                }
            }
        }
        
        // Try localStorage second (browser environments)
        if (this.isBrowser) {
            try {
                this.setTokensInLocalStorage(tokenData);
                return;
            } catch (error) {
                console.warn('Failed to store tokens in localStorage:', error);
                if (!this.fallbackToMemory) {
                    throw error;
                }
            }
        }
        
        // Final fallback to memory storage
        this.memoryStorage.set(this.accountName, tokenData);
    }

    /**
     * Retrieve token data
     */
    async getTokens(): Promise<StoredTokenData | null> {
        // Try keytar first (Node.js environments)
        if (this.keytarAvailable && keytar) {
            try {
                const serializedData = await keytar.getPassword(this.serviceName, this.accountName);
                if (serializedData) {
                    return JSON.parse(serializedData);
                }
            } catch (error) {
                console.warn('Failed to retrieve tokens from keytar:', error);
                if (!this.fallbackToMemory) {
                    return null;
                }
            }
        }
        
        // Try localStorage second (browser environments)
        if (this.isBrowser) {
            const localStorageData = this.getTokensFromLocalStorage();
            if (localStorageData) {
                return localStorageData;
            }
        }
        
        // Final fallback to memory storage
        return this.memoryStorage.get(this.accountName) || null;
    }

    /**
     * Check if stored tokens are expired
     */
    async areTokensExpired(): Promise<boolean> {
        const tokenData = await this.getTokens();
        if (!tokenData || !tokenData.expiresAt) {
            return true; // No tokens or no expiration info = expired
        }
        
        const now = Date.now();
        const bufferTime = 60 * 1000; // 1 minute buffer
        return now >= (tokenData.expiresAt - bufferTime);
    }

    /**
     * Get access token if not expired
     */
    async getValidAccessToken(): Promise<string | null> {
        const tokenData = await this.getTokens();
        if (!tokenData) {
            return null;
        }
        
        const isExpired = await this.areTokensExpired();
        if (isExpired) {
            return null;
        }
        
        return tokenData.accessToken;
    }

    /**
     * Get refresh token
     */
    async getRefreshToken(): Promise<string | null> {
        const tokenData = await this.getTokens();
        return tokenData?.refreshToken || null;
    }

    /**
     * Update only the access token (keeping refresh token)
     */
    async updateAccessToken(accessToken: string, expiresIn?: number): Promise<void> {
        const existingData = await this.getTokens();
        const tokenData: StoredTokenData = {
            ...existingData,
            accessToken,
            expiresAt: expiresIn ? Date.now() + (expiresIn * 1000) : undefined
        };
        
        await this.setTokens(tokenData);
    }

    /**
     * Clear all stored tokens
     */
    async clearTokens(): Promise<void> {
        // Clear keytar storage
        if (this.keytarAvailable && keytar) {
            try {
                await keytar.deletePassword(this.serviceName, this.accountName);
            } catch (error) {
                console.warn('Failed to clear tokens from keytar:', error);
            }
        }
        
        // Clear localStorage storage
        if (this.isBrowser) {
            this.clearTokensFromLocalStorage();
        }
        
        // Clear memory storage
        this.memoryStorage.delete(this.accountName);
    }

    /**
     * Check if tokens exist (regardless of expiration)
     */
    async hasTokens(): Promise<boolean> {
        const tokenData = await this.getTokens();
        return tokenData !== null && !!tokenData.accessToken;
    }

    /**
     * Get token expiration time
     */
    async getTokenExpiration(): Promise<number | null> {
        const tokenData = await this.getTokens();
        return tokenData?.expiresAt || null;
    }

    /**
     * Calculate time until expiration in seconds
     */
    async getTimeUntilExpiration(): Promise<number> {
        const expiresAt = await this.getTokenExpiration();
        if (!expiresAt) {
            return 0;
        }
        
        const now = Date.now();
        const timeUntilExpiration = Math.max(0, expiresAt - now);
        return Math.floor(timeUntilExpiration / 1000);
    }

    /**
     * Get storage type being used
     */
    getStorageType(): 'keytar' | 'localStorage' | 'memory' {
        if (this.keytarAvailable) {
            return 'keytar';
        } else if (this.isBrowser) {
            return 'localStorage';
        } else {
            return 'memory';
        }
    }
}
