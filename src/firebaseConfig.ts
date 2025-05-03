// Import the functions you need from the SDKs you need
import { initializeApp,getApps,getApp, FirebaseApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth,type Auth } from "firebase/auth";
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBaM-brr-d5SCEHF5aFbDUqbWhjGgp131o",
  authDomain: "teachsmart-62854.firebaseapp.com",
  projectId: "teachsmart-62854",
  storageBucket: "teachsmart-62854.firebasestorage.app",
  messagingSenderId: "885246331207",
  appId: "1:885246331207:web:2a52cd7e50e54d161ea462",
  measurementId: "G-JNSS02GHVH",
  recaptchaKey: "6LeOxywrAAAAAACn-0YKinJbHSqorOI_991mnOhxr"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth:Auth = getAuth(app);
const db:Firestore = getFirestore(app);
const storage:FirebaseStorage = getStorage(app);
const functions = getFunctions(app);

// Export Firebase services
export { auth, db, storage,functions };



// npm install -g firebase-tools <- after configuring above