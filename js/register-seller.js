// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { loader } from './loader.js'; 



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7eaM6HrHalV-wcG-I9_RZJRwDNhin2R0",
  authDomain: "project-gaia1.firebaseapp.com",
  projectId: "project-gaia1",
  storageBucket: "project-gaia1.firebasestorage.app",
  messagingSenderId: "832122601643",
  appId: "1:832122601643:web:1ab91b347704174f52b7ee",
  measurementId: "G-DX2L33NH4H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

//registerhandler

document.getElementById('sellerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Read values from the form (IDs must match the HTML)
    const shopname = document.getElementById('shop-name')?.value.trim() || '';
    const username = document.getElementById('username')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const password = document.getElementById('password')?.value.trim() || '';
    const shopaddress = document.getElementById('shop-address')?.value.trim() || '';

    // Basic validation
    if (!shopname || !username || !email || !password || !shopaddress) {
        alert('Please fill in all required fields.');
        return;
    }

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    if (password.length < 6) {
        alert('Password should be at least 6 characters long.');
        return;
    }

    try {
        // Show loader before starting registration
        await loader.withLoader(async () => {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store user data in Firestore, including the auth UID
            await setDoc(doc(db, "user-seller", user.uid), {
                uid: user.uid,
                username: username,
                email: email,
                shopname: shopname,
                shopaddress: shopaddress,
                role: "seller",
                createdAt: new Date()
            });

            alert('Seller signed up successfully! Redirecting to login page...');
            document.getElementById('sellerForm').reset();
            window.location.href = "index.html"; // Redirect to login page
        }, "Registering seller account...");
        // Loader will hide automatically after withLoader finishes
    } catch (error) {
        // Hide loader if error occurs (withLoader handles this)
        console.error('Error signing up:', error.message);
        alert('Error signing up: ' + error.message);
    }
});
