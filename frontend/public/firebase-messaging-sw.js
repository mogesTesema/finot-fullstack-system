// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
const firebaseConfig = {
  apiKey: "AIzaSyCkCshvFrk4FiV5GQ411ejAhcO7j0WMJxw",
  authDomain: "finot-27952.firebaseapp.com",
  projectId: "finot-27952",
  storageBucket: "finot-27952.firebasestorage.app",
  messagingSenderId: "1023696345468",
  appId: "1:1023696345468:web:7dce36d128398815dd6cf9"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.log("Firebase SW initialization failed: ", error);
}
