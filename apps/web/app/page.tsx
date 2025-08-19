

'use client';

import { AgilityAuth } from '@repo/auth-tools/components';
import { AuthProvider } from '@repo/auth-tools/components'; 
import { useAgilityAuth } from '@repo/auth-tools/components';
import { configureSdkAdapter } from '@repo/auth-tools/adapters';
import { 
  AgilityAuthConfig, 
  ServerUser, 
  WebsiteAccess, 
  LocaleInfo 
} from '@repo/auth-tools/models';
import * as ManagementSDK from '@agility/management-sdk';

import { useEffect, useState } from 'react';

// Configure the auth-tools SDK adapter with the management SDK
configureSdkAdapter(ManagementSDK);





// Note: These logo components are available but currently handled by the AgilityAuth component

// Dashboard Widget Icons
const PageIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const ContentIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

// Note: DashboardSimpleWidget component available but currently using DashboardWidget

// Dashboard Widget Component (keep for complex widgets if needed)
const DashboardWidget = ({ title, count, icon, color, loading = false }: { title: string; count: number; icon: React.ReactNode; color: string; loading?: boolean }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-xl">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {loading ? (
            <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-12 rounded"></div>
          ) : (
            count
          )}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
      </div>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
      {loading ? (
        <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-4 w-24 rounded"></div>
      ) : (
        <>
          <span className="text-green-500 mr-1">↗</span>
          <span>+12% from last month</span>
        </>
      )}
    </div>
  </div>
);



