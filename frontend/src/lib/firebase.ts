import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCkCshvFrk4FiV5GQ411ejAhcO7j0WMJxw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "finot-27952.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "finot-27952",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "finot-27952.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1023696345468",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1023696345468:web:7dce36d128398815dd6cf9"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { 
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "BIweGretGW7ojWO_FwNixEBvFIkIdVvI_rv6MEbHRr8JsX_yoBQPXLKUcOndRGUoUTF5W8uS4JXbhXJhhKOCb6g"
      });
      return token;
    } else {
      console.warn("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { messaging };
