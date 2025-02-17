// Import the necessary Firestore functions from the modular SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Firebase configuration
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

// Function to handle login
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Define queries for both collections
    const buyerQuery = query(collection(db, 'user-buyer'), where('username', '==', username));
    const sellerQuery = query(collection(db, 'user-seller'), where('username', '==', username));

    // Execute both queries simultaneously
    Promise.all([getDocs(buyerQuery), getDocs(sellerQuery)])
        .then(([buyerSnapshot, sellerSnapshot]) => {
            let userDoc;

            // Check if the user exists in either collection
            if (!buyerSnapshot.empty) {
                userDoc = buyerSnapshot.docs[0];
            } else if (!sellerSnapshot.empty) {
                userDoc = sellerSnapshot.docs[0];
            }

            // If no user is found, throw an error
            if (!userDoc) {
                throw new Error('No user found with that username.');
            }

            const email = userDoc.data().email;

            // Sign in with email and password
            return signInWithEmailAndPassword(auth, email, password);
        })
        .then((userCredential) => {
            // Signed in
            console.log('User signed in:', userCredential.user);
            alert('Sign-in successful!');
        })
        .catch((error) => {
            console.error('Error during sign-in:', error.message);
            alert('Sign-in failed: ' + error.message);
        });
});