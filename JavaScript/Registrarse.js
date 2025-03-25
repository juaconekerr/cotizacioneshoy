// Import the functions you need from the SDKs you need
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

// Initialize Firebase Auth and Firestore
const auth = getAuth();
const db = getFirestore();

// Function to show error messages
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Function to clear error messages
function clearError() {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
}

// Function to handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    clearError();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    // Validate input fields
    if (!name || !email || !password || !confirmPassword) {
        showError('Todos los campos son obligatorios.');
        return;
    }

    if (password !== confirmPassword) {
        showError('Las contraseñas no coinciden.');
        return;
    }

    if (password.length < 6) {
        showError('La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update user profile with name
        await updateProfile(user, { displayName: name });

        // Save user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            createdAt: new Date().toISOString()
        });

        alert('Usuario registrado con éxito: ' + user.email);
    } catch (error) {
        showError(error.message);
    }
}

// Attach event listener to the form
document.getElementById('registration-form').addEventListener('submit', handleFormSubmit);