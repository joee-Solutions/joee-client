const CACHE_NAME = 'joee-offline-v1';
const STATIC_CACHE = 'joee-static-v1';
const API_CACHE = 'joee-api-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/offline',
  '/assets/auth/authbg.jpeg',
  '/assets/logo/logo.png',
  '/assets/imagePlaceholder.png',
  '/assets/orgPlaceholder.png',
  '/assets/profile.png',
  '/assets/doctorFemale.png',
  '/assets/doctorMale.png',
  '/assets/nurse.png',
  '/assets/labAttendant.png'
];

// API endpoints that should be cached
const CACHEABLE_APIS = [
  '/api/patients',
  '/api/employees',
  '/api/departments',
  '/api/appointments',
  '/api/organizations',
  '/api/schedules'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_FILES);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE && cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - handle offline requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static file requests
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// Handle API requests with offline fallback
async function handleApiRequest(request) {
  try {
    // Try to fetch from network first
    const response = await fetch(request);
    
    // Cache successful GET requests
    if (request.method === 'GET' && response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    
    // Try to get from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API calls
    if (request.method === 'GET') {
      return new Response(JSON.stringify({
        error: 'offline',
        message: 'You are offline. Data may be outdated.',
        timestamp: new Date().toISOString()
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For non-GET requests, queue them for later
    return new Response(JSON.stringify({
      error: 'offline',
      message: 'Request queued for when you come back online',
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle static file requests
async function handleStaticRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/offline');
    }
    
    throw error;
  }
}

// Background sync for queued requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncQueuedRequests());
  }
});

// Sync queued requests when back online
async function syncQueuedRequests() {
  try {
    const db = await openDB('joee-offline', 1);
    const queuedRequests = await db.getAll('queuedRequests');
    
    for (const queuedRequest of queuedRequests) {
      try {
        const response = await fetch(queuedRequest.url, {
          method: queuedRequest.method,
          headers: queuedRequest.headers,
          body: queuedRequest.body
        });
        
        if (response.ok) {
          await db.delete('queuedRequests', queuedRequest.id);
        }
      } catch (error) {
        console.error('Failed to sync request:', queuedRequest, error);
      }
    }
  } catch (error) {
    console.error('Error syncing queued requests:', error);
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Joee',
    icon: '/assets/logo/logo.png',
    badge: '/assets/logo/logo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Joee Healthcare', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
}); 