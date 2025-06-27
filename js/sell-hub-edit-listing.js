import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";

// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyC7eaM6HrHalV-wcG-I9_RZJRwDNhin2R0",
    authDomain: "project-gaia1.firebaseapp.com",
    projectId: "project-gaia1",
    storageBucket: "project-gaia1.firebasestorage.app",
    messagingSenderId: "832122601643",
    appId: "1:832122601643:web:1ab91b347704174f52b7ee",
    measurementId: "G-DX2L33NH4H"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



// Helper: Get listing ID from URL (?id=...)
function getListingIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Populate form fields with fetched data
function populateEditForm(data) {
    if (!data) return;
    const form = document.getElementById('editListingForm');
    if (!form) return;

    // Product Name
    const nameInput = form.querySelector('#product-name');
    if (nameInput) nameInput.value = data.productName || data.product_name || '';

    // Product Description
    const descInput = form.querySelector('#product-description');
    if (descInput) descInput.value = data.productDescription || data.product_description || '';

    // Category
    const categoryInput = form.querySelector('#category');
    if (categoryInput) categoryInput.value = data.category || '';

    // Size
    const sizeInput = form.querySelector('#size');
    if (sizeInput) sizeInput.value = data.size || data.garmentSize || '';

    // Rent Price
    const rentInput = form.querySelector('#rent-price');
    if (rentInput) rentInput.value = data.rentPrice || '';

    // Show current photos if available
    const currentPhotosDiv = document.getElementById('current-photos');
    if (currentPhotosDiv) {
        currentPhotosDiv.innerHTML = '';
        const images = data.photos || data.images || [];
        if (Array.isArray(images)) {
            images.forEach(url => {
                const img = document.createElement('img');
                img.src = url;
                img.className = "h-20 w-20 object-cover rounded border";
                currentPhotosDiv.appendChild(img);
            });
        }
    }
}

// Fetch listing data from Firestore
async function fetchListingDataAndPopulate() {
    const listingId = getListingIdFromUrl();
    if (!listingId) {
        alert('No listing ID provided.');
        return;
    }
    
    const docRef = doc(db, "listed_items", listingId);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            populateEditForm(docSnap.data());
        } else {
            alert('Listing not found.');
        }
    } catch (err) {
        console.error('Error fetching listing:', err);
        alert('Failed to fetch listing data.');
    }
}

// Run on page load
window.addEventListener('DOMContentLoaded', fetchListingDataAndPopulate);