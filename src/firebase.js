// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC8W-Y8uodMNJAg0fl7SfooH3ysMmdqLCE",
  authDomain: "ezzomart-ae5a2.firebaseapp.com",
  projectId: "ezzomart-ae5a2",
  storageBucket: "ezzomart-ae5a2.firebasestorage.app",
  messagingSenderId: "689682195996",
  appId: "1:689682195996:web:84decab9e79d2f1fa4a1d9",
  measurementId: "G-8G33TCM4KD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default app; // Default export for app
export { auth }; // Named export for auth