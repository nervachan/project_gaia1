// Import the necessary Firebase functions
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC7eaM6HrHalV-wcG-I9_RZJRwDNhin2R0",
    authDomain: "project-gaia1.firebaseapp.com",
    projectId: "project-gaia1",
    storageBucket: "project-gaia1.firebasestorage.app",
    messagingSenderId: "832122601643",
    appId: "1:832122601643:web:1ab91b347704174f52b7ee",
    measurementId: "G-DX2L33NH4H"
  };

// Initialize Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore();

// Function to show the modal with listing details
async function showListingDetails(listingId) {
    const modal = document.getElementById('listing-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    try {
        // Fetch the document from Firestore
        const listingDoc = doc(db, 'listed items', listingId);
        const listingSnapshot = await getDoc(listingDoc);

        if (listingSnapshot.exists()) {
            const listing = listingSnapshot.data();
            modalTitle.innerText = listing.productName;
            modalContent.innerHTML = `
                <p>${listing.productDescription}</p>
                <p><strong>Category:</strong> ${listing.category}</p>
                <p><strong>Condition:</strong> ${listing.condition}</p>
                ${listing.image ? `<img src="${listing.image}" alt="${listing.productName}" class="w-full h-48 object-cover rounded-md mt-4">` : ''}
                ${listing.rentPrice ? `<p><strong>Rent Price:</strong> $${listing.rentPrice}</p>` : ''}
                ${listing.sellPrice ? `<p><strong>Selling Price:</strong> $${listing.sellPrice}</p>` : ''}
            `;
            modal.classList.remove('hidden'); // Show the modal
        } else {
            console.error("No listing found with the provided ID.");
        }
    } catch (error) {
        console.error("Error fetching listing details: ", error);
    }
}

// Add event listeners to all view details buttons
const viewDetailsButtons = document.querySelectorAll('.view-details');
viewDetailsButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const listingId = event.target.getAttribute('data-id');
        showListingDetails(listingId); // Show the modal with listing details
    });
});

// Close modal functionality
document.getElementById('close-modal').addEventListener('click', () => {
    const modal = document.getElementById('listing-modal');
    modal.classList.add('hidden'); // Hide the modal
});