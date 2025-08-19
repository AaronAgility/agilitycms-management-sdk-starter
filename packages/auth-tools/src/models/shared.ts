/**
 * Shared interfaces and types for SDK integration
 * These are abstracted versions of the main SDK types to maintain independence
 */

/**
 * Website listing information from the main SDK
 */
export interface WebsiteListing {
    orgCode: string | null;
    orgName: string | null;
    websiteName: string | null;
    websiteNameStripped: string | null;
    displayName: string | null;
    guid: string | null;
    websiteID: number;
    isCurrent: boolean;
    managerUrl: string | null;
    version: string | null;
    isOwner: boolean;
    isDormant: boolean;
    isRestoring: boolean;
    teamID: number | null;
}

/**
 * Server user information from the main SDK
 */
export interface ServerUser {
    userID: number;
    userName: string | null;
    emailAddress: string | null;
    firstName: string | null;
    lastName: string | null;
    isInternalUser: boolean;
    isSuspended: boolean;
    isProfileComplete: boolean;
    adminAccess: boolean;
    currentWebsite: string | null;
    userTypeID: number;
    timeZoneRegion: string | null;
    password: string | null;
    passwordQuestion: string | null;
    passwordAnswer: string | null;
    websiteAccess: WebsiteListing[];
    jobRole: string | null;
    createdDate: string | null;
}

/**
 * Configuration options interface for SDK integration
 */
export interface Options {
    token?: string;
    baseUrl?: string | null;
    refresh_token?: string;
    duration?: number;
    retryCount?: number;
}

/**
 * Exception class for error handling
 */
export class Exception extends Error {
    constructor(message: string, inner?: Error) {
        super(message);
        this.innerError = inner;
        this.name = 'Exception';
    }

    innerError?: Error;
}

/**
 * HTTP client interface for making API requests
 */
export interface HttpClient {
    get<T>(url: string, config?: any): Promise<{ data: T }>;
    post<T>(url: string, data?: any, config?: any): Promise<{ data: T }>;
    put<T>(url: string, data?: any, config?: any): Promise<{ data: T }>;
    delete<T>(url: string, config?: any): Promise<{ data: T }>;
}

/**
 * Client instance interface for OAuth operations
 */
export interface ClientInstance {
    determineOAuthBaseUrl(region?: string): string;
    executeOAuthPost(endpoint: string, data: URLSearchParams, region?: string): Promise<{ data: any }>;
    executeOAuthGet(endpoint: string, region?: string, token?: string): Promise<{ data: any }>;
}

/**
 * API client interface for SDK integration
 */
export interface ApiClientInterface {
    serverUserMethods: {
        me(): Promise<ServerUser>;
    };
    instanceMethods: {
        getLocales(websiteGuid: string): Promise<any[]>;
    };
    signOut(): Promise<void>;
}

/**
 * SDK adapter interface for integrating with the main management SDK
 */
export interface SdkAdapter {
    createApiClient(options?: Options): ApiClientInterface;
    getClientInstance(options?: Options): ClientInstance;
}