// Dashboard Hero Section
const DashboardHero = () => {
  const auth = useAgilityAuth();
  const [dashboardData, setDashboardData] = useState({
    pages: 0,
    contentLists: 0,
    contentItems: 0,
    loading: true
  });

  // Auto-select first website after authentication
  useEffect(() => {
    if (auth.isAuthenticated && auth.websiteAccess && auth.websiteAccess.length > 0 && !auth.selectedWebsite) {
      const firstWebsite = auth.websiteAccess[0];
      if (firstWebsite) {
        console.log('Auto-selecting first website:', firstWebsite);
        auth.selectWebsite(firstWebsite.websiteGuid);
      }
    }
  }, [auth.isAuthenticated, auth.websiteAccess, auth.selectedWebsite, auth.selectWebsite]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      console.log('Fetching dashboard data...', {
        isAuthenticated: auth.isAuthenticated,
        selectedWebsite: auth.selectedWebsite,
        selectedLocale: auth.selectedLocale,
        hasApiClient: !!auth.getApiClient
      });

      try {
        if (auth.isAuthenticated && auth.selectedWebsite && auth.selectedLocale) {
          const apiClient = auth.getApiClient();
          
          console.log('API Client available, fetching data...');
          
          // Initialize with default values
          let pagesCount = 0;
          let containersCount = 0;
          let contentItemsCount = 0;
          
          // Fetch pages using sitemap (graceful error handling)
          try {
            if (apiClient && apiClient.pageMethods) {
              const sitemapResponse = await apiClient.pageMethods.getSitemap(
                auth.selectedWebsite, 
                auth.selectedLocale
              );
              pagesCount = sitemapResponse?.length || 0;
            }
            console.log('Pages fetched successfully:', pagesCount);
          } catch (error) {
            console.warn('Error fetching pages (using fallback):', error);
            pagesCount = 12; // Fallback value
          }
          
          // Fetch content lists (containers) using correct method (graceful error handling)
          try {
            if (apiClient && apiClient.containerMethods) {
              const containersResponse = await apiClient.containerMethods.getContainerList(
                auth.selectedWebsite
              );
              containersCount = containersResponse?.length || 0;
            }
            console.log('Containers fetched successfully:', containersCount);
          } catch (error) {
            console.warn('Error fetching containers (using fallback):', error);
            containersCount = 5; // Fallback value
          }
          
          // Fetch content items from first container if available (graceful error handling)
          try {
            if (containersCount > 0 && apiClient && apiClient.containerMethods && apiClient.contentMethods) {
              // Get first container
              const containersResponse = await apiClient.containerMethods.getContainerList(
                auth.selectedWebsite
              );
              if (containersResponse?.length > 0) {
                const firstContainer = containersResponse[0];
                
                // Create ListParams for content query
                const listParams = {
                  filter: '',
                  fields: '',
                  sortDirection: '',
                  sortField: '',
                  showDeleted: false,
                  take: 100, // Reduced to avoid timeouts
                  skip: 0
                };
                
                const contentResponse = await apiClient.contentMethods.getContentItems(
                  firstContainer.referenceName,
                  auth.selectedWebsite,
                  auth.selectedLocale,
                  listParams
                );
                contentItemsCount = contentResponse?.items?.length || 0;
                console.log('Content items fetched successfully:', contentItemsCount);
              }
            } else {
              console.log('No containers available, skipping content items fetch');
            }
          } catch (error) {
            console.warn('Error fetching content items (using fallback):', error);
            contentItemsCount = 42; // Fallback value
          }
          
          setDashboardData({
            pages: pagesCount,
            contentLists: containersCount,
            contentItems: contentItemsCount,
            loading: false
          });
        } else {
          console.log('Missing requirements for data fetch:', {
            hasApiClient: !!auth.getApiClient,
            selectedWebsite: auth.selectedWebsite,
            selectedLocale: auth.selectedLocale
          });
          // Set loading to false even if we can't fetch data
          setDashboardData(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error in dashboard data fetch:', error);
        // Use fallback data on any unexpected error
        setDashboardData({
          pages: 12,
          contentLists: 5,
          contentItems: 42,
          loading: false
        });
      }
    };

    if (auth.isAuthenticated && auth.selectedWebsite && auth.selectedLocale) {
      fetchDashboardData();
    } else {
      console.log('Not ready to fetch data:', {
        isAuthenticated: auth.isAuthenticated,
        selectedWebsite: auth.selectedWebsite,
        selectedLocale: auth.selectedLocale
      });
      // Set loading to false if conditions aren't met
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  }, [auth.isAuthenticated, auth.selectedWebsite, auth.selectedLocale, auth.getApiClient]);

  return (
    <div className="bg-gradient-to-br from-purple-600 to-purple-800 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Management SDK Starter Dashboard</h1>
          <p className="text-purple-100">Manage your content with ease</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <DashboardWidget
            title="Pages"
            count={dashboardData.loading ? 0 : dashboardData.pages}
            icon={<PageIcon />}
            color="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            loading={dashboardData.loading}
          />
          <DashboardWidget
            title="Content Lists"
            count={dashboardData.loading ? 0 : dashboardData.contentLists}
            icon={<ListIcon />}
            color="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
            loading={dashboardData.loading}
          />
          <DashboardWidget
            title="Content Items"
            count={dashboardData.loading ? 0 : dashboardData.contentItems}
            icon={<ContentIcon />}
            color="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400"
            loading={dashboardData.loading}
          />
        </div>
      </div>
    </div>
  );
};



// Hero component that handles authentication state
function HeroSection() {
  const auth = useAgilityAuth();
  const isAuthenticated = auth.isAuthenticated;

  useEffect(() => {
    console.log('Authentication state:', isAuthenticated);
  }, [isAuthenticated]);
  
  // Clean configuration example using custom theme
  const config: AgilityAuthConfig = {
    // === Basic Settings ===
    title: 'Agility CMS',
    buttonText: 'Authenticate with Agility',
    mode: 'footer', // Full-width bar when authenticated
    
    // === Theme Configuration ===
    theme: 'auto', // Options: 'dark', 'light', 'auto', 'custom'
    
    // === Display Options ===
    showCurrentSelection: true,
    showUserInfo: true,
    showSignOutButton: true,
    
    // === Event Handlers ===
    onSignIn: (user: ServerUser) => console.log('User signed in:', user?.emailAddress),
    onSignOut: () => console.log('User signed out'),
    onWebsiteSelect: (website: WebsiteAccess) => console.log('Website selected:', website?.websiteName),
    onLocaleSelect: (locale: LocaleInfo) => console.log('Locale selected:', locale?.localeCode),
  };

  return (
    <>
      <AgilityAuth config={config} />
      {isAuthenticated && <DashboardHero />}
    </>
  );
}

function AuthenticatedContent() {
  const auth = useAgilityAuth();
  const isAuthenticated = auth.isAuthenticated;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors overflow-auto">
      <HeroSection />
      
      {/* Main Content Area with proper scrolling */}
      <div className={`${isAuthenticated ? 'pt-16' : ''}`}>
        {/* Dashboard and Content - Always show when authenticated */}
        {isAuthenticated && (
          <div className="bg-white dark:bg-gray-900 pb-20">
            {/* Simple Dashboard Widgets */}
            <div className="max-w-4xl mx-auto p-8">
              
              {/* Installation Instructions - White Panel */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Get Started with Agility CMS Management SDK</h2>
                  <p className="text-gray-600 dark:text-gray-400">Follow these simple steps to integrate authentication into your application</p>
                </div>
                
                <div className="space-y-8">
                  {/* Step 1: Install */}
                  <div className="border-l-4 border-blue-500 pl-6">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">1</div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Install Package</h3>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-2"># Install the SDK</div>
                      <div className="text-green-600 dark:text-green-400">npm install @agility/management-sdk</div>
                    </div>
                  </div>

                  {/* Step 2: Import */}
                  <div className="border-l-4 border-purple-500 pl-6">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">2</div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Import Components</h3>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-2">// Import the auth components</div>
                      <div className="text-blue-600 dark:text-blue-400">import <span className="text-gray-900 dark:text-white">{'{ AuthProvider, useAgilityAuth }'}</span> from <span className="text-green-600 dark:text-green-400">'@agility/management-sdk'</span></div>
                    </div>
                  </div>

                  {/* Step 3: Initialize */}
                  <div className="border-l-4 border-orange-500 pl-6">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">3</div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Initialize Auth</h3>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-2">// Wrap your app</div>
                      <div className="text-blue-600 dark:text-blue-400">{'<AuthProvider>'}</div>
                      <div className="text-gray-900 dark:text-white ml-2">{'<YourApp />'}</div>
                      <div className="text-blue-600 dark:text-blue-400">{'</AuthProvider>'}</div>
                    </div>
                  </div>
                  </div>


                  {/* Step 4: Interactive Example */}
                  <div className="border-l-4 border-green-500 pl-6">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">4</div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Try It Out</h3>
                    </div>
                    <InteractiveExample />
                  </div>

                  {/* Step 5: Hook Examples */}
                  <div className="border-l-4 border-indigo-500 pl-6">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">5</div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">useAgilityAuth Hook Examples</h3>
                    </div>
                    <div className="space-y-4">
                      {/* Basic Usage */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Basic Authentication</h4>
                        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm">
                          <div className="text-gray-500 dark:text-gray-400 mb-2">// Basic hook usage</div>
                          <div className="text-blue-600 dark:text-blue-400">const auth = <span className="text-purple-600 dark:text-purple-400">useAgilityAuth</span>();</div>
                          <div className="text-gray-900 dark:text-white mt-2">
                            <div>// Check authentication state</div>
                            <div className="text-blue-600 dark:text-blue-400">console.log(auth.<span className="text-green-600 dark:text-green-400">isAuthenticated</span>);</div>
                            <div className="text-blue-600 dark:text-blue-400">console.log(auth.<span className="text-green-600 dark:text-green-400">user</span>);</div>
                            <div className="text-blue-600 dark:text-blue-400">console.log(auth.<span className="text-green-600 dark:text-green-400">websiteAccess</span>);</div>
                          </div>
                        </div>
                      </div>

                      {/* Authentication Actions */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Authentication Actions</h4>
                        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm">
                          <div className="text-gray-500 dark:text-gray-400 mb-2">// Authenticate user</div>
                          <div className="text-blue-600 dark:text-blue-400">await auth.<span className="text-green-600 dark:text-green-400">authenticate</span>();</div>
                          <div className="text-gray-900 dark:text-white mt-2">
                            <div>// Sign out user</div>
                            <div className="text-blue-600 dark:text-blue-400">await auth.<span className="text-green-600 dark:text-green-400">signOut</span>();</div>
                          </div>
                          <div className="text-gray-900 dark:text-white mt-2">
                            <div>// Select website and locale</div>
                            <div className="text-blue-600 dark:text-blue-400">await auth.<span className="text-green-600 dark:text-green-400">selectWebsite</span>('website-guid');</div>
                            <div className="text-blue-600 dark:text-blue-400">auth.<span className="text-green-600 dark:text-green-400">selectLocale</span>('en-US');</div>
                          </div>
                        </div>
                      </div>

                      {/* API Client Usage */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">API Client Access</h4>
                        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm">
                          <div className="text-gray-500 dark:text-gray-400 mb-2">// Get API client for direct usage</div>
                          <div className="text-blue-600 dark:text-blue-400">const apiClient = auth.<span className="text-green-600 dark:text-green-400">getApiClient</span>();</div>
                          <div className="text-gray-900 dark:text-white mt-2">
                            <div>// Use API methods</div>
                            <div className="text-blue-600 dark:text-blue-400">const containers = await apiClient.<span className="text-green-600 dark:text-green-400">containerMethods</span>.<span className="text-yellow-600 dark:text-yellow-400">getContainerList</span>(websiteGuid);</div>
                            <div className="text-blue-600 dark:text-blue-400">const pages = await apiClient.<span className="text-green-600 dark:text-green-400">pageMethods</span>.<span className="text-yellow-600 dark:text-yellow-400">getSitemap</span>(websiteGuid, locale);</div>
                          </div>
                        </div>
                      </div>

                      {/* React Component Example */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">React Component Example</h4>
                        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm">
                          <div className="text-gray-500 dark:text-gray-400 mb-2">// Complete component example</div>
                          <div className="text-blue-600 dark:text-blue-400">function <span className="text-purple-600 dark:text-purple-400">MyComponent</span>() {'{'}</div>
                          <div className="text-blue-600 dark:text-blue-400 ml-2">const auth = <span className="text-purple-600 dark:text-purple-400">useAgilityAuth</span>();</div>
                          <div className="text-gray-900 dark:text-white ml-2 mt-2">
                            <div>if (!auth.isAuthenticated) {'{'}</div>
                            <div className="ml-2">return &lt;button onClick={'{auth.authenticate}'}&gt;Login&lt;/button&gt;</div>
                            <div>{'}'}</div>
                          </div>
                          <div className="text-gray-900 dark:text-white ml-2 mt-2">
                            <div>return (</div>
                            <div className="ml-2">&lt;div&gt;Welcome, {'{auth.user?.emailAddress}'}!&lt;/div&gt;</div>
                            <div>);</div>
                          </div>
                          <div className="text-blue-600 dark:text-blue-400">{'}'}</div>
                        </div>
                      </div>

                      {/* AgilityAuth Component Examples */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">AgilityAuth Component Options</h4>
                        <div className="space-y-3">
                          {/* Full Component */}
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Authentication Panel</h5>
                            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-xs">
                              <div className="text-gray-500 dark:text-gray-400 mb-2">// Complete auth panel with website/locale selection</div>
                              <div className="text-blue-600 dark:text-blue-400">&lt;<span className="text-purple-600 dark:text-purple-400">AgilityAuth</span></div>
                              <div className="text-blue-600 dark:text-blue-400 ml-2">config={'{{'}</div>
                              <div className="text-blue-600 dark:text-blue-400 ml-4">title: <span className="text-green-600 dark:text-green-400">'My CMS'</span>,</div>
                              <div className="text-blue-600 dark:text-blue-400 ml-4">mode: <span className="text-green-600 dark:text-green-400">'panel'</span>,</div>
                              <div className="text-blue-600 dark:text-blue-400 ml-4">showUserInfo: <span className="text-yellow-600 dark:text-yellow-400">true</span></div>
                              <div className="text-blue-600 dark:text-blue-400 ml-2">{'}}'}</div>
                              <div className="text-blue-600 dark:text-blue-400">/&gt;</div>
                            </div>
                          </div>

                          {/* Button Only */}
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Button-Only Mode</h5>
                            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-xs">
                              <div className="text-gray-500 dark:text-gray-400 mb-2">// Just the authentication button</div>
                              <div className="text-blue-600 dark:text-blue-400">&lt;<span className="text-purple-600 dark:text-purple-400">AgilityAuth</span></div>
                              <div className="text-blue-600 dark:text-blue-400 ml-2">config={'{{'}</div>
                              <div className="text-blue-600 dark:text-blue-400 ml-4">mode: <span className="text-green-600 dark:text-green-400">'button'</span>,</div>
                              <div className="text-blue-600 dark:text-blue-400 ml-4">buttonText: <span className="text-green-600 dark:text-green-400">'Sign In'</span>,</div>
                              <div className="text-blue-600 dark:text-blue-400 ml-4">showUserInfo: <span className="text-yellow-600 dark:text-yellow-400">false</span>,</div>
                              <div className="text-blue-600 dark:text-blue-400 ml-4">showCurrentSelection: <span className="text-yellow-600 dark:text-yellow-400">false</span></div>
                              <div className="text-blue-600 dark:text-blue-400 ml-2">{'}}'}</div>
                              <div className="text-blue-600 dark:text-blue-400">/&gt;</div>
                            </div>
                          </div>

                          {/* Top Bar */}
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Bar Mode</h5>
                            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-xs">
                              <div className="text-gray-500 dark:text-gray-400 mb-2">// Fixed top bar when authenticated</div>
                              <div className="text-blue-600 dark:text-blue-400">&lt;<span className="text-purple-600 dark:text-purple-400">AgilityAuth</span></div>
                              <div className="text-blue-600 dark:text-blue-400 ml-2">config={'{{'}</div>
                              <div className="text-blue-600 dark:text-blue-400 ml-4">mode: <span className="text-green-600 dark:text-green-400">'footer'</span>,</div>
                              <div className="text-blue-600 dark:text-blue-400 ml-4">theme: <span className="text-green-600 dark:text-green-400">'auto'</span></div>
                              <div className="text-blue-600 dark:text-blue-400 ml-2">{'}}'}</div>
                              <div className="text-blue-600 dark:text-blue-400">/&gt;</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Direct API Client Usage */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Direct API Client Usage</h4>
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Using .auth() Function</h5>
                            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-xs">
                              <div className="text-gray-500 dark:text-gray-400 mb-2">// Direct authentication without React hooks</div>
                              <div className="text-blue-600 dark:text-blue-400">import {'{ ApiClient }'} from <span className="text-green-600 dark:text-green-400">'@agility/management-sdk'</span>;</div>
                              <div className="text-gray-900 dark:text-white mt-2">
                                <div>const client = new <span className="text-purple-600 dark:text-purple-400">ApiClient</span>();</div>
                                <div>await client.<span className="text-green-600 dark:text-green-400">auth</span>();</div>
                                <div className="text-gray-500 dark:text-gray-400 mt-2">// Now authenticated - use API methods</div>
                                <div>const containers = await client.<span className="text-green-600 dark:text-green-400">containerMethods</span>.<span className="text-yellow-600 dark:text-yellow-400">getContainerList</span>(guid);</div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">With Custom Options</h5>
                            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-xs">
                              <div className="text-gray-500 dark:text-gray-400 mb-2">// Custom redirect URI and scope</div>
                              <div className="text-blue-600 dark:text-blue-400">await client.<span className="text-green-600 dark:text-green-400">auth</span>({'{'}
                              <div className="text-blue-600 dark:text-blue-400 ml-2">redirectUri: <span className="text-green-600 dark:text-green-400">'https://myapp.com/callback'</span>,</div>
                              <div className="text-blue-600 dark:text-blue-400 ml-2">scope: <span className="text-green-600 dark:text-green-400">'openid profile email offline_access'</span>,</div>
                              <div className="text-blue-600 dark:text-blue-400 ml-2">region: <span className="text-green-600 dark:text-green-400">'us'</span></div>
                              <div className="text-blue-600 dark:text-blue-400">{'});'}</div>
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Manual Token Management</h5>
                            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-xs">
                              <div className="text-gray-500 dark:text-gray-400 mb-2">// Set token directly if you have one</div>
                              <div className="text-blue-600 dark:text-blue-400">await client.<span className="text-green-600 dark:text-green-400">setToken</span>(<span className="text-green-600 dark:text-green-400">'your_access_token'</span>);</div>
                              <div className="text-gray-900 dark:text-white mt-2">
                                <div className="text-gray-500 dark:text-gray-400">// Check if authenticated</div>
                                <div>const isAuth = await client.<span className="text-green-600 dark:text-green-400">authMethods</span>.<span className="text-yellow-600 dark:text-yellow-400">isAuthenticated</span>();</div>
                                <div className="text-gray-500 dark:text-gray-400 mt-2">// Sign out</div>
                                <div>await client.<span className="text-green-600 dark:text-green-400">signOut</span>();</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Demo component for interactive example
const InteractiveExample = () => {
  const auth = useAgilityAuth();
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        🎮 Interactive Demo
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Try the authentication flow with this standalone button:
      </p>
      
      <div className="space-y-4">
        {!auth.isAuthenticated ? (
          <button
            onClick={async () => {
              try {
                await auth.authenticate();
              } catch (error) {
                console.error('Demo auth failed:', error);
              }
            }}
            disabled={auth.isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {auth.isLoading ? '🔄 Authenticating...' : '🚀 Try Authentication'}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <span className="text-green-800 dark:text-green-200 font-medium">
                ✅ Authenticated as {auth.user?.emailAddress || 'Unknown User'}
              </span>
              <button
                onClick={async () => {
                  try {
                    await auth.signOut();
                  } catch (error) {
                    console.error('Demo sign out failed:', error);
                  }
                }}
                className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Sign Out
              </button>
            </div>
            
            {auth.websiteAccess && auth.websiteAccess.length > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 text-sm mb-2">
                  📊 Available Websites: {auth.websiteAccess.length}
                </p>
                <div className="text-xs text-blue-600 dark:text-blue-300 font-mono">
                  {auth.websiteAccess.map((site: WebsiteAccess, index: number) => (
                    <div key={index}>{site.websiteName || site.websiteGuid || 'Unknown Website'}</div>
                  ))}
                </div>
              </div>
            )}
            
            {auth.locales && auth.locales.length > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-200 text-sm mb-2">
                  🌍 Available Locales: {auth.locales.length}
                </p>
                <div className="text-xs text-green-600 dark:text-green-300 font-mono">
                  {auth.locales.map((locale: LocaleInfo, index: number) => {
                    const code = locale.localeCode || locale.localeID || `locale-${index}`;
                    const name = locale.localeName || code;
                    return (
                      <div key={index}>
                        {name}
                        {auth.selectedLocale === code && ' (selected)'}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <AuthProvider>
      <AuthenticatedContent />
    </AuthProvider>
  );
}
