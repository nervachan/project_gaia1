// Firebase Firestore & Auth imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
const db = getFirestore();
const auth = getAuth();

// Login handler
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
            let userDoc = null;
            let userType = null; // Declare the userType variable here

            // Check if the user exists in either collection
            if (!buyerSnapshot.empty) {
                userDoc = buyerSnapshot.docs[0];
                userType = "buyer"; // User is a buyer
            } else if (!sellerSnapshot.empty) {
                userDoc = sellerSnapshot.docs[0];
                userType = "seller"; // User is a seller
            }

            // If no user is found, throw an error
            if (!userDoc) {
                throw new Error('No user found with that username.');
            }

            const email = userDoc.data().email;

            // Set persistence to LOCAL before signing in
            return setPersistence(auth, browserLocalPersistence)
              .then(() => {
                // Sign in with email and password
                return signInWithEmailAndPassword(auth, email, password);
              })
              .then((userCredential) => {
                  console.log('User signed in:', userCredential.user);

                  // Redirect based on user type (buyer or seller)
                  if (userType === "buyer") {
                    window.location.href = 'buyer-side/buyer-login.html'; // Redirect to buyer login page
                  } else if (userType === "seller") {
                    window.location.href = 'seller-side/seller-hub-main.html'; // Redirect to seller hub page
                  }

                  alert('Sign-in successful!');
              })
              .catch((error) => {
                  console.error('Error during sign-in:', error.message);
                  alert('Sign-in failed: ' + error.message);
              });
        })
        .catch((error) => {
            console.error('Error during sign-in:', error.message);
            alert('Sign-in failed: ' + error.message);
        });
});
