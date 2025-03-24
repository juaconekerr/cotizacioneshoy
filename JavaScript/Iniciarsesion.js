// Importar las funciones necesarias del SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyChpFnp833eYISgcOBCmrmqb0a2iLy82WU",
    authDomain: "cotizaciones-hoy.firebaseapp.com",
    projectId: "cotizaciones-hoy",
    storageBucket: "cotizaciones-hoy.firebasestorage.app",
    messagingSenderId: "104412367418",
    appId: "1:104412367418:web:0962a9c13738e088610303",
    measurementId: "G-R5KRC3LZ70"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log("Firebase inicializado");

// Función para mostrar notificaciones
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Proceso de inicio de sesión
document.addEventListener('DOMContentLoaded', () => {
    const inicioSesionForm = document.getElementById('inicio-sesion-form');
    inicioSesionForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitar que los datos se envíen como parámetros de URL

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        console.log("Formulario enviado con los datos: ", { email, password });

        try {
            // Iniciar sesión con Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("Usuario autenticado con éxito: ", user);

            // Notificar al usuario que el inicio de sesión fue exitoso
            showNotification('Inicio de sesión exitoso', 'success');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);

            // Notificar al usuario que hubo un error en el inicio de sesión
            showNotification('Error al iniciar sesión: ' + error.message, 'error');
        }
    });
});