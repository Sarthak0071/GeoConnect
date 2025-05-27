// Service Worker for Nepal Tourist App
const CACHE_NAME = 'nepal-tourist-cache-v1';
const API_CACHE_NAME = 'nepal-tourist-api-cache-v1';

// Resources to cache on install
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/vendors~main.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheAllowlist = [CACHE_NAME, API_CACHE_NAME];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheAllowlist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
            return null;
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Helper to determine if a request should be cached
const shouldCacheRequest = (request) => {
  const url = new URL(request.url);
  
  // Only cache GET requests
  if (request.method !== 'GET') return false;
  
  // Cache API responses for tourist places
  if (url.pathname === '/api/genai-places' && url.searchParams.has('city')) {
    return true;
  }
  
  // Cache static assets
  if (
    request.destination === 'style' || 
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    return true;
  }
  
  return false;
};

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and requests that don't need caching
  if (event.request.method !== 'GET' || !shouldCacheRequest(event.request)) {
    return;
  }
  
  const url = new URL(event.request.url);
  const isApiRequest = url.pathname.startsWith('/api/');
  const cacheName = isApiRequest ? API_CACHE_NAME : CACHE_NAME;
  
  event.respondWith(
    caches.open(cacheName)
      .then(async (cache) => {
        // First, try the cache
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          // For API responses, implement a stale-while-revalidate strategy
          if (isApiRequest) {
            // Return cached version immediately
            const fetchPromise = fetch(event.request)
              .then(networkResponse => {
                // Update the cache with new response
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              })
              .catch(() => {
                // Network failed, fallback to cache (which we're already returning)
                console.log('Network fetch failed, using cached response');
              });
            
            // This is executed in the background
            event.waitUntil(fetchPromise);
          }
          
          return cachedResponse;
        }
        
        // No cache hit, fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Cache the new response for future
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            // For images, we could return a fallback
            if (event.request.destination === 'image') {
              return caches.match('/fallback-image.png');
            }
            
            // Let the error propagate for other resources
            throw error;
          });
      })
  );
});

// Handle API caching specially
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_API_CACHE') {
    event.waitUntil(
      caches.delete(API_CACHE_NAME)
        .then(() => {
          return self.clients.matchAll();
        })
        .then((clients) => {
          clients.forEach(client => {
            client.postMessage({
              type: 'API_CACHE_CLEARED'
            });
          });
        })
    );
  }
}); 