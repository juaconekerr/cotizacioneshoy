// Importa las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

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
const auth = getAuth(app);

// Obtén el formulario y el elemento de notificación
const registroForm = document.getElementById('registro-form');
const notification = document.getElementById('notification');

// Función para mostrar notificaciones
function showNotification(message, type) {
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = 'block';
}

// Escucha el evento submit del formulario
registroForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Evita que se recargue la página

  // Obtén los valores del formulario
  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Crea el usuario con correo electrónico y contraseña
  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Registro exitoso
    const user = userCredential.user;
    console.log('Usuario registrado:', user);
    showNotification('Registro exitoso', 'success');
    // Redirige al usuario a la página de inicio o a donde desees
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000); // Redirige después de 2 segundos
})
    .catch((error) => {
      // Maneja los errores
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Error al registrar usuario:', errorCode, errorMessage);
      showNotification(errorMessage, 'error');
    });
});