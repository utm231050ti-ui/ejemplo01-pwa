
/*En todas las estrategias, el primer paso es subir a cache archivos
elegidos como necesarios, la elección depende del proyecto y sus necesidades
de carga sin conexión a interner*/ 

//CONSTANTES DE ALMACENAMIENTO CACHE
const CACHE ='cache-2';
const CACHE_DINAMICO ='dinamico-1';
const CACHE_ESTATICO ='estatico-1';
const CACHE_INMUTABLE ='inmutable-1';


/***********************INSTALACIÓN ************************
Indicamos que durante el proceso de instalación se registren 
los archivos base en cache acorde a su tipo
************************************************************/

self.addEventListener('install', evento=>{
    /*Promesa que crea el proceso de creación del espacio 
    en cache y agrega los archivos necesarios para cargar nuestra
    aplicación*/
    const cacheBase =caches.open(CACHE)
        .then(cache=>{
            return cache.addAll([
                '/',
                '/index.html',
                '/css/style.css',
                '/img/main.jpg',
                '/js/app.js',
                '/img/no-img.jpeg',
                'pages/offline.html'
            ]);
        });

        //Separamos los archivos que no se modificarán en un espacio de cache inmutable
        const cacheInmutable =  caches.open(CACHE_INMUTABLE)
            .then(cache=>{
                cache.add('https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css');
            });
       
            //Indicamos que la instalación espere hasta que las promesas se cumplan
        evento.waitUntil(Promise.all([cacheBase, cacheInmutable]));
});
self.addEventListener('activate', evento =>{
    const respuesta=caches.keys().then(keys =>{
        keys.forEach(key =>{
            if(key !== CACHE && key.includes('cache')){
                return caches.delete(key);
            }
        });
    });
    evento,waitUntil(respuesta);
});


/******************* FUNCIÓN DE LIMPIEZA DE CACHE ********************
/*Debemos mantener un número limitado e archivos para no sobrepasar el
espacio de almacenamiento cache, por ello se crea está función.
**********************************************************************/

//recibimos el nombre del espacio de cache a limpiar y el número de archivos permitido
function limpiarCache(nombreCache, numeroItems){
    //abrimos el cache
    caches.open(nombreCache)
        .then(cache=>{
            //recuperamos el arreglo de archivos existentes en el espacio de cache
            return cache.keys()
                .then(keys=>{
                    //si el número de archivos supera el limite permitido
                    if (keys.length>numeroItems){
                        //eliminamos el más antiguo y repetimos el proceso
                        cache.delete(keys[0])
                            .then(limpiarCache(nombreCache, numeroItems));
                    }
                });
        });
}


/************************ ESTRATEGÍA 2  *****************************
                  CACHE WITH NETWORK FALLBACK
Este modo de manejar el cache, implica que cuando se realiza una petición, 
primero se busque en cache y si no existe se dirija a buscar en la web 
(directamente en el servidor).
***********************************************************************/

self.addEventListener('fetch', evento =>{
    const respuesta=caches.match(evento.request)
    .then(res=>{
        //si el archivo existe en cache retórnalo
        if (res) return res;
       //si no existe deberá ir a la web
        //Imprimimos en consola para saber que no se encontro en cache
        console.log('No existe', evento.request.url);
    
        //Procesamos la respuesta a la petición localizada en la web
        return fetch(evento.request)
        .then(resWeb=>{//el archivo recuperado se almacena en resWeb
            //se abre nuestro cache
            caches.open(CACHE_DINAMICO)
                .then(cache=>{
                    //se sube el archivo descargado de la web
                    cache.put(evento.request,resWeb);
                     /*Mandamos llamar la limpieza al cargar un nuevo archivo
                     estamos indicando que se limpiará el cache dinamico y que 
                     solo debe haber 2 archivos*/
                     limpiarCache(CACHE_DINAMICO,2);

                })
            //se retorna el archivo recuperado para visualizar la página
            return resWeb.clone();  
        });
})
.catch(err => {
    if(evento.request.headers.get('accept').includes('text/html')){
        return caches.match('/pages/offline.html');
    }
});
evento.respondWith(respuesta);


});