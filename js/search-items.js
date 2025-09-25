// Import Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
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
const db = getFirestore(app);

// Search functionality using current cards in the DOM
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

function filterCards() {
    const searchValue = searchInput.value.trim().toLowerCase();
    const cards = document.querySelectorAll('#listing-container > div');
    let matchFound = false;
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchValue)) {
            card.style.display = '';
            matchFound = true;
        } else {
            card.style.display = 'none';
        }
    });
    // Fallback message if no match found
    let fallback = document.getElementById('no-match-message');
    if (!matchFound) {
        if (!fallback) {
            fallback = document.createElement('div');
            fallback.id = 'no-match-message';
            fallback.className = 'text-gray-500 text-center my-4';
            fallback.textContent = 'No listings found.';
            document.getElementById('listing-container').appendChild(fallback);
        } else {
            fallback.style.display = '';
        }
    } else if (fallback) {
        fallback.style.display = 'none';
    }
}

if (searchButton) {
    searchButton.addEventListener('click', filterCards);
}
if (searchInput) {
    searchInput.addEventListener('input', filterCards);
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            filterCards();
        }
    });
}



