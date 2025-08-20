import { defaultSdkAdapter } from '../adapters/sdkAdapter';
import { AuthMethods } from '../auth/authMethods';

/**
 * Management API Client
 * Provides a pre-configured Agility CMS Management SDK client with automatic token management
 */
export class MgmtApiClient {
    private client: any = null;
    private isConfigured: boolean = false;
    private authMethods: AuthMethods;

    constructor() {
        this.authMethods = new AuthMethods({});
    }

    /**
     * Get a configured management SDK client with automatic token handling
     * @returns Promise<ManagementSDK.ApiClient> - Ready to use management SDK client
     */
    async getClient(): Promise<any> {
        if (!defaultSdkAdapter.isMainSdkAvailable()) {
            throw new Error(
                'Management SDK not configured. Please call configureSdkAdapter() with the management SDK before using the client.'
            );
        }

        try {
            // Get a valid access token
            const accessToken = await this.authMethods.getValidAccessToken();
            
            if (!accessToken) {
                throw new Error(
                    'No valid access token available. Please authenticate first using the auth components.'
                );
            }

            // Create a new client with the current token
            const clientOptions = {
                token: accessToken,
                // Add any other default options here
            };

            console.log('MgmtApiClient: Creating client with token:', !!accessToken);
            this.client = defaultSdkAdapter.createApiClient(clientOptions);
            this.isConfigured = true;

            return this.client;
        } catch (error) {
            console.error('MgmtApiClient: Failed to create client:', error);
            throw new Error(`Failed to create management client: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get a direct instance of the management SDK ApiClient class
     * This gives you the full SDK with all methods available
     * @returns Promise<any> - Full management SDK client
     */
    async getFullClient(): Promise<any> {
        if (!defaultSdkAdapter.isMainSdkAvailable()) {
            throw new Error(
                'Management SDK not configured. Please call configureSdkAdapter() with the management SDK.'
            );
        }

        try {
            // Get a valid access token
            const accessToken = await this.authMethods.getValidAccessToken();
            
            if (!accessToken) {
                throw new Error(
                    'No valid access token available. Please authenticate first.'
                );
            }

            // Create a direct instance of the management SDK ApiClient
            const ManagementSDK = (defaultSdkAdapter as any).mainSdk;
            const fullClient = new ManagementSDK.ApiClient({
                token: accessToken,
            });

            console.log('MgmtApiClient: Created full SDK client with token');
            return fullClient;
        } catch (error) {
            console.error('MgmtApiClient: Failed to create full client:', error);
            throw new Error(`Failed to create full management client: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Check if the client is properly configured and has a valid token
     * @returns Promise<boolean>
     */
    async isReady(): Promise<boolean> {
        try {
            if (!defaultSdkAdapter.isMainSdkAvailable()) {
                return false;
            }

            const accessToken = await this.authMethods.getValidAccessToken();
            return !!accessToken;
        } catch {
            return false;
        }
    }

    /**
     * Get current user information
     * @returns Promise<any> - User information
     */
    async getCurrentUser(): Promise<any> {
        const client = await this.getClient();
        return await client.serverUserMethods.me();
    }

    /**
     * Get locales for a website
     * @param websiteGuid - Website GUID
     * @returns Promise<any[]> - List of locales
     */
    async getLocales(websiteGuid: string): Promise<any[]> {
        const client = await this.getClient();
        return await client.instanceMethods.getLocales(websiteGuid);
    }

    /**
     * Sign out and clear the client
     */
    async signOut(): Promise<void> {
        if (this.client) {
            try {
                await this.client.signOut();
            } catch (error) {
                console.warn('MgmtApiClient: Error during sign out:', error);
            }
        }
        this.client = null;
        this.isConfigured = false;
    }

    /**
     * Refresh the client with a new token
     * Call this if you suspect the token has been refreshed
     */
    async refreshClient(): Promise<any> {
        this.client = null;
        this.isConfigured = false;
        return await this.getClient();
    }
}

/**
 * Default management API client instance
 */
export const mgmtApiClient = new MgmtApiClient();

/**
 * Get a configured management SDK client
 * This is the main export that users should use
 * 
 * @example
 * ```typescript
 * import { getMgmtApiClient } from '@agility/auth-tools';
 * 
 * const client = await getMgmtApiClient();
 * const user = await client.serverUserMethods.me();
 * ```
 */
export async function getMgmtApiClient(): Promise<any> {
    return await mgmtApiClient.getClient();
}

/**
 * Get the full management SDK client with all methods
 * 
 * @example
 * ```typescript
 * import { getFullMgmtApiClient } from '@agility/auth-tools';
 * 
 * const client = await getFullMgmtApiClient();
 * const pages = await client.contentMethods.getPages();
 * ```
 */
export async function getFullMgmtApiClient(): Promise<any> {
    return await mgmtApiClient.getFullClient();
}

/**
 * Check if the management client is ready to use
 */
export async function isMgmtClientReady(): Promise<boolean> {
    return await mgmtApiClient.isReady();
}
