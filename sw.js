

/* En todas las estrategias, el primer paso es subir a cache archivos
elegidos como necesarios, la elección depende del proyecto y sus
necesidades de carga sin conexión a internet */

// CONSTANTES DE ALMACENAMIENTO CACHE
const CACHE = 'cache-2';
const CACHE_DINAMICO = 'dinamico-1';
const CACHE_ESTATICO = 'estatico-1';
const CACHE_INMUTABLE = 'inmutable-1';


/*********************** INSTALACIÓN ************************
Indicamos que durante el proceso de instalación se registren
los archivos base en cache acorde a su tipo
************************************************************/

self.addEventListener('install', evento => {

    const cacheBase = caches.open(CACHE)
        .then(cache => {
            return cache.addAll([
               // '/',
                'index.html',
                'css/style.css',
                'img/main.jpg',
                'js/app.js',
                'img/no-img.jpeg',
                'pages/offline.html',
            ]);
        });

    // Separamos los archivos que no se modificarán
    // en un espacio de cache inmutable
    const cacheInmutable = caches.open(CACHE_INMUTABLE)
        .then(cache => {
            return cache.add(
                'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
            ).catch(error => {
                console.warn('No se pudo guardar Bootstrap:', error);
            });
        });

    // Esperamos a que las promesas se cumplan
    evento.waitUntil(
        Promise.all([cacheBase, cacheInmutable])
    );

});


/*********************** ACTIVACIÓN ************************
Eliminamos las versiones anteriores de la cache
************************************************************/

self.addEventListener('activate', evento => {

    const respuesta = caches.keys()
        .then(keys => {

            return Promise.all(
                keys.map(key => {
                    if (key.startsWith('cache-') && key !== CACHE) {
                        return caches.delete(key);
                    }
                })
            );

        });

    evento.waitUntil(respuesta);

});


/******************* FUNCIÓN DE LIMPIEZA DE CACHE ********************
Debemos mantener un número limitado de archivos para no sobrepasar
el espacio de almacenamiento cache.
**********************************************************************/

function limpiarCache(nombreCache, numeroItems) {

    return caches.open(nombreCache)
        .then(cache => {

            return cache.keys()
                .then(keys => {

                    if (keys.length > numeroItems) {

                        return cache.delete(keys[0])
                            .then(() => {
                                return limpiarCache(nombreCache, numeroItems);
                            });

                    }

                });

        });

}


/************************ ESTRATEGIA 2 *****************************
                  CACHE WITH NETWORK FALLBACK

Primero buscamos en cache y si no existe se dirige a buscar
directamente en el servidor.
*********************************************************************/

self.addEventListener('fetch', evento => {

    // Solo manejamos peticiones GET
    if (evento.request.method !== 'GET') {
        return;
    }

    const respuesta = caches.match(evento.request)
        .then(res => {

            // Si el archivo existe en cache, lo retornamos
            if (res) return res;

            console.log('No existe en cache:', evento.request.url);

            // Si no existe, buscamos en la web
            return fetch(evento.request)
                .then(resWeb => {

                    // Guardamos una copia de la respuesta
                    if (resWeb && (resWeb.ok || resWeb.type === 'opaque')) {

                        const copia = resWeb.clone();

                        return caches.open(CACHE_DINAMICO)
                            .then(cache => {

                                return cache.put(evento.request, copia);

                            })
                            .then(() => {

                                // Limitamos la cantidad de archivos
                                return limpiarCache(CACHE_DINAMICO, 2);

                            })
                            .then(() => resWeb);

                    }

                    return resWeb;

                });

        })
        .catch(err => {

            console.log('Error de conexión:', err);

            const accept = evento.request.headers.get('accept') || '';

            // Si se solicita una página HTML, mostramos offline
            if (evento.request.mode === 'navigate' ||
                accept.includes('text/html')) {

                return caches.match('/pages/offline.html');

            }

        });

    evento.respondWith(respuesta);

});
