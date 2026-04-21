// ────────────────────────────────────────────────────────────────────────────
// FIREBASE CONFIG — Replace the values below with YOUR Firebase project's
// config. See README.md for step-by-step instructions.
//
// If you leave this file as-is, the app will run in SOLO MODE (no sync).
// ────────────────────────────────────────────────────────────────────────────

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDV-x32I0SyLiA1Sphp4a2lgjYMCKzwAeg",
  authDomain: "codeasehg.firebaseapp.com",
  databaseURL: "https://codeasehg-default-rtdb.firebaseio.com",
  projectId: "codeasehg",
  storageBucket: "codeasehg.firebasestorage.app",
  messagingSenderId: "898513503272",
  appId: "1:898513503272:web:4d6e6a9673f24281d5e11d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);