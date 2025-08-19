import { 
    ApiClientInterface, 
    SdkAdapter, 
    Options, 
    ClientInstance,
    ServerUser
} from '../models/shared';

/**
 * SDK Adapter for integrating with the main Agility CMS Management SDK
 * This provides a bridge between the auth package and the main SDK
 */
export class DefaultSdkAdapter implements SdkAdapter {
    private mainSdk: any;

    constructor(mainSdk?: any) {
        this.mainSdk = mainSdk;
    }

    /**
     * Create an API client instance from the main SDK
     * @param options - Configuration options
     * @returns API client interface
     */
    createApiClient(options?: Options): ApiClientInterface {
        if (!this.mainSdk || !this.mainSdk.ApiClient) {
            throw new Error('Main SDK not available. Please provide the main SDK instance.');
        }

        const client = new this.mainSdk.ApiClient(options);
        
        // Create adapter interface
        return {
            serverUserMethods: {
                me: async (): Promise<ServerUser> => {
                    return await client.serverUserMethods.me();
                }
            },
            instanceMethods: {
                getLocales: async (websiteGuid: string): Promise<any[]> => {
                    return await client.instanceMethods.getLocales(websiteGuid);
                }
            },
            signOut: async (): Promise<void> => {
                return await client.signOut();
            }
        };
    }

    /**
     * Get client instance for OAuth operations
     * @param options - Configuration options
     * @returns Client instance interface
     */
    getClientInstance(options?: Options): ClientInstance {
        if (!this.mainSdk || !this.mainSdk.ClientInstance) {
            throw new Error('Main SDK not available. Please provide the main SDK instance.');
        }

        const clientInstance = new this.mainSdk.ClientInstance(options);
        
        return {
            determineOAuthBaseUrl: (region?: string): string => {
                return clientInstance.determineOAuthBaseUrl(region);
            },
            executeOAuthPost: async (endpoint: string, data: URLSearchParams, region?: string) => {
                return await clientInstance.executeOAuthPost(endpoint, data, region);
            },
            executeOAuthGet: async (endpoint: string, region?: string, token?: string) => {
                return await clientInstance.executeOAuthGet(endpoint, region, token);
            }
        };
    }

    /**
     * Set the main SDK instance for adapter operations
     * @param sdk - Main SDK instance
     */
    setMainSdk(sdk: any): void {
        this.mainSdk = sdk;
    }

    /**
     * Check if main SDK is available
     * @returns True if main SDK is available
     */
    isMainSdkAvailable(): boolean {
        return !!(this.mainSdk && this.mainSdk.ApiClient);
    }
}

/**
 * Default adapter instance
 */
export const defaultSdkAdapter = new DefaultSdkAdapter();

/**
 * Configure the SDK adapter with the main SDK
 * @param mainSdk - Main Agility CMS Management SDK
 */
export function configureSdkAdapter(mainSdk: any): void {
    defaultSdkAdapter.setMainSdk(mainSdk);
}

/**
 * Get the configured SDK adapter
 * @returns SDK adapter instance
 */
export function getSdkAdapter(): SdkAdapter {
    return defaultSdkAdapter;
}
