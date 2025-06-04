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

// Login handler for sellers only
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const sellerQuery = query(collection(db, 'user-seller'), where('username', '==', username));

    getDocs(sellerQuery)
        .then((sellerSnapshot) => {
            if (sellerSnapshot.empty) {
                throw new Error('No seller found with that username.');
            }

            const userDoc = sellerSnapshot.docs[0];
            const email = userDoc.data().email;

            return setPersistence(auth, browserLocalPersistence)
              .then(() => signInWithEmailAndPassword(auth, email, password))
              .then((userCredential) => {
                  console.log('Seller signed in:', userCredential.user);
                  window.location.href = '/project_gaia1/src/seller-side/seller-hub-main.html';
                  alert('Sign-in successful!');
              });
        })
        .catch((error) => {
            console.error('Error during seller sign-in:', error.message);
            alert('Sign-in failed: ' + error.message);
        });
});