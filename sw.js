
/* En todas las estrategias, el primer paso es subir a cache
archivos elegidos como necesarios */

// CONSTANTES DE ALMACENAMIENTO CACHE
const CACHE = 'cache-2';
const CACHE_DINAMICO = 'dinamico-1';
const CACHE_ESTATICO = 'estatico-1';
const CACHE_INMUTABLE = 'inmutable-1';


/*********************** INSTALACIÓN ************************/

self.addEventListener('install', evento => {

    const cacheBase = caches.open(CACHE)
        .then(cache => {
            return cache.addAll([
                './index.html',
                './css/style.css',
                './img/main.jpg',
                './js/app.js',
                './img/no-img.jpeg',
                './pages/offline.html'
            ]);
        });

    // Cache inmutable
    const cacheInmutable = caches.open(CACHE_INMUTABLE)
        .then(cache => {
            return cache.add(
                'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
            );
        });

    evento.waitUntil(
        Promise.all([cacheBase, cacheInmutable])
    );
});


/*********************** ACTIVACIÓN ************************/

self.addEventListener('activate', evento => {

    const respuesta = caches.keys().then(keys => {
        return Promise.all(
            keys.map(key => {
                if (
                    key !== CACHE &&
                    key !== CACHE_DINAMICO &&
                    key !== CACHE_INMUTABLE &&
                    key !== CACHE_ESTATICO
                ) {
                    return caches.delete(key);
                }
            })
        );
    });

    evento.waitUntil(respuesta);
});


/******************* FUNCIÓN DE LIMPIEZA DE CACHE ********************/

function limpiarCache(nombreCache, numeroItems) {

    caches.open(nombreCache)
        .then(cache => {

            return cache.keys()
                .then(keys => {

                    if (keys.length > numeroItems) {

                        cache.delete(keys[0])
                            .then(() => {
                                limpiarCache(nombreCache, numeroItems);
                            });

                    }

                });

        });

}


/******************* ESTRATEGIA 2 *****************************
          CACHE WITH NETWORK FALLBACK
***************************************************************/

self.addEventListener('fetch', evento => {

    const respuesta = caches.match(evento.request)
        .then(res => {

            // Si existe en cache, lo retorna
            if (res) return res;

            console.log('No existe', evento.request.url);

            // Si no existe, busca en internet
            return fetch(evento.request)
                .then(resWeb => {

                    // Guarda los archivos descargados
                    return caches.open(CACHE_DINAMICO)
                        .then(cache => {

                            cache.put(
                                evento.request,
                                resWeb.clone()
                            );

                            limpiarCache(CACHE_DINAMICO, 2);

                            return resWeb;
                        });

                });

        })
        .catch(err => {

            // Si no hay internet, muestra la página offline
            if (
                evento.request.headers.get('accept') &&
                evento.request.headers.get('accept').includes('text/html')
            ) {
                return caches.match('./pages/offline.html');
            }

        });

    evento.respondWith(respuesta);

});
