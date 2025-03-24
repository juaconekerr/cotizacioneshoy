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

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Proceso de registro
document.addEventListener('DOMContentLoaded', () => {
    const registroForm = document.getElementById('registro-form');
    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitar que los datos se envíen como parámetros de URL
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            await db.collection('usuarios').doc(user.uid).set({
                nombre: nombre,
                email: email,
                uid: user.uid
            });

            alert('Usuario registrado con éxito');
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            alert('Error al registrar usuario');
        }
    });
});