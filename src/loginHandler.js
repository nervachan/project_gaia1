// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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

 // Function to handle login
 async function handleLogin(username, password) {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.error("No matching user found.");
        alert("No matching user found.");
        return;
    }

    querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.password === password) {
            console.log("login success")
            alert("Login successful!");
            window.location.href = 'client-login.html';
            
        } else {
            console.error("Incorrect password.");
            alert("Incorrect password.");
            location.reload();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    form.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent the default form submission

        // Get the input values
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Call handleLogin with the input values
        handleLogin(username, password);
    });
});