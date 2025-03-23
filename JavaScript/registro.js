import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyChpFnp833eYISgcOBCmrmqb0a2iLy82WU",
    authDomain: "cotizaciones-hoy.firebaseapp.com",
    projectId: "cotizaciones-hoy",
    storageBucket: "cotizaciones-hoy.firebasestorage.app",
    messagingSenderId: "104412367418",
    appId: "1:104412367418:web:0962a9c13738e088610303",
    measurementId: "G-R5KRC3LZ70"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Obtener elementos del DOM
const registerForm = document.getElementById('register-form');
const registerSubmit = document.getElementById('register-submit');
const mensajeExito = document.getElementById('mensaje-exito');
const mensajeError = document.getElementById('mensaje-error');

// Función para mostrar un mensaje
function mostrarMensaje(tipo, mensaje) {
    const mensajeElemento = tipo === 'exito' ? mensajeExito : mensajeError;
    mensajeElemento.textContent = mensaje;
    mensajeElemento.style.display = 'block';
    setTimeout(() => {
        mensajeElemento.style.display = 'none';
    }, 5000);
}

// Función para validar el formulario de registro
function validarRegisterForm() {
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const nameInput = document.getElementById('register-name');
    const lastNameInput = document.getElementById('register-last-name');
    const emailError = document.getElementById('register-email-error');
    const passwordError = document.getElementById('register-password-error');
    const nameError = document.getElementById('register-name-error');
    const lastNameError = document.getElementById('register-last-name-error');
    let isValid = true;

    if (!nameInput.value.trim()) {
        nameError.textContent = 'Por favor, ingresa tu nombre.';
        nameInput.classList.add('invalid');
        isValid = false;
    } else {
        nameError.textContent = '';
        nameInput.classList.remove('invalid');
    }

    if (!lastNameInput.value.trim()) {
        lastNameError.textContent = 'Por favor, ingresa tu apellido.';
        lastNameInput.classList.add('invalid');
        isValid = false;
    } else {
        lastNameError.textContent = '';
        lastNameInput.classList.remove('invalid');
    }

    if (!emailInput.value.trim()) {
        emailError.textContent = 'Por favor, ingresa tu correo electrónico.';
        emailInput.classList.add('invalid');
        isValid = false;
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(emailInput.value.trim())) {
        emailError.textContent = 'Por favor, ingresa un correo electrónico válido.';
        emailInput.classList.add('invalid');
        isValid = false;
    } else {
        emailError.textContent = '';
        emailInput.classList.remove('invalid');
    }

    if (!passwordInput.value.trim()) {
        passwordError.textContent = 'Por favor, ingresa tu contraseña.';
        passwordInput.classList.add('invalid');
        isValid = false;
    } else if (passwordInput.value.length < 6) {
        passwordError.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        passwordInput.classList.add('invalid');
        isValid = false;
    } else {
        passwordError.textContent = '';
        passwordInput.classList.remove('invalid');
    }

    return isValid;
}

// Manejador para el registro
registerSubmit.addEventListener('click', (event) => {
    event.preventDefault();

    if (!validarRegisterForm()) {
        return;
    }

    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const name = document.getElementById('register-name').value;
    const lastName = document.getElementById('register-last-name').value;

    console.log('Datos a registrar:', { email, password, name, lastName }); // Agregado para debugging

    // Crear usuario con correo electrónico y contraseña
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Registro exitoso
            const user = userCredential.user;
            console.log('Usuario creado con éxito:', user); // Agregado para debugging

            // Actualizar el perfil del usuario con nombre y apellido
            updateProfile(user, {
                displayName: `${name} ${lastName}`,
            }).then(() => {
                console.log('Perfil de usuario actualizado:', user.displayName); // Agregado para debugging
                // Guardar datos adicionales en la base de datos
                const userRef = ref(db, 'users/' + user.uid);
                set(userRef, {
                    name: name,
                    lastName: lastName,
                    email: email,
                }).then(() => {
                    console.log('Datos de usuario guardados en la base de datos'); // Agregado para debugging
                     // Inicio de sesión automático después del registro
                    signInWithEmailAndPassword(auth, email, password)
                    .then(() => {
                        mostrarMensaje('exito', '¡Registro e inicio de sesión exitosos!');
                        registerForm.reset();
                        window.location.href = "index.html"; // Redirigir a la página principal
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        console.error("Error signing in after registration:", errorCode, errorMessage);
                        mostrarMensaje('error', "Error al iniciar sesión automáticamente: " + errorMessage);
                    });
                }).catch((error) => {
                    console.error("Error writing to database: ", error);
                    mostrarMensaje('error', 'Error al guardar los datos del usuario: ' + error.message);
                });
            }).catch((error) => {
                console.error("Error updating profile: ", error);
                mostrarMensaje('error', "Error al actualizar el perfil del usuario: " + error.message);
            });
        })
        .catch((error) => {
            // Error en el registro
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Error de registro:', errorCode, errorMessage);
            mostrarMensaje('error', 'Error de registro: ' + errorMessage);
        });
});
