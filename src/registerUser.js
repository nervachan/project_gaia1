// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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

async function addData(username, email, password) {
    try {
        const docRef = await addDoc(collection(db, "users"), {
            username: username,
            email: email,
            password: password // Note: Storing passwords in plain text is not recommended!
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registrationForm");
    const successModal = document.getElementById("successModal");
    const redirectToLoginButton = document.getElementById("redirectToLogin");

    form.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent the default form submission

        // Get the input values
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Call addData with the input values
        addData(username, email, password);
    });

    // Function to show the modal
    function showModal() {
        successModal.style.display = "block";
    }

    // Event listener for the redirect button
    redirectToLoginButton.addEventListener("click", () => {
        window.location.href = "login.html"; // Change this to your actual login page URL
    });

    // Modify the addData function to show the modal on success
    async function addData(username, email, password) {
        try {
            const docRef = await addDoc(collection(db, "users"), {
                username: username,
                email: email,
                password: password // Note: Storing passwords in plain text is not recommended!
            });
            console.log("Document written with ID: ", docRef.id);
            showModal(); // Show the modal on successful registration
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }
});