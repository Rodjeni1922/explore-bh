const CACHE_NAME = 'bih-outdoor-guide-v2.0.0';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './favicon.png',
    './logo.png',
    './bih3.jpg',
    'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.0/dist/maplibre-gl.css',
    'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.0/dist/maplibre-gl.js',
    'https://unpkg.com/@turf/turf@6.5.0/turf.min.js'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    // Skip non-GET requests and MapTiler/GraphHopper API calls
    if (event.request.method !== 'GET' ||
        event.request.url.includes('maptiler.com') ||
        event.request.url.includes('graphhopper.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
            .catch(() => {
                // Offline fallback
                if (event.request.destination === 'document') {
                    return caches.match('./index.html');
                }

                // Return offline page or empty response
                return new Response('Offline', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                        'Content-Type': 'text/plain'
                    })
                });
            })
    );
});