// firebase-config.js

// Importa las funciones que necesitas de los SDK de Firebase.
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyChpFnp833eYISgcOBCmrmqb0a2iLy82WU",
  authDomain: "cotizaciones-hoy.firebaseapp.com",
  projectId: "cotizaciones-hoy",
  storageBucket: "cotizaciones-hoy.firebasestorage.app",
  messagingSenderId: "104412367418",
  appId: "1:104412367418:web:0962a9c13738e088610303",
  measurementId: "G-R5KRC3LZ70"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
const db = getFirestore(app);

export { db };
