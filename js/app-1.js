if (navigator.serviceWorker) {
    navigator.serviceWorker.register("sw.js");
}

if (window.caches) {
    caches.open('espacio-1');

    caches.has("espacio-1").then(console.log);

    caches.open('cache-v1.1')
        .then(cache => {
            cache.addAll([
                '/index.html',
                '/css/style.css',
                '/img/main.jpg'
            ]).then(() => {
               /* cache.delete('/css/style.css');*/
               cache.put('index.html', new Responder('Index Modificado'));
            });
            //Leemos de consola el archivo index si existe
            cache.match('/index.html')
            .then(respuesta=>{
                respuesta.text().then(console.log);
            });
        });
        caches.keys().then(console.log);
}