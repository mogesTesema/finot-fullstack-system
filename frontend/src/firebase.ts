// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCkCshvFrk4FiV5GQ411ejAhcO7j0WMJxw",
    authDomain: "finot-27952.firebaseapp.com",
    projectId: "finot-27952",
    storageBucket: "finot-27952.firebasestorage.app",
    messagingSenderId: "1023696345468",
    appId: "1:1023696345468:web:7dce36d128398815dd6cf9",
    measurementId: "G-Z3E9HLX0FB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);