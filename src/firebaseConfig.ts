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
  apiKey: "AIzaSyAc0tJlynuOPlGKpqHEuL1OIVYxi70-dns",
  authDomain: "teachsmart-31be9.firebaseapp.com",
  projectId: "teachsmart-31be9",
  storageBucket: "teachsmart-31be9.firebasestorage.app",
  messagingSenderId: "543349576000",
  appId: "1:543349576000:web:a8ebc761eb557123ab6aa5",
  measurementId: "G-P5TVFLWR7E"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth:Auth = getAuth(app);
const db:Firestore = getFirestore(app);
const storage:FirebaseStorage = getStorage(app);
const functions = getFunctions(app);

// Export Firebase services
export { auth, db, storage,functions };



// npm install -g firebase-tools <- after configuring above