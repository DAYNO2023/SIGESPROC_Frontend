importScripts(
  'https://www.gstatic.com/firebasejs/9.8.0/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.8.0/firebase-messaging-compat.js',
);

firebase.initializeApp({
  apiKey: "AIzaSyCAaNdHOmvdFqSbskgD9PF575smo0mYSCE",
        authDomain: "sigesproc-7mageneracion.firebaseapp.com",
        projectId: "sigesproc-7mageneracion",
        storageBucket: "sigesproc-7mageneracion.appspot.com",
        messagingSenderId: "816993708998",
        appId: "1:816993708998:web:28bc523c1136a7ef15a0c7",
        measurementId: "G-BXHLQ2P9XR"
});

// const messaging = firebase.messaging();

// Escucha cuando se recibe la notificación push
self.addEventListener('push', function(event) {
    const data = event.data.json();
    const title = data.notification.title;
    const options = {
        body: data.notification.body,
        icon: data.notification.icon || 'assets/demo/images/logo.png',  // Agregar un ícono personalizado
        badge: data.notification.badge || 'assets/demo/images/disenoactualizado.png',
     //   image: d ata.notification.image || 'assets/demo/images/R.jpg',  // Imagen grande en la notificación
        vibrate: [200, 100, 200],  // Vibración personalizada
        data: {
            click_action: data.data.click_action // URL a abrir al hacer clic
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Manejo del evento de clic en la notificación
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Cerrar la notificación cuando se hace clic

  event.waitUntil(
      clients.openWindow(event.notification.data.click_action) // Abrir la URL especificada en el click_action
  );
});
