// Obtenemos la URL del servidor
var url = window.location.href;

// Definimos dónde se encuentra nuestro sw.js
var ubicacionSw = '/ejemplo1-pwa/sw.js';

// Validamos si estamos trabajando en localhost
if (url.includes('localhost')) {
    ubicacionSw = '/sw.js';
}

// Registramos el Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(ubicacionSw)
        .then(registro => {
            console.log('Service Worker registrado correctamente');
        })
        .catch(error => {
            console.log('Error al registrar Service Worker:', error);
        });
}