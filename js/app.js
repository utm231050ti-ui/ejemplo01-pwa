
// Obtenemos la URL del servidor
var url = window.location.href;

// Ubicación del Service Worker
var ubicacionSw = './sw.js';

// Validamos localhost
if (url.includes('localhost')) {
    ubicacionSw = '/sw.js';
}

if ('serviceWorker' in navigator) {

    navigator.serviceWorker.register(ubicacionSw)
        .then(registro => {
            console.log('Service Worker registrado correctamente');
        })
        .catch(error => {
            console.log('Error al registrar:', error);
        });

}
