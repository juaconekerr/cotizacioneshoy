// Importar las funciones necesarias del SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

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
const db = getFirestore(app);

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

// Proceso de registro
document.addEventListener('DOMContentLoaded', () => {
    const registroForm = document.getElementById('registro-form');
    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitar que los datos se envíen como parámetros de URL

        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        console.log("Formulario enviado con los datos: ", { nombre, email, password });

        try {
            // Registrar al usuario en Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("Usuario creado con éxito: ", user);

            // Guardar los datos adicionales del usuario en Firestore
            await setDoc(doc(db, 'usuarios', user.uid), {
                nombre: nombre,
                email: email,
                uid: user.uid
            });

            console.log("Datos del usuario guardados en Firestore");

            // Notificar al usuario que el registro fue exitoso
            showNotification('Usuario registrado con éxito', 'success');
        } catch (error) {
            console.error('Error al registrar usuario:', error);

            // Notificar al usuario que hubo un error en el registro
            showNotification('Error al registrar usuario: ' + error.message, 'error');
        }
    });
});