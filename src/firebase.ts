import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDiEim6_yQ6278odRNoz51GCe3FTTK9D5Y",
  authDomain: "hidraeletrica-e3aef.firebaseapp.com",
  projectId: "hidraeletrica-e3aef",
  storageBucket: "hidraeletrica-e3aef.firebasestorage.app",
  messagingSenderId: "528058761134",
  appId: "1:528058761134:web:d264bed4f29273a497923f",
  measurementId: "G-YLWXXVTGX2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export services
export const db = getFirestore(app);
export const auth = getAuth(app);
