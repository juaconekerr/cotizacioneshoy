// Import the functions you need from the SDKs you need
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

// Handle form submission
document.getElementById('registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorMessage = document.getElementById('error-message');

    if (password !== confirmPassword) {
        errorMessage.textContent = 'Las contraseñas no coinciden.';
        return;
    }

    try {
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // You can update the user profile with the name if needed
        errorMessage.textContent = '';
        alert('Usuario registrado con éxito: ' + user.email);
    } catch (error) {
        errorMessage.textContent = error.message;
    }
});